"""
Builds the link-preview (Open Graph) artwork in client/public.

Why this exists: the nav logo PNG was being served directly as og:image. It has a
transparent background and its crest is not centred inside its own canvas (alpha
bbox starts 60px in on the left and leaves ~160px dead on the right), so every
scraper that centre-crops to a square — WhatsApp's small card especially — put the
crest off-axis, and the transparency composited against whatever colour the client
felt like.

The artwork here is opaque, brand-coloured, and lays everything out inside the
central square so it survives both the 1.91:1 card and a square centre-crop.

  python client/scripts/build-og-image.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.normpath(os.path.join(HERE, '..', 'public'))
# The full-resolution original, not the served copy. public/NIQS-LOGO-PNG-NAV.png
# is now a 256px palette PNG optimised for page loads (see optimize-images.py) and
# is far too small to render 1200px artwork from.
LOGO = os.path.join(HERE, 'assets', 'niqs-logo-source.png')

NAVY = (11, 31, 75)
GOLD = (201, 151, 74)
WHITE = (255, 255, 255)

FONT_BOLD = 'C:/Windows/Fonts/segoeuib.ttf'
FONT_SEMI = 'C:/Windows/Fonts/seguisb.ttf'


def centred_logo():
    """The crest cropped to its own ink, so 'centre' means the crest's centre."""
    logo = Image.open(LOGO).convert('RGBA')
    return logo.crop(logo.split()[-1].getbbox())


def tracked(draw, xy, text, font, fill, tracking):
    """PIL has no letter-spacing; lay the glyphs out by hand."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking


def tracked_width(draw, text, font, tracking):
    return sum(draw.textlength(c, font=font) for c in text) + tracking * (len(text) - 1)


def backdrop(w, h):
    """Navy with a soft centre lift, so the card is not a flat block."""
    img = Image.new('RGB', (w, h), NAVY)
    glow = Image.new('L', (w, h), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy = w // 2, int(h * 0.42)
    r = int(max(w, h) * 0.55)
    for i in range(r, 0, -6):
        gd.ellipse([cx - i, cy - i * 0.8, cx + i, cy + i * 0.8],
                   fill=int(26 * (1 - i / r)))
    return Image.composite(Image.new('RGB', (w, h), (26, 50, 128)), img, glow)


def compose(w, h, out_name):
    img = backdrop(w, h)
    d = ImageDraw.Draw(img)

    # Everything lives inside the centred square so a square crop loses nothing.
    safe = min(w, h)
    cx = w // 2
    top = (h - safe) // 2

    inset = int(safe * 0.045)
    d.rectangle([cx - safe // 2 + inset, top + inset, cx + safe // 2 - inset, top + safe - inset],
                outline=(255, 255, 255, 40), width=0)

    logo = centred_logo()
    logo_h = int(safe * 0.40)
    logo_w = round(logo.width * logo_h / logo.height)
    logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
    logo_y = top + int(safe * 0.115)

    # The crest is navy-on-transparent: dropped straight onto the navy field its
    # eagle and letter blocks vanish. Sit it on a light plate so it reads.
    pad = int(safe * 0.05)
    plate = [cx - logo_w // 2 - pad, logo_y - pad,
             cx + logo_w // 2 + pad, logo_y + logo_h + pad]
    d.rounded_rectangle(plate, radius=int(safe * 0.035), fill=(247, 245, 240),
                        outline=GOLD, width=max(2, int(safe * 0.004)))
    img.paste(logo, (cx - logo_w // 2, logo_y), logo)

    f_top = ImageFont.truetype(FONT_SEMI, int(safe * 0.052))
    f_main = ImageFont.truetype(FONT_BOLD, int(safe * 0.075))
    f_small = ImageFont.truetype(FONT_SEMI, int(safe * 0.032))

    y = logo_y + logo_h + pad + int(safe * 0.05)
    t1, tr1 = 'NIGERIAN INSTITUTE OF', int(safe * 0.011)
    tracked(d, (cx - tracked_width(d, t1, f_top, tr1) / 2, y), t1, f_top, WHITE, tr1)

    y += int(safe * 0.072)
    t2, tr2 = 'QUANTITY SURVEYORS', int(safe * 0.011)
    tracked(d, (cx - tracked_width(d, t2, f_main, tr2) / 2, y), t2, f_main, GOLD, tr2)

    y += int(safe * 0.105)
    d.rectangle([cx - int(safe * 0.09), y, cx + int(safe * 0.09), y + 2], fill=GOLD)

    y += int(safe * 0.035)
    t3, tr3 = 'ESTABLISHED 1969', int(safe * 0.014)
    tracked(d, (cx - tracked_width(d, t3, f_small, tr3) / 2, y), t3, f_small,
            (255, 255, 255, 200), tr3)

    path = os.path.join(PUBLIC, out_name)
    img.save(path, quality=94, subsampling=0)
    print(f'{out_name}  {w}x{h}')
    return img


def square_icon():
    """Favicon / apple-touch icon with the crest actually centred and padded."""
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    logo = centred_logo()
    h = int(size * 0.82)
    w = round(logo.width * h / logo.height)
    logo = logo.resize((w, h), Image.LANCZOS)
    img.paste(logo, ((size - w) // 2, (size - h) // 2), logo)
    # Quantised on the way out, not in a later pass. Browsers fetch this as the
    # favicon and apple-touch-icon on every cold visit, and a full RGBA encode
    # costs 63 KB against 12 KB for a 128-colour palette — indistinguishable on
    # flat brand artwork. Doing it here keeps optimize-images.py from having to
    # re-optimise a file this script would overwrite on its next run.
    out = img.quantize(colors=128, method=Image.FASTOCTREE)
    out.save(os.path.join(PUBLIC, 'NIQS-LOGO-SQUARE.png'), optimize=True)
    print(f'NIQS-LOGO-SQUARE.png  {size}x{size}')


if __name__ == '__main__':
    compose(1200, 630, 'og-image.jpg')     # 1.91:1 — the standard large card
    compose(1200, 1200, 'og-square.jpg')   # 1:1 — WhatsApp's small thumbnail
    square_icon()
