from PIL import Image
import os, shutil

src = r"C:\Users\jleds\OneDrive\Desktop\logo-transparent.png"
dst = r"C:\Users\jleds\DIDIER ACHACH\img\logo-full.png"

img = Image.open(src)
print(f"Mode: {img.mode}, Size: {img.size}")

# Ensure RGBA (transparent background preserved)
if img.mode != "RGBA":
    img = img.convert("RGBA")

img.save(dst, "PNG", optimize=True)
print(f"Saved: {os.path.getsize(dst)/1024:.0f} KB")
