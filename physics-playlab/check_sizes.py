import os
from PIL import Image

bg_path = r"c:\Users\Zen\Desktop\โครงงานวิทยาศาตร์\V.2\physics-playlab\public\images\lobby\background\bg-001.jpg"
mascot_path = r"c:\Users\Zen\Desktop\โครงงานวิทยาศาตร์\V.2\physics-playlab\public\images\mascot\scroll\frame-001.png"

if os.path.exists(bg_path):
    img_bg = Image.open(bg_path)
    print(f"Background image size: {img_bg.size}")
else:
    print("Background image not found.")

if os.path.exists(mascot_path):
    img_mascot = Image.open(mascot_path)
    print(f"Mascot image size: {img_mascot.size}")
else:
    print("Mascot image not found.")
