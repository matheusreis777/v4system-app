from PIL import Image
import os

icon_path = r'c:\Users\mtrei\OneDrive\Documentos\Sistemas\v4system-app\assets\icon.png'
img = Image.open(icon_path)
width, height = img.size

if width != height:
    print(f"Original size: {width}x{height}")
    new_size = min(width, height)
    left = (width - new_size) / 2
    top = (height - new_size) / 2
    right = (width + new_size) / 2
    bottom = (height + new_size) / 2

    img_cropped = img.crop((left, top, right, bottom))
    # Resize to a standard large size like 1024x1024 to keep it clean
    img_resized = img_cropped.resize((1024, 1024), Image.Resampling.LANCZOS)
    img_resized.save(icon_path)
    print(f"Saved cropped and resized icon: 1024x1024")
else:
    print("Icon is already square.")
