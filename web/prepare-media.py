"""Prepare committed responsive WebP assets; production builds only need Node."""
import json
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageOps, UnidentifiedImageError

root = Path(__file__).resolve().parent
media = root / 'media'
def save_webp(image, destination, quality):
    buffer = BytesIO()
    image.save(buffer, 'WEBP', quality=quality, method=6)
    data = buffer.getvalue()
    if not data:
        raise ValueError(f'Empty image output: {destination}')
    destination.write_bytes(data)

for number in (1, 2):
    with Image.open(root.parent / f'images/pump-{number}.jpg') as image:
        save_webp(ImageOps.exif_transpose(image).convert('RGB'), media / f'pump-{number}.webp', 82)

manifest = {}
for file in sorted(media.glob('*.webp')):
    if any(file.stem.endswith(f'-{width}') for width in (480, 800, 1200)):
        continue
    try:
        image = Image.open(file)
    except UnidentifiedImageError:
        original = next((root.parent / folder / f'{file.stem}.{ext}'
                         for folder in ['images', 'images/gallery/full', 'images/services', 'images/team']
                         for ext in ['jpg', 'jpeg']
                         if (root.parent / folder / f'{file.stem}.{ext}').exists()), None)
        if not original:
            raise
        with Image.open(original) as source:
            repaired = ImageOps.exif_transpose(source).convert('RGB')
            repaired.thumbnail((1500, 1500))
            save_webp(repaired, file, 82)
        image = Image.open(file)
    with image:
        width, height = image.size
        if width <= 480:
            continue
        variants = []
        for size in (480, 800, 1200):
            if size >= width:
                continue
            destination = file.with_name(f'{file.stem}-{size}.webp')
            resized = image.resize((size, round(height * size / width)), Image.Resampling.LANCZOS)
            save_webp(resized, destination, 80)
            variants.append([f'/media/{destination.name}', size])
        variants.append([f'/media/{file.name}', width])
        manifest[f'/media/{file.name}'] = {'width': width, 'height': height, 'variants': variants}
(root / 'responsive-media.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Prepared responsive sources for {len(manifest)} photographs.')
