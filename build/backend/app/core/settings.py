"""
Civic-I backend settings — minimal Ollama configuration.

Created by A3. A2 should extend this module with additional
backend settings (DATABASE_URL, JWT_SECRET, etc.).

All values have safe defaults; the backend starts without a .env file.
"""

import os


# ---------------------------------------------------------------------------
# Ollama connection
# ---------------------------------------------------------------------------
OLLAMA_BASE_URL: str = os.getenv(
    "OLLAMA_BASE_URL", "http://localhost:11434"
)

# ---------------------------------------------------------------------------
# Model roles
# ---------------------------------------------------------------------------
# Decision / advisory model (primary for text tasks)
OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen3.5:2b")

# Vision review model
OLLAMA_VISION_MODEL: str = os.getenv("OLLAMA_VISION_MODEL", "gemma3:latest")

# Fallback text model
OLLAMA_FALLBACK_MODEL: str = os.getenv("OLLAMA_FALLBACK_MODEL", "llama3.2:3b")

# ---------------------------------------------------------------------------
# Timeouts (seconds) and retries
# ---------------------------------------------------------------------------
OLLAMA_TEXT_TIMEOUT: int = int(os.getenv("OLLAMA_TEXT_TIMEOUT", "30"))
OLLAMA_VISION_TIMEOUT: int = int(os.getenv("OLLAMA_VISION_TIMEOUT", "60"))
OLLAMA_TEXT_RETRIES: int = 2
OLLAMA_VISION_RETRIES: int = 1
OLLAMA_KEEP_ALIVE: str = "5m"
OLLAMA_TEMPERATURE: float = 0.2
