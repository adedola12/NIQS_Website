"""
Surgical fixes to portraits that are ALREADY on the president's backdrop.

normalizePortraits.py re-shoots a portrait from its original photo. This script is
for the cases where that is not what you want:

  * The source photo was a tight head-and-shoulders crop, so after the face was
    scaled to match the president's the subject ran out of pixels before the
    bottom of the canvas — leaving a torso guillotined mid-chest and floating
    above bare backdrop. Re-running the pipeline cannot fix it: the missing
    torso was never photographed. (--extend-bottom)

  * The subject is centred on the face — which is what makes a grid of portraits
    line up — but sits so far off-axis in the body that the card reads lopsided,
    with a wedge of empty backdrop down one side. (--shift-x)

Both operate on the published composite, so nothing else about the portrait
changes: same matte, same face size, same eye line, same grain.

The backdrop plate is recovered from the published set itself. Every normalised
portrait carries the identical backdrop, so pixels that essentially all of them
agree on are backdrop by definition. Agreement alone is not enough — below
mid-chest every portrait has a subject, so there is nothing to agree on and a
surface fitted only to agreed pixels drifts by ~30/255 exactly where these fixes
need it. The rows a guillotined portrait leaves empty are the missing evidence,
so bare rows are harvested from each image too (a bare row is the one thing in
this frame that is horizontally symmetric). Fitted with even powers of x only —
the studio vignette is symmetric — that lands within ~1/255 of the real
backdrop across the whole canvas. --report prints the residuals; check them.

Usage:
  python retouchPortraits.py --plate-from <dirOfPublishedComposites> \
      <in.jpg> <out.jpg> [--extend-bottom] [--shift-x PX]
"""
import argparse, glob, os, sys

import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CANVAS_W, CANVAS_H = 960, 1200


# ─────────────────────────── backdrop ───────────────────────────

def build_plate(dirpath, report=False):
    """The shared studio backdrop, recovered from a set of published composites."""
    imgs = []
    for f in sorted(glob.glob(os.path.join(dirpath, '*.jpg')) +
                    glob.glob(os.path.join(dirpath, '*.png'))):
        im = Image.open(f).convert('RGB')
        if im.size == (CANVAS_W, CANVAS_H):
            imgs.append(np.asarray(im).astype(np.float32))
    if len(imgs) < 8:
        raise SystemExit(f'need at least 8 normalised {CANVAS_W}x{CANVAS_H} '
                         f'composites to recover the backdrop, found {len(imgs)}')

    stack = np.stack(imgs)
    truth = np.median(stack, axis=0)
    # Where the portraits disagree there is a subject; where they agree to within
    # JPEG noise, every one of them is showing bare backdrop.
    known = stack.std(axis=0).mean(axis=2) < 10

    # Below mid-chest nothing agrees, because every portrait has a body there.
    # But a row with no subject in it is left/right symmetric, and a row with one
    # is not — so any image that stops short of the bottom hands over the rows
    # the rest of the set cannot supply.
    bare = np.zeros(CANVAS_H, bool)
    for im in imgs:
        sym = np.abs(im - im[:, ::-1]).mean(axis=(1, 2)) < 3.0
        if sym.any():
            truth[sym] = im[sym]
            known[sym] = True
            bare |= sym

    ys, xs = np.mgrid[0:CANVAS_H, 0:CANVAS_W]
    u, v = xs / CANVAS_W - 0.5, ys / CANVAS_H

    def terms(x, y):
        # Even powers of x only: the studio vignette is symmetric about the
        # centre line, and saying so keeps the fit from inventing a tilt where
        # only the margins are observed.
        return np.stack([(x ** i) * (y ** j)
                         for i in (0, 2, 4, 6) for j in range(6)], axis=-1)

    A = terms(u[known], v[known])
    full = terms(u, v).reshape(-1, A.shape[-1])
    plate = np.zeros((CANVAS_H, CANVAS_W, 3))
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, truth[:, :, c][known], rcond=None)
        plate[:, :, c] = (full @ coef).reshape(CANVAS_H, CANVAS_W)

    if report:
        resid = np.abs(plate - truth).mean(axis=2)[known]
        print(f'   plate from {len(imgs)} composites: {known.mean():.0%} of the canvas '
              f'observed ({int(bare.sum())} bare rows); residual mean {resid.mean():.2f} '
              f'p99 {np.percentile(resid, 99):.2f}')
        if resid.mean() > 3:
            print('   WARNING: backdrop fit is loose — do not publish without looking')

    rng = np.random.default_rng(7)                 # match the pipeline's film grain
    return np.clip(plate + rng.normal(0, 1.6, plate.shape), 0, 255)


# ─────────────────────────── matte recovery ───────────────────────────

def recover_alpha(img, plate):
    """Alpha of the subject that was composited onto this plate."""
    diff = np.abs(img - plate).mean(axis=2)
    a = np.clip((diff - 8.0) / 14.0, 0, 1)

    solid = (a > 0.5).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(solid, 8)
    if n > 1:
        biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        solid = (labels == biggest).astype(np.uint8)

    # A dark tie or a shadowed lapel sits close to the backdrop in value and comes
    # back as a hole. Anything enclosed by the silhouette is the subject.
    filled = solid.copy()
    ff = np.zeros((CANVAS_H + 2, CANVAS_W + 2), np.uint8)
    cv2.floodFill(filled, ff, (0, 0), 1)
    solid = np.where(filled == 0, 1, solid).astype(np.uint8)
    solid = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))

    a = np.maximum(a, solid.astype(np.float64))
    return cv2.GaussianBlur(a, (0, 0), 1.0)


def subject_rows(alpha, min_frac=0.02):
    rows = (alpha > 0.5).sum(axis=1)
    hit = np.nonzero(rows > CANVAS_W * min_frac)[0]
    return (hit[0], hit[-1]) if len(hit) else (None, None)


# ─────────────────────────── operations ───────────────────────────

def extend_bottom(rgb, alpha, fade=0.45, spread=44.0):
    """Carry a guillotined torso down to the bottom edge.

    Copying the cut row straight down is the obvious move and it is wrong: real
    fabric varies as much down the frame as across it, so an exact copy reads as
    a barcode of vertical lines — measurably so, the extended band comes out with
    a fifth of the vertical roughness of the fabric above it. A lapel and tie
    stripe worst of all.

    So the row is carried down while being progressively blurred sideways and
    eased darker, which is what the lens and the backdrop's own falloff do to a
    torso below the light. Detail dissolves with depth instead of repeating, and
    the alpha softens with it so the silhouette does not run to the edge as two
    ruled lines. Sampled from a band above the cut — the cut row itself carries
    the matte's soft edge.
    """
    _, bottom = subject_rows(alpha)
    if bottom is None or bottom >= CANVAS_H - 2:
        return rgb, alpha, 0

    # Sample the last row of real fabric that is clear of the matte's soft edge,
    # and start there rather than below it. Averaging a band instead reads as a
    # step, because over 15 rows a lapel has moved.
    start = max(0, bottom - 3)
    src_rgb = cv2.GaussianBlur(rgb[start].reshape(1, -1, 3), (0, 0), 1.2, 1e-6)[0]
    src_a = alpha[start]
    n = CANVAS_H - start
    rgb, alpha = rgb.copy(), alpha.copy()
    rng = np.random.default_rng(11)

    for i in range(n):
        t = (i + 1) / n
        sigma = 0.4 + spread * t ** 1.5
        # Falls to a little over half brightness: a torso below the key light goes
        # to shadow, and a gentler fade leaves a bright shirt smeared across the
        # frame looking like a polished tabletop.
        level = 1.0 - fade * t ** 0.8
        row = cv2.GaussianBlur(src_rgb.reshape(1, -1, 3), (0, 0), sigma, 1e-6)[0]
        rgb[start + i] = np.clip(row * level + rng.normal(0, 1.6, row.shape), 0, 255)
        alpha[start + i] = cv2.GaussianBlur(
            src_a.reshape(1, -1), (0, 0), sigma * 0.5, 1e-6)[0]

    return rgb, alpha, n


def shift_x(rgb, alpha, dx):
    """Slide the subject sideways, revealing plate behind it."""
    M = np.float32([[1, 0, dx], [0, 1, 0]])
    rgb = cv2.warpAffine(rgb, M, (CANVAS_W, CANVAS_H),
                         flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    alpha = cv2.warpAffine(alpha, M, (CANVAS_W, CANVAS_H),
                           flags=cv2.INTER_LINEAR, borderValue=0)
    return rgb, alpha


def balance_report(alpha, label):
    cols = (alpha > 0.5).sum(axis=0)
    hit = np.nonzero(cols > CANVAS_H * 0.02)[0]
    if not len(hit):
        return
    l, r = hit[0], CANVAS_W - 1 - hit[-1]
    print(f'   {label}: left gap {l}px, right gap {r}px, centre {(hit[0] + hit[-1]) / 2 / CANVAS_W:.3f}')


# ─────────────────────────── main ───────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('infile')
    ap.add_argument('outfile')
    ap.add_argument('--plate-from', required=True,
                    help='directory of published 960x1200 composites')
    ap.add_argument('--extend-bottom', action='store_true')
    ap.add_argument('--fade', type=float, default=0.45,
                    help='how far the invented torso falls into shadow (0-1); a busy '
                         'suit needs more than a plain gown or the smear reads as gloss')
    ap.add_argument('--spread', type=float, default=44.0)
    ap.add_argument('--shift-x', type=int, default=0)
    ap.add_argument('--balance', action='store_true',
                    help='shift so the silhouette sits centred, ignoring --shift-x')
    args = ap.parse_args()

    plate = build_plate(args.plate_from, report=True)
    img = np.asarray(Image.open(args.infile).convert('RGB')).astype(np.float64)
    if img.shape[:2] != (CANVAS_H, CANVAS_W):
        raise SystemExit(f'{args.infile} is not {CANVAS_W}x{CANVAS_H}')

    alpha = recover_alpha(img, plate)
    balance_report(alpha, 'before')

    dx = args.shift_x
    if args.balance:
        cols = (alpha > 0.5).sum(axis=0)
        hit = np.nonzero(cols > CANVAS_H * 0.02)[0]
        dx = int(round(((CANVAS_W - 1 - hit[-1]) - hit[0]) / 2))
        print(f'   balance: shifting {dx:+d}px')
    if dx:
        img, alpha = shift_x(img, alpha, dx)

    if args.extend_bottom:
        img, alpha, n = extend_bottom(img, alpha, args.fade, args.spread)
        print(f'   extended torso {n}px to the bottom edge')

    balance_report(alpha, 'after ')

    a = alpha[:, :, None]
    comp = np.clip(img * a + plate * (1 - a), 0, 255).astype(np.uint8)
    Image.fromarray(comp).save(args.outfile, 'JPEG', quality=93, subsampling=0)
    print(f'   → {args.outfile}')


if __name__ == '__main__':
    main()
