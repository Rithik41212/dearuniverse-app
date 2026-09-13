import pytest
from backend import config
from backend.storage import init_db
from backend.places import seed_places

@pytest.fixture(autouse=True)
def private_provider_isolation(monkeypatch):
    # Unit tests never inherit developer credentials or perform live AI calls.
    for name in ('GEMINI_API_KEY','GROQ_API_KEY','OPENROUTER_API_KEY','POLLINATIONS_API_KEY'):
        monkeypatch.setattr(config,name,'')
    monkeypatch.setattr(config,'GROQ_API_KEYS',[])
    monkeypatch.setattr(config,'GEMINI_API_KEYS',[])
    monkeypatch.setattr(config,'AI_MODELS',[])
    monkeypatch.setattr(config,'TTS_ENABLED',False)
    monkeypatch.setattr(config,'GUIDE_NEURAL_VOICE',False)
    from backend.ai_providers import _COOLDOWNS, BREAKER
    _COOLDOWNS.clear()
    BREAKER.reset()

@pytest.fixture
def database(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "DB_PATH", tmp_path / "test.sqlite3")
    monkeypatch.setattr(config, "AI_MODELS", [])
    monkeypatch.setattr(config, "GEMINI_API_KEY", "")
    monkeypatch.setattr(config, "GROQ_API_KEY", "")
    monkeypatch.setattr(config, "GROQ_API_KEYS", [])
    monkeypatch.setattr(config, "GEMINI_API_KEYS", [])
    monkeypatch.setattr(config, "POLLINATIONS_API_KEY", "")
    monkeypatch.setattr(config, "OPENROUTER_API_KEY", "")
    monkeypatch.setattr(config, "GEOCODER_ENABLED", False)
    init_db()
    from backend.journey import initialize
    initialize()
    seed_places()
    return tmp_path
