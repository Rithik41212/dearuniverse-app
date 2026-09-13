import os
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def _load_local_environment(path: Path) -> None:
    """Load a small local .env file without adding a runtime dependency."""
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        name, value = name.strip(), value.strip()
        if not name.replace("_", "").isalnum() or not name[0].isalpha():
            continue
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        os.environ.setdefault(name, value)


_load_local_environment(ROOT / ".env")


def _bounded_float(name, default, minimum, maximum):
    try:
        value = float(os.environ.get(name, default))
    except ValueError:
        value = float(default)
    return max(minimum, min(value, maximum))


DB_PATH = Path(os.environ.get("ASTRO_DB_PATH", str(ROOT / "data" / "astro.sqlite3")))
EPHE_PATH = os.environ.get("ASTRO_EPHE_PATH", str(ROOT / "data"))
DE440_PATH = Path(os.environ.get("ASTRO_DE440_PATH", str(ROOT / "data" / "de440s.bsp")))
data_digest = hashlib.sha256()
if DE440_PATH.exists():
    data_digest.update(f"de440s.bsp:{DE440_PATH.stat().st_size}".encode())
else:
    data_digest.update(b"de440s_missing")
ENGINE_VERSION = "dearuniverse-2.0-skyfield-de440:" + data_digest.hexdigest()[:16]
NARRATIVE_VERSION = "grounded-practical-narrative-3"
# Current stable defaults as of 2026-09-10. Keys remain server-side.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite").strip()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "").strip()
GROQ_API_KEYS = list(dict.fromkeys(k.strip() for k in os.environ.get("GROQ_API_KEYS", "").split(",") if k.strip()))
GEMINI_API_KEYS = list(dict.fromkeys(k.strip() for k in os.environ.get("GEMINI_API_KEYS", "").split(",") if k.strip()))
POLLINATIONS_API_KEY = os.environ.get("POLLINATIONS_API_KEY", "").strip()
POLLINATIONS_MODEL = os.environ.get("POLLINATIONS_MODEL", "openai").strip()
TTS_ENABLED = os.environ.get("ASTRO_TTS_ENABLED", "0") == "1"
GUIDE_NEURAL_VOICE = os.environ.get("ASTRO_GUIDE_NEURAL_VOICE", "1") == "1"
GEMINI_TTS_MODEL = os.environ.get("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-20b").strip()
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "").strip()
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "openrouter/free").strip()
# Optional local Ollama-compatible fallback. It is used only when model names are configured.
AI_URL = os.environ.get("ASTRO_AI_URL", "http://127.0.0.1:11434/api/generate").strip()
AI_MODELS = [m.strip() for m in os.environ.get("ASTRO_AI_MODELS", "").split(",") if m.strip()][:3]
AI_TIMEOUT_SECONDS = _bounded_float("ASTRO_AI_TIMEOUT_SECONDS", "8", 2.0, 20.0)
GEOCODER_CONTACT = os.environ.get("ASTRO_GEOCODER_CONTACT", "")
GEOCODER_ENABLED = os.environ.get("ASTRO_GEOCODER_ENABLED", "1") == "1"
