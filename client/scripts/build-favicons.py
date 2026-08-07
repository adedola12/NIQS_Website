#!/usr/bin/env python3
"""
Builds the favicon set from NIQS-LOGO-SQUARE.png.

Run from client/:   python scripts/build-favicons.py

Why more than the one PNG that was already linked:

  favicon.ico       Browsers request /favicon.ico whether or not a <link> asks
                    them to, and so does Google's favicon fetcher. It was
                    returning 404 on the live domain. Multi-resolution, because
                    a .ico is a container and Windows picks the size it wants.

  icon-192.png      Google will only show a favicon beside a search result if it
  icon-512.png      is square and a multiple of 48px. The existing 512x512 is
                    square but 512 is not a multiple of 48, so it does not
                    qualify — 192 does. 512 is here for the manifest and for
                    Android's home-screen icon.

  apple-touch-icon  iOS composites a home-screen icon onto black if it has an
                    alpha channel, which turns a navy-and-gold crest into a dark
                    smudge. This one is flattened onto white first.

The source is 512x512 in palette mode; everything is converted to RGBA before
resizing so the crest's edges do not pick up palette artefacts.
"""
from pathlib import Path
from PIL import Image

PUBLIC = Path(__file__).resolve().parent.parent / "public"
SOURCE = PUBLIC / "NIQS-LOGO-SQUARE.png"

# iOS home-screen background. White rather than the NIQS navy: the crest already
# carries its own navy, and on a dark home screen a navy tile disappears.
APPLE_BG = (255, 255, 255)


def main() -> None:
    src = Image.open(SOURCE).convert("RGBA")
    if src.width != src.height:
        raise SystemExit(f"{SOURCE.name} is {src.size}, expected a square")

    def resized(size: int) -> Image.Image:
        return src.resize((size, size), Image.LANCZOS)

    # Multi-resolution .ico. 48 is included for Google and for Windows' larger
    # list views, which otherwise upscale the 32.
    resized(256).save(PUBLIC / "favicon.ico", format="ICO",
                      sizes=[(16, 16), (32, 32), (48, 48)])

    for size in (192, 512):
        resized(size).save(PUBLIC / f"icon-{size}.png", format="PNG", optimize=True)

    apple = Image.new("RGB", (180, 180), APPLE_BG)
    icon = resized(180)
    apple.paste(icon, (0, 0), icon)
    apple.save(PUBLIC / "apple-touch-icon.png", format="PNG", optimize=True)

    for name in ("favicon.ico", "icon-192.png", "icon-512.png", "apple-touch-icon.png"):
        path = PUBLIC / name
        print(f"  {name:24} {path.stat().st_size / 1024:6.1f} kB")


if __name__ == "__main__":
    main()
