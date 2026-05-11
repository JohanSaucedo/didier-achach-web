from PIL import Image
import os, shutil

src = r"D:\WhatsApp Image 2026-05-08 at 8.11.15 PM.jpeg"
out_dir = r"C:\Users\jleds\DIDIER ACHACH\img"

img = Image.open(src).convert("RGB")
dst = os.path.join(out_dir, "didier.jpg")
img.save(dst, "JPEG", quality=90, optimize=True, progressive=True)
print(f"Saved didier.jpg — {os.path.getsize(dst)/1024:.0f} KB — {img.size}")
