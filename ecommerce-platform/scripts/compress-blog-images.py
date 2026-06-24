#!/usr/bin/env python3
"""Compress blog images in Blogs/ before importing to OSS."""
import os
from pathlib import Path
from typing import Optional
from PIL import Image

BLOGS_DIR = Path("Blogs")
MAX_WIDTH = 1600
QUALITY = 85

SUPPORTED = (".png", ".jpg", ".jpeg", ".webp")

def compress_image(file_path: Path) -> Optional[Path]:
    """Compress a single image. Returns the path of the final image."""
    try:
        img = Image.open(file_path)
    except Exception as e:
        print(f"  ⚠️ Cannot open {file_path}: {e}")
        return None

    # Convert palette with transparency to RGBA first
    if img.mode == "P" and "transparency" in img.info:
        img = img.convert("RGBA")

    # Convert to RGB for compression (white background for transparency)
    if img.mode in ("RGBA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "RGBA":
            background.paste(img, mask=img.split()[3])
        else:
            background.paste(img)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # Resize if too wide
    w, h = img.size
    if w > MAX_WIDTH:
        ratio = MAX_WIDTH / w
        new_h = int(h * ratio)
        img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)

    ext = file_path.suffix.lower()

    if ext == ".png":
        # Convert PNG photos/diagrams to JPEG for much smaller size
        new_path = file_path.with_suffix(".jpg")
        img.save(new_path, "JPEG", quality=QUALITY, optimize=True)
        file_path.unlink()
        return new_path
    elif ext in (".jpg", ".jpeg"):
        img.save(file_path, "JPEG", quality=QUALITY, optimize=True)
        return file_path
    elif ext == ".webp":
        img.save(file_path, "WEBP", quality=QUALITY, method=6)
        return file_path
    else:
        return file_path


def main():
    total_before = 0
    total_after = 0
    compressed = 0

    for file_path in sorted(BLOGS_DIR.rglob("*")):
        if not file_path.is_file() or file_path.suffix.lower() not in SUPPORTED:
            continue

        before = file_path.stat().st_size
        result = compress_image(file_path)
        if result is None:
            continue

        after = result.stat().st_size
        total_before += before
        total_after += after
        compressed += 1
        saved = (before - after) / before * 100 if before else 0
        print(
            f"  {result.relative_to(BLOGS_DIR)}: "
            f"{before/1024/1024:.1f}MB -> {after/1024/1024:.1f}MB ({saved:.0f}% saved)"
        )

    print(f"\nDone! Compressed {compressed} blog images")
    print(f"Total: {total_before/1024/1024:.1f}MB -> {total_after/1024/1024:.1f}MB")
    if total_before:
        print(
            f"Saved: {(total_before-total_after)/1024/1024:.1f}MB "
            f"({(total_before-total_after)/total_before*100:.0f}%)"
        )


if __name__ == "__main__":
    main()
