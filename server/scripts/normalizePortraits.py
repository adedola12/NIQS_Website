"""
Re-shoots every chapter-exco portrait onto the president's studio backdrop.

  1. Reconstructs the president's brown backdrop by cutting him out of his own
     official portrait and fitting a smooth per-channel polynomial to whatever
     background pixels remain. The result is his real backdrop, not an approximation.
  2. For each portrait: matte the subject out, then scale and place it so the face
     lands exactly where the president's face lands on his canvas — same face size,
     same eye line. That is what makes a grid of them read as one shoot.

Pairs with exportChapterPortraits.js (pulls the sources down) and
applyChapterPortraits.js (writes the results back). Portraits it flags must be
looked at before publishing — see --help on the apply script's --skip.

Setup (one-off):
  pip install rembg onnxruntime opencv-python pillow numpy
  curl -Lo assets/yunet.onnx https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx
  # plus assets/president.jpg — the president's official portrait, whose backdrop
  # and face geometry every other portrait is matched to.
  # The rembg matting model (~176MB) downloads itself on first run.

Usage:
  python normalizePortraits.py <inputDir> <outDir> [--model u2net] [--alpha-matting]

<inputDir> holds <name>.jpg/.jpeg/.png source portraits; <outDir> gets 960x1200
JPEGs named <name>.jpg. Sources that already carry a cut-out (a PNG with a real
alpha channel) keep it rather than being re-matted here.

Note: --alpha-matting sounds like it should help and does the opposite here — it
shredded the mattes badly enough to decapitate subjects. Left in place because the
option is tempting; do not reach for it without checking the output.
"""
import argparse, os, sys, glob
import numpy as np
import cv2
from PIL import Image
from rembg import remove, new_session

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
HERE = os.path.dirname(os.path.abspath(__file__))

CANVAS_W, CANVAS_H = 960, 1200
ASSETS = os.environ.get('PORTRAIT_ASSETS', os.path.join(HERE, 'assets'))
PRESIDENT = os.path.join(ASSETS, 'president.jpg')
YUNET = os.path.join(ASSETS, 'yunet.onnx')


# ─────────────────────────── face geometry ───────────────────────────

def make_detector():
    return cv2.FaceDetectorYN.create(YUNET, '', (320, 320), 0.5, 0.3, 5000)


def detect_face(det, bgr):
    """Largest face as (cx, cy, w, h) plus eye-line y, or None.

    Every image is detected at the same working size, and that matters more than
    it looks: the whole pipeline scales a portrait by target_face_h / measured_fh,
    so a measurement bias becomes a framing error. YuNet is trained near 320px and
    its box drifts small on a multi-thousand-pixel input — feeding sources at their
    native size put faces up to three times over life size on the finished card,
    and how wrong depended on how big the photographer's file happened to be.
    Normalising the detector's input to ~640px on the long side keeps the reference
    and every subject on one ruler.
    """
    h, w = bgr.shape[:2]
    scale = min(2.0, 640 / max(w, h))
    img = cv2.resize(bgr, None, fx=scale, fy=scale) if scale != 1.0 else bgr
    det.setInputSize((img.shape[1], img.shape[0]))
    _, faces = det.detect(img)
    if faces is None or len(faces) == 0:
        return None
    f = max(faces, key=lambda r: r[2] * r[3])
    x, y, fw, fh = [v / scale for v in f[:4]]
    eye_y = ((f[5] + f[7]) / 2) / scale        # right-eye y, left-eye y
    return (x + fw / 2, y + fh / 2, fw, fh, eye_y)


# ─────────────────────────── matting ───────────────────────────

def clean_alpha(a):
    """Harden, de-speck, tighten and feather a subject mask."""
    # A pale gown against a pale backdrop comes back semi-transparent rather than
    # missing — the torso is there at alpha 40-120. Harden that to solid before
    # anything thresholds it away, keeping only genuine edges soft, or the body
    # gets deleted as if it had never been detected.
    a = np.clip((a.astype(np.float32) - 32) * (255.0 / 130.0), 0, 255).astype(np.uint8)

    # Keep only the largest blob — kills stray specks the matte leaves behind.
    binary = (a > 96).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary, 8)
    if n > 1:
        biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        a = np.where(labels == biggest, a, 0).astype(np.uint8)

    # Close pinholes, pull the edge in a touch so no light fringe from the old
    # background survives on the dark backdrop, then feather.
    a = cv2.morphologyEx(a, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    a = cv2.erode(a, np.ones((3, 3), np.uint8), iterations=1)
    a = cv2.GaussianBlur(a, (0, 0), 1.6)
    return a


def cutout(session, pil_img, alpha_matting=False):
    """RGBA subject with a cleaned, slightly feathered alpha."""
    if alpha_matting:
        out = remove(pil_img, session=session, alpha_matting=True,
                     alpha_matting_foreground_threshold=240,
                     alpha_matting_background_threshold=15,
                     alpha_matting_erode_size=11)
    else:
        out = remove(pil_img, session=session)
    rgba = np.asarray(out.convert('RGBA')).copy()
    rgba[:, :, 3] = clean_alpha(rgba[:, :, 3])
    return rgba


def load_subject(path, session, alpha_matting=False):
    """The subject as RGBA, preferring a cut-out the photographer already made.

    A pack shot to spec arrives as PNGs with the background already knocked out
    by whoever lit the shoot — a far better matte than rembg infers from the
    flattened result, and it costs nothing to use. So: if a source carries a real
    alpha channel, trust it and only clean the edge. Everything else still gets
    matted here.

    "Real" means some meaningful area is actually transparent. A JPEG-quality
    photo re-saved as PNG carries a fully opaque alpha channel, which would
    otherwise be read as a cut-out covering the whole frame and matte nothing.
    """
    pil = Image.open(path)
    if 'A' in pil.getbands():
        rgba = np.asarray(pil.convert('RGBA')).copy()
        if (rgba[:, :, 3] < 16).mean() > 0.02:
            rgba[:, :, 3] = clean_alpha(rgba[:, :, 3])
            return rgba, 'supplied'
    return cutout(session, pil.convert('RGB'), alpha_matting), 'matted'


# ─────────────────────────── backdrop ───────────────────────────

def build_backdrop(session, debug_dir=None):
    """The president's own backdrop, extrapolated across the full canvas."""
    pil = Image.open(PRESIDENT).convert('RGB')
    rgb = np.asarray(pil).astype(np.float64)
    h, w = rgb.shape[:2]

    subject = cutout(session, pil)[:, :, 3]
    # Push the subject mask out generously — his edge light and any contact
    # shadow must not leak into the fit.
    excl = cv2.dilate((subject > 8).astype(np.uint8), np.ones((41, 41), np.uint8), iterations=3)
    bg = excl == 0
    print(f'   backdrop fit from {bg.sum():,} background px of {h * w:,}')

    ys, xs = np.mgrid[0:h, 0:w]
    xn, yn = xs / w, ys / h

    def terms(X, Y):
        return np.stack([np.ones_like(X), X, Y, X * X, X * Y, Y * Y,
                         X ** 3, X * X * Y, X * Y * Y, Y ** 3], axis=-1)

    A = terms(xn[bg], yn[bg])
    full = terms(xn, yn).reshape(-1, 10)
    out = np.zeros((h, w, 3))
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, rgb[:, :, c][bg], rcond=None)
        out[:, :, c] = (full @ coef).reshape(h, w)

    out = cv2.resize(out, (CANVAS_W, CANVAS_H), interpolation=cv2.INTER_LINEAR)
    # The real backdrop has film grain; without it the flat fit shows banding.
    rng = np.random.default_rng(7)
    out += rng.normal(0, 1.6, out.shape)
    out = np.clip(out, 0, 255).astype(np.uint8)

    if debug_dir:
        Image.fromarray(out).save(os.path.join(debug_dir, '_backdrop.jpg'), quality=95)
    return out


def blurred_fill(rgb):
    """The photo's own colours, blurred to canvas size, as a surround.

    For a source no matting model will cut — every one tried returns either a
    floating head or a rectangle of the room behind it — the choice is between
    leaving it at its own size, where the card crops a head to twice everyone
    else's, and framing it to the house geometry with something behind it. This
    is that something: the picture's own colours, too soft to read as a place,
    so nothing is invented about where the subject was standing.
    """
    h, w = rgb.shape[:2]
    scale = max(CANVAS_W / w, CANVAS_H / h)
    big = cv2.resize(rgb, (int(np.ceil(w * scale)), int(np.ceil(h * scale))),
                     interpolation=cv2.INTER_LINEAR)
    y0 = (big.shape[0] - CANVAS_H) // 2
    x0 = (big.shape[1] - CANVAS_W) // 2
    out = big[y0:y0 + CANVAS_H, x0:x0 + CANVAS_W].astype(np.float64)
    out = cv2.GaussianBlur(out, (0, 0), 42)
    rng = np.random.default_rng(23)
    return np.clip(out * 0.82 + rng.normal(0, 1.6, out.shape), 0, 255)


def president_target(det):
    """Face size and placement to match, measured off the president himself."""
    bgr = cv2.imread(PRESIDENT)
    bgr = cv2.resize(bgr, (CANVAS_W, CANVAS_H))
    f = detect_face(det, bgr)
    if f is None:
        raise RuntimeError('no face found in the president reference')
    cx, cy, fw, fh, eye_y = f
    print(f'   president face: h={fh:.0f}px  eye-line y={eye_y:.0f}  '
          f'({fh / CANVAS_H:.3f} of height, eye at {eye_y / CANVAS_H:.3f})')
    # Centred horizontally: his own pose is slightly off-axis, but a grid of
    # portraits wants every face on the same vertical axis.
    return dict(face_h=fh, eye_y=eye_y, cx=CANVAS_W / 2)


# ─────────────────────────── composite ───────────────────────────

def place(rgba, det, target, backdrop):
    """Scale/translate the cut-out so its face matches the president's, then
    composite onto the backdrop."""
    bgr = cv2.cvtColor(rgba[:, :, :3], cv2.COLOR_RGB2BGR)
    f = detect_face(det, bgr)

    ys, xs = np.nonzero(rgba[:, :, 3] > 16)
    if len(ys) == 0:
        return None, 'empty matte'
    top, bottom = ys.min(), ys.max()
    left, right = xs.min(), xs.max()

    if f is not None:
        cx, cy, fw, fh, eye_y = f
        scale = target['face_h'] / fh
        anchor_x, anchor_y = cx, eye_y
        how = 'face'

        # QC: on a head-and-shoulders portrait the matte must run well below the
        # chin and above the hairline. When it does not, the matte ate the body
        # or the headgear — which is exactly the failure that must never ship.
        face_top, face_bottom = cy - fh / 2, cy + fh / 2
        torso = (bottom - face_bottom) / fh
        crown = (face_top - top) / fh
        if torso < 0.8:
            how = f'BAD: torso lost (only {torso:.2f}x face height below chin)'
        elif crown < 0.05:
            # Only fires on real decapitation — a close-cropped head legitimately
            # sits ~0.10x above the detector's brow line.
            how = f'BAD: headgear/hair lost ({crown:.2f}x face height above brow)'
    else:
        # Fallback: assume a head-and-shoulders framing and key off the mask.
        head_h = (bottom - top) * 0.42
        scale = target['face_h'] / max(head_h, 1)
        anchor_x = (left + right) / 2
        anchor_y = top + head_h * 0.62
        how = 'mask'

    # A matte that came back nearly empty makes the fallback's head_h tiny and the
    # scale enormous — one such portrait asked for a 34GB resize and took the whole
    # run down with it, losing every portrait queued behind it. Nothing legitimate
    # needs more than a few times life size, so treat it as the failed matte it is.
    if not (0.02 < scale < 8.0):
        return None, f'BAD: implausible scale x{scale:.1f} — matte almost certainly empty'

    new_w, new_h = int(round(rgba.shape[1] * scale)), int(round(rgba.shape[0] * scale))
    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC
    sc = cv2.resize(rgba, (new_w, new_h), interpolation=interp)

    # Where the subject's top-left corner lands on the canvas.
    off_x = int(round(target['cx'] - anchor_x * scale))
    off_y = int(round(target['eye_y'] - anchor_y * scale))

    canvas = np.zeros((CANVAS_H, CANVAS_W, 4), np.uint8)
    sx0, sy0 = max(0, -off_x), max(0, -off_y)
    dx0, dy0 = max(0, off_x), max(0, off_y)
    cw = min(new_w - sx0, CANVAS_W - dx0)
    ch = min(new_h - sy0, CANVAS_H - dy0)
    if cw <= 0 or ch <= 0:
        return None, 'subject placed off-canvas'
    canvas[dy0:dy0 + ch, dx0:dx0 + cw] = sc[sy0:sy0 + ch, sx0:sx0 + cw]

    # A torso that stops short of the bottom edge reads as a floating cut-out, so
    # the last row of clothing is carried down. Copying it verbatim is the obvious
    # way and it is wrong: real fabric varies as much down the frame as across it,
    # so an exact copy comes out with a fraction of the vertical roughness of the
    # cloth above it and the eye reads a barcode — worst on a lapel and tie, which
    # stripe. Carrying it down while blurring sideways and easing darker is what
    # the lens and the backdrop's own falloff do to a torso below the key light:
    # detail dissolves with depth instead of repeating.
    col_any = canvas[:, :, 3].max(axis=1)
    filled = np.nonzero(col_any > 16)[0]
    if len(filled) and filled[-1] < CANVAS_H - 1:
        start = max(0, filled[-1] - 3)
        n = CANVAS_H - start
        src = canvas[start].astype(np.float64)
        src[:, :3] = cv2.GaussianBlur(src[None, :, :3], (0, 0), 1.2, 1e-6)[0]
        rng = np.random.default_rng(11)
        for i in range(n):
            t = (i + 1) / n
            row = cv2.GaussianBlur(src[None, :, :], (0, 0), 0.4 + 22.0 * t ** 1.5, 1e-6)[0]
            row[:, :3] = row[:, :3] * (1.0 - 0.45 * t ** 0.8) + rng.normal(0, 1.6, (CANVAS_W, 3))

            # Fade the carried region out to the backdrop instead of driving
            # opaque cloth all the way to the bottom edge.
            #
            # Carrying it down at full alpha is what produced the smear visible on
            # the published Delta and Kaduna cards: where a source is a tight
            # head-and-shoulders crop the synthetic region can be a third of the
            # frame, and a third of a frame of blurred fabric at full opacity reads
            # as a rendering fault. Dissolving into the studio backdrop reads as
            # the backdrop's own falloff below the key light — which is what a real
            # portrait does — so the eye accepts it.
            #
            # The exponent keeps the first rows nearly solid, so the join at the
            # real hem is not visible; it only lets go further down. The sideways
            # blur is also halved from 44 to 22: at 44 the last rows were a wash
            # with no structure left to fade.
            row[:, 3] = row[:, 3] * max(0.0, 1.0 - t ** 1.7)

            canvas[start + i] = np.clip(row, 0, 255).astype(np.uint8)

    a = (canvas[:, :, 3:4].astype(np.float64) / 255.0)
    comp = canvas[:, :, :3] * a + backdrop * (1 - a)
    return np.clip(comp, 0, 255).astype(np.uint8), how


# ─────────────────────────── main ───────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('indir')
    ap.add_argument('outdir')
    ap.add_argument('--model', default='u2net')
    ap.add_argument('--alpha-matting', action='store_true',
                    help='trimap refinement via pymatting — slower, much cleaner edges')
    ap.add_argument('--no-matte', action='store_true',
                    help='do not cut the subject out: keep the whole photo, framed to the '
                         'house face geometry over a blurred fill of its own colours. For '
                         'sources no matting model can handle — the card then at least '
                         'agrees with every other card on how big a head is.')
    args = ap.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    print(f'matting model: {args.model}{" + alpha matting" if args.alpha_matting else ""}')
    session = new_session(args.model)
    det = make_detector()

    print('building backdrop from the president portrait…')
    backdrop = build_backdrop(session, args.outdir).astype(np.float64)
    target = president_target(det)

    files = sorted(f for f in glob.glob(os.path.join(args.indir, '*'))
                   if os.path.splitext(f)[1].lower() in ('.jpg', '.jpeg', '.png'))
    print(f'\nnormalising {len(files)} portraits…')
    suspect = []
    for i, f in enumerate(files, 1):
        name = os.path.splitext(os.path.basename(f))[0] + '.jpg'
        if args.no_matte:
            src = np.asarray(Image.open(f).convert('RGB'))
            rgba = np.dstack([src, np.full(src.shape[:2], 255, np.uint8)])
            plate, source = blurred_fill(src), 'unmatted'
        else:
            rgba, source = load_subject(f, session, args.alpha_matting)
            plate = backdrop
        comp, how = place(rgba, det, target, plate)
        if comp is None:
            print(f'  {i:2}/{len(files)} !! {name}: {how}')
            suspect.append((name, how))
            continue
        Image.fromarray(comp).save(os.path.join(args.outdir, name), 'JPEG', quality=93, subsampling=0)
        note = '' if how == 'face' else f'   <-- {how}'
        if how != 'face':
            suspect.append((name, how))
        print(f'  {i:2}/{len(files)} [{source}] {name}{note}')

    print(f'\ndone → {args.outdir}  ({len(files) - len(suspect)}/{len(files)} clean)')
    if suspect:
        print('NEEDS REVIEW — do not publish these without looking:')
        for n, w in suspect:
            print(f'   {n}: {w}')


if __name__ == '__main__':
    main()
