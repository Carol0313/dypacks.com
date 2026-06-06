#!/usr/bin/env python3
"""Compress product images for web use."""
import os
from pathlib import Path
from PIL import Image

PRODUCTS_DIR = Path("client/public/products")
MAX_WIDTH = 1200
QUALITY = 80

supported = (".jpg", ".jpeg", ".png", ".webp")
total_before = 0
total_after = 0
compressed = 0

for f in sorted(PRODUCTS_DIR.iterdir()):
    if not f.is_file() or f.suffix.lower() not in supported:
        continue

    before = f.stat().st_size
    total_before += before

    img = Image.open(f)
    # Convert to RGB if necessary
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Resize if too wide
    w, h = img.size
    if w > MAX_WIDTH:
        ratio = MAX_WIDTH / w
        new_h = int(h * ratio)
        img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)

    # Save with compression
    if f.suffix.lower() == ".png":
        img.save(f, optimize=True)
    else:
        img.save(f, quality=QUALITY, optimize=True)

    after = f.stat().st_size
    total_after += after
    compressed += 1
    saved = (before - after) / before * 100
    print(f"  {f.name}: {before/1024/1024:.1f}MB -> {after/1024/1024:.1f}MB ({saved:.0f}% saved)")

print(f"\nDone! Compressed {compressed} images")
print(f"Total: {total_before/1024/1024:.1f}MB -> {total_after/1024/1024:.1f}MB")
print(f"Saved: {(total_before-total_after)/1024/1024:.1f}MB ({(total_before-total_after)/total_before*100:.0f}%)")
