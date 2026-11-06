"""
Civic-I Vision services — advisory VLM review.

Modules:
  reviewer      – VisualReviewer using gemma3
  image_prep    – EXIF stripping, downscaling, base64 encoding
  stub_reviewer – stub when Ollama / gemma is unavailable
"""

from build.backend.app.services.vision.reviewer import (
    VisualReviewer,
    VisualReview,
)
from build.backend.app.services.vision.stub_reviewer import StubVisualReviewer

__all__ = [
    "VisualReviewer",
    "VisualReview",
    "StubVisualReviewer",
]
