"""
Converts the flyer studio's photographic backgrounds from PNG to WebP.

  python client/scripts/optimize-flyer-backgrounds.py

These are NOT page backgrounds. They are referenced only by src/flyer/backgrounds.json
and load when an admin picks a backdrop in the flyer studio, so this saves nothing
on a public page load. It is worth doing anyway: 12 MB of photographs stored
losslessly is 12 MB in the repo, in every deploy, and down the wire for any admin
who opens the background picker.

Quality: q=90 WebP. These get rasterised by html2canvas into downloadable flyers,
so this is the one place on the site where visible quality outranks bytes. q=90 is
visually lossless on photographs; the saving comes from PNG being the wrong
container for a photo, not from throwing away detail.

Transparency: checked per-file. Any image with an alpha channel is left as PNG —
the flyer composites backdrops behind text and a flattened background would show
as an opaque block.
"""
import json
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.normpath(os.path.join(HERE, '..', 'public'))
BG_DIR = os.path.join(PUBLIC, 'backgrounds')
MANIFEST = os.path.normpath(os.path.join(HERE, '..', 'src', 'flyer', 'backgrounds.json'))

QUALITY = 90


def has_alpha(img):
    if img.mode in ('RGBA', 'LA', 'PA'):
        # An alpha channel that is fully opaque everywhere carries no information.
        alpha = img.getchannel('A')
        return alpha.getextrema()[0] < 255
    return 'transparency' in img.info


def main():
    if not os.path.isdir(BG_DIR):
        raise SystemExit(f'missing {BG_DIR}')

    renames = {}
    before_total = after_total = 0
    skipped = []

    print(f"{'file':24} {'before':>10} {'after':>10} {'saved':>9}")
    print('-' * 58)

    for name in sorted(os.listdir(BG_DIR)):
        if not name.lower().endswith('.png'):
            continue
        src = os.path.join(BG_DIR, name)
        img = Image.open(src)

        if has_alpha(img):
            skipped.append(name)
            continue

        before = os.path.getsize(src)
        dest_name = os.path.splitext(name)[0] + '.webp'
        dest = os.path.join(BG_DIR, dest_name)
        img.convert('RGB').save(dest, 'WEBP', quality=QUALITY, method=6)
        after = os.path.getsize(dest)

        before_total += before
        after_total += after
        renames[f'/backgrounds/{name}'] = f'/backgrounds/{dest_name}'
        os.remove(src)

        print(f'{name:24} {before/1024:9.0f}K {after/1024:9.0f}K '
              f'{100*(before-after)/before:8.0f}%')

    if not renames:
        print('\nnothing to convert')
        return

    print('-' * 58)
    print(f"{'TOTAL':24} {before_total/1024/1024:8.1f}M {after_total/1024/1024:8.1f}M "
          f"{100*(before_total-after_total)/before_total:8.0f}%")

    if skipped:
        print(f"\nleft as PNG (transparency): {', '.join(skipped)}")

    # Repoint the manifest so the studio asks for the files that now exist.
    with open(MANIFEST, encoding='utf-8') as f:
        manifest = f.read()
    for old, new in renames.items():
        manifest = manifest.replace(old, new)
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        f.write(manifest)
    print(f'\nrewrote {len(renames)} path(s) in src/flyer/backgrounds.json')


if __name__ == '__main__':
    main()
