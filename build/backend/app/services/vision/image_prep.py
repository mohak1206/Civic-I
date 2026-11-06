"""
Image preparation for vision review.

- Validates format (JPEG, PNG, WebP).
- Strips EXIF / GPS metadata with Pillow.
- Downscales longest side to ~768 px.
- Returns base64-encoded bytes.

Never sends reporter details or citizen free text.
"""

from __future__ import annotations

import base64
import io
import logging

from PIL import Image, ExifTags

logger = logging.getLogger(__name__)

# Supported image formats
_SUPPORTED_FORMATS = {"JPEG", "PNG", "WEBP"}

# Target for longest side (pixels)
TARGET_MAX_SIDE = 768


class ImageValidationError(Exception):
    """Raised when an image fails validation."""


def prepare_image(image_bytes: bytes) -> str:
    """
    Validate, strip metadata, downscale, and base64-encode an image.

    Parameters
    ----------
    image_bytes : bytes
        Raw image bytes.

    Returns
    -------
    str
        Base64-encoded JPEG string (no data URI prefix).

    Raises
    ------
    ImageValidationError
        If the image format is unsupported or the data is not a valid image.
    """
    if not image_bytes:
        raise ImageValidationError("Empty image data")

    try:
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as exc:
        raise ImageValidationError(f"Cannot open image: {exc}") from exc

    # Validate format
    fmt = img.format
    if fmt not in _SUPPORTED_FORMATS:
        raise ImageValidationError(
            f"Unsupported image format '{fmt}'. "
            f"Supported: {', '.join(sorted(_SUPPORTED_FORMATS))}"
        )

    # Strip EXIF / GPS metadata by creating a clean copy
    img = _strip_exif(img)

    # Downscale
    img = _downscale(img, TARGET_MAX_SIDE)

    # Encode to JPEG bytes, then base64
    buffer = io.BytesIO()
    # Convert RGBA/P to RGB for JPEG
    if img.mode in ("RGBA", "P", "LA"):
        img = img.convert("RGB")
    img.save(buffer, format="JPEG", quality=85)
    jpeg_bytes = buffer.getvalue()

    return base64.b64encode(jpeg_bytes).decode("ascii")


def _strip_exif(img: Image.Image) -> Image.Image:
    """
    Remove all EXIF data (including GPS) from an image.

    Creates a fresh image without metadata.
    """
    clean = Image.new(img.mode, img.size)
    clean.paste(img)
    return clean


def _downscale(img: Image.Image, max_side: int) -> Image.Image:
    """
    Downscale an image so that the longest side is at most ``max_side`` px.

    If the image is already smaller, returns it unchanged.
    Uses LANCZOS resampling.
    """
    w, h = img.size
    longest = max(w, h)

    if longest <= max_side:
        return img

    ratio = max_side / longest
    new_w = int(w * ratio)
    new_h = int(h * ratio)

    logger.debug("Downscaling image from %dx%d to %dx%d", w, h, new_w, new_h)
    return img.resize((new_w, new_h), Image.LANCZOS)
