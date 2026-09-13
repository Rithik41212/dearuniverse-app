"""Optional male narration. Text remains available when speech is unavailable."""
import threading
import time
import httpx
from fastapi import HTTPException
from . import config
from .journey import allowance
from .storage import digest

_lock = threading.Lock()
_cache = {}
_cooldown = 0

def speak(text, owner):
    global _cooldown
    allowance(owner, 'speech', 80)
    key = digest(text)
    with _lock:
        if key in _cache:
            return _cache[key]
        if not config.TTS_ENABLED or time.monotonic() < _cooldown:
            raise HTTPException(503, 'Voice temporarily unavailable; use device voice or read the text.')
    keys = config.GROQ_API_KEYS or ([config.GROQ_API_KEY] if config.GROQ_API_KEY else [])
    for secret in keys:
        try:
            with httpx.Client(timeout=12) as client:
                response = client.post('https://api.groq.com/openai/v1/audio/speech',
                    headers={'Authorization':f'Bearer {secret}'},
                    json={'model':'canopylabs/orpheus-v1-english','voice':'troy','input':text,'response_format':'wav'})
            if response.status_code == 429:
                break
            if response.status_code != 200 or not response.content.startswith(b'RIFF'):
                continue
            with _lock:
                if len(_cache) >= 32:
                    _cache.pop(next(iter(_cache)))
                _cache[key] = response.content
            return response.content
        except httpx.HTTPError:
            break
    _cooldown = time.monotonic() + 300
    raise HTTPException(503, 'Voice temporarily unavailable; use device voice or read the text.')
