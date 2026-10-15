import io
import os
import logging
from PIL import Image, ImageOps

logger = logging.getLogger("uvicorn.error")

def convert_to_webp(
    file_input: bytes | str | os.PathLike = None, 
    original_filename: str = "", 
    max_dimension: int = 1920, 
    quality: int = 85,
    file_bytes: bytes | None = None
) -> tuple[bytes, str, str]:
    """
    Automatically converts any uploaded image (JPEG, PNG, GIF, BMP, TIFF, WEBP, etc.)
    into a modern, highly optimized WebP format.

    - Accepts either raw bytes or a file path string.
    - Preserves alpha transparency for PNGs and transparent assets.
    - Automatically corrects EXIF photo orientation (from mobile phone cameras).
    - Proportional downsizing if image exceeds max_dimension (e.g. 1920px), preventing bloated uploads.
    - Leaves SVG vectors untouched.

    Returns:
        tuple (output_bytes, new_filename, content_type)
    """
    if file_input is None and file_bytes is not None:
        file_input = file_bytes
    if isinstance(file_input, (str, os.PathLike)):
        file_path = str(file_input)
        if not original_filename:
            original_filename = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            file_bytes = f.read()
    else:
        file_bytes = file_input

    ext = os.path.splitext(original_filename)[1].lower() if original_filename else ""

    # If already SVG vector, do not rasterize
    is_svg = ext == ".svg" or (
        isinstance(file_bytes, bytes) and (file_bytes.startswith(b"<?xml") or b"<svg" in file_bytes[:100])
    )
    if is_svg:
        base_name = os.path.splitext(original_filename)[0] or "asset"
        return file_bytes, f"{base_name}.svg", "image/svg+xml"

    # If .ico, check if caller specifically wants to keep .ico or convert
    if ext == ".ico":
        # Keep ico untouched for legacy favicon compatibility if requested
        base_name = os.path.splitext(original_filename)[0] or "favicon"
        return file_bytes, f"{base_name}.ico", "image/x-icon"

    try:
        # Open image from in-memory bytes
        with Image.open(io.BytesIO(file_bytes)) as img:
            # 1. Correct orientation based on EXIF (e.g. iPhone / Android camera metadata)
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            # 2. Preserve transparency or convert color mode
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                img = img.convert("RGBA")
            elif img.mode != "RGB":
                img = img.convert("RGB")

            # 3. Proportional downsampling if oversized
            width, height = img.size
            if max(width, height) > max_dimension:
                if width >= height:
                    new_w = max_dimension
                    new_h = int(height * (max_dimension / width))
                else:
                    new_h = max_dimension
                    new_w = int(width * (max_dimension / height))
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                logger.info(f"Downsampled image from {width}x{height} to {new_w}x{new_h}")

            # 4. Save as WebP into memory
            output_buffer = io.BytesIO()
            # method=6 provides highest compression efficiency
            img.save(
                output_buffer,
                format="WEBP",
                quality=quality,
                method=6,
                optimize=True
            )
            webp_bytes = output_buffer.getvalue()

            base_name = os.path.splitext(original_filename)[0] if original_filename else "image"
            new_filename = f"{base_name}.webp"

            logger.info(
                f"WebP Conversion: Original {len(file_bytes)} bytes -> WebP {len(webp_bytes)} bytes "
                f"({round((1 - len(webp_bytes)/len(file_bytes))*100, 1)}% savings)"
            )

            return webp_bytes, new_filename, "image/webp"

    except Exception as e:
        logger.warning(f"Could not convert image to WebP, falling back to original: {e}")
        # Graceful fallback: return original if format not decodeable
        return file_bytes, original_filename or "image.jpg", "image/jpeg"
