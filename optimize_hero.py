from PIL import Image
import os

src = r"D:\WhatsApp Image 2026-05-08 at 8.11.15 PM.jpeg"
out_dir = r"C:\Users\jleds\DIDIER ACHACH\img"

img = Image.open(src)
print(f"Original size: {img.size}, mode: {img.mode}")

img = img.convert("RGB")

jpg_path = os.path.join(out_dir, "hero-bg.jpg")
img.save(jpg_path, "JPEG", quality=92, optimize=True, progressive=True)
print(f"JPEG saved: {os.path.getsize(jpg_path)/1024:.0f} KB")

webp_path = os.path.join(out_dir, "hero-bg.webp")
img.save(webp_path, "WEBP", quality=88, method=6)
print(f"WebP saved: {os.path.getsize(webp_path)/1024:.0f} KB")

print(f"Done. Dimensions: {img.size}")
