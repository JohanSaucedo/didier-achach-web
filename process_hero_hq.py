from PIL import Image, ImageFilter, ImageEnhance
import os

src = r"D:\Didier.PNG"
out_dir = r"C:\Users\jleds\DIDIER ACHACH\img"

img = Image.open(src).convert("RGB")
print(f"Original: {img.size}, mode: {img.mode}")

# Slight sharpening to compensate for web rendering
sharp = ImageEnhance.Sharpness(img).enhance(1.15)

# Hero background — keep full resolution, top quality
jpg_path = os.path.join(out_dir, "hero-bg.jpg")
sharp.save(jpg_path, "JPEG", quality=95, optimize=True, progressive=True, subsampling=0)
print(f"JPEG saved: {os.path.getsize(jpg_path)/1024:.0f} KB  —  {sharp.size}")

webp_path = os.path.join(out_dir, "hero-bg.webp")
sharp.save(webp_path, "WEBP", quality=92, method=6)
print(f"WebP saved: {os.path.getsize(webp_path)/1024:.0f} KB  —  {sharp.size}")

# About section photo — same source
about_path = os.path.join(out_dir, "didier.jpg")
sharp.save(about_path, "JPEG", quality=92, optimize=True, progressive=True, subsampling=0)
print(f"About saved: {os.path.getsize(about_path)/1024:.0f} KB  —  {sharp.size}")

print("Done.")
