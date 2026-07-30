"""
Optimises the static images in client/public that browsers actually download.

  python client/scripts/optimize-images.py

Why these assets and not others
-------------------------------
Measured in a browser against the production build, a public page downloads
exactly one local image: the nav logo. Everything else is either fetched only by
crawlers (og-image.jpg, og-square.jpg — never requested during a page load, so
optimising them saves a visitor nothing) or belongs to the admin flyer studio.

  NIQS-LOGO-PNG-NAV.png   828x869, 92 KB, rendered at 50-64px on every page
  NIQS-LOGO-SQUARE.png    512x512, 63 KB, favicon + apple-touch-icon

The nav logo was ~13x larger than its largest render. Serving it at 256px covers
a 64px render at 4x DPI with room to spare.

Why palette PNG and not WebP/AVIF
---------------------------------
Measured, at 256px wide:

  PNG 128-colour palette     8.3 KB   <- chosen
  AVIF q=60                  9.7 KB
  WEBP q=85                 15.3 KB
  PNG full RGBA optimised   33.8 KB

The logo has 1,254 distinct colours, so a 128-colour palette is ample: RMSE
against the resized original is 1.40, below the threshold of perceptibility.
Palette PNG wins outright here *and* needs no <picture> element, no format
negotiation and no fallback chain — one file, universal support. Photographs
would tip the other way; flat brand artwork does not.

Source of truth
---------------
scripts/assets/niqs-logo-source.png holds the full-resolution original. It lives
outside public/ so it is never served, and build-og-image.py renders the link
preview artwork from it — that script needs the full resolution, which is why the
served copy could not simply be downscaled in place.
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.normpath(os.path.join(HERE, '..', 'public'))
SOURCE = os.path.join(HERE, 'assets', 'niqs-logo-source.png')

# Largest render anywhere is 64px (the auth pages); the navbar uses ~50px.
# 256px covers that at 4x device pixel ratio.
NAV_WIDTH = 256
PALETTE_COLOURS = 128


def kb(path):
    return os.path.getsize(path) / 1024


def write_palette_png(img, dest, colours=PALETTE_COLOURS):
    """Quantise to a palette, preserving transparency."""
    before = kb(dest) if os.path.exists(dest) else 0
    img.quantize(colors=colours, method=Image.FASTOCTREE).save(dest, 'PNG', optimize=True)
    after = kb(dest)
    saved = before - after
    print(f"  {os.path.basename(dest):24} {before:7.1f} KB -> {after:6.1f} KB"
          f"  ({saved:6.1f} KB saved, -{100*saved/before:.0f}%)" if before else
          f"  {os.path.basename(dest):24} written at {after:.1f} KB")


def main():
    if not os.path.exists(SOURCE):
        raise SystemExit(
            f"missing {SOURCE}\n"
            "The full-resolution logo is the source of truth for both this script "
            "and build-og-image.py. Restore it before running."
        )

    print("Optimising public images\n")

    src = Image.open(SOURCE).convert('RGBA')

    # ── Nav logo: resize, then quantise ──
    h = round(src.height * NAV_WIDTH / src.width)
    nav = src.resize((NAV_WIDTH, h), Image.LANCZOS)
    write_palette_png(nav, os.path.join(PUBLIC, 'NIQS-LOGO-PNG-NAV.png'))

    # NIQS-LOGO-SQUARE.png is NOT handled here. build-og-image.py generates it and
    # would overwrite anything this script did, so the quantisation lives at the
    # point of generation instead. Run that script to refresh the favicon.

    print("\nNot touched, deliberately:")
    print("  NIQS-LOGO-SQUARE.png          — generated + quantised by build-og-image.py")
    print("  og-image.jpg / og-square.jpg  — fetched by crawlers, never on a page load")
    print("  public/backgrounds/*.png      — flyer studio only; see optimize-flyer-backgrounds.py")


if __name__ == '__main__':
    main()
