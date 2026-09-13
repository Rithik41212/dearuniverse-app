import base64
import pytest
from fastapi.testclient import TestClient
from backend.app import app
from backend import config, guide_service, guide_speech


def session():
    c = TestClient(app)
    c.post('/api/session')
    return c


def test_category_conversation_and_fallback_without_birth_profile(database, monkeypatch):
    c = session()
    monkeypatch.setattr(guide_service, 'generate_json', lambda *a, **k: None)
    texts = []
    for focus in ['marriage', 'relationships', 'career', 'business', 'numerology', 'growth']:
        response = c.post('/api/journey/guide', json={'focus': focus})
        assert response.status_code == 200
        texts.append(response.json()['text'])
    assert len(set(texts)) == 6
    seen = []
    def generate(system, prompt, *args, **kwargs):
        seen.append(prompt)
        return {'data': {'text': 'You want a clearer offer. Which customer would you most like to help?'}, 'source':'test-ai'}
    monkeypatch.setattr(guide_service, 'generate_json', generate)
    reply = c.post('/api/journey/guide', json={'focus':'business', 'stage':'context', 'intention':'A clearer offer', 'gender':'male'}).json()
    assert reply['source'] == 'test-ai'
    assert 'A clearer offer' in seen[0] and 'male' in seen[0]
    assert 'fresh, memorable opening' in seen[0]
    assert c.post('/api/journey/guide', json={'focus':'invalid'}).status_code == 422


def test_welcome_prompt_requires_a_specific_creative_hook(database, monkeypatch):
    captured = {}
    def generate(system, prompt, *args, **kwargs):
        captured['prompt'] = prompt
        with pytest.raises(ValueError):
            kwargs['validator']({'text': 'Welcome to your wellbeing reading. What matters most?'})
        kwargs['validator']({'text': 'A full day can still leave your own needs waiting outside the door. What would feeling better make possible again?'})
        return {'data': {'text': 'A full day can still leave your own needs waiting outside the door. What would feeling better make possible again?'}, 'source':'test-ai'}
    monkeypatch.setattr(guide_service, 'generate_json', generate)
    reply = session().post('/api/journey/guide', json={'focus':'wellbeing'}).json()
    assert reply['source'] == 'test-ai'
    assert 'fresh, memorable opening' in captured['prompt']


def test_natural_voice_gender_language_timings_and_cache(database, monkeypatch):
    monkeypatch.setattr(config, 'GUIDE_NEURAL_VOICE', True)
    guide_speech._cache.clear(); guide_speech._cooldown.clear()
    called = []
    async def generate(body):
        voice = guide_speech.VOICES[(body.language,body.gender)]
        called.append(voice)
        return {'audio':base64.b64encode(b'audio').decode(), 'words':[{'text':'Hello','start':0,'end':0.5}], 'voice':voice,'source':'edge-neural'}
    monkeypatch.setattr(guide_speech, '_edge', generate)
    c = session()
    for language in ['en','hi']:
        for gender in ['female','male']:
            body = {'text':'Hello there.', 'language':language,'gender':gender}
            result = c.post('/api/journey/utterance', json=body)
            assert result.status_code == 200
            assert result.json()['voice'] == guide_speech.VOICES[(language,gender)]
            assert result.json()['words'][0]['end'] == .5
            assert c.post('/api/journey/utterance', json=body).json() == result.json()
    assert len(called) == 4
    assert c.post('/api/journey/utterance', json={'text':'a'*1801}).status_code == 422
    assert TestClient(app).post('/api/journey/utterance', json={'text':'Hello'}).status_code == 401


def test_voice_outage_recovers_with_readable_error(database, monkeypatch):
    monkeypatch.setattr(config, 'GUIDE_NEURAL_VOICE', True)
    guide_speech._cache.clear(); guide_speech._cooldown.clear()
    async def fail(body): raise RuntimeError('Offline')
    def fallback(body): raise RuntimeError('Offline')
    monkeypatch.setattr(guide_speech, '_edge', fail)
    monkeypatch.setattr(guide_speech, '_gemini', fallback)
    result = session().post('/api/journey/utterance', json={'text':'Hello.'})
    assert result.status_code == 503
    assert 'read along' in result.json()['detail']


def test_saved_gender_and_guide_preference(database):
    c = session()
    profile = c.post('/api/profiles', json={'name':'Test','gender':'male','birth_date':'1996-08-14','birth_time':'09:42','place_id':'city:jaipur'}).json()
    assert profile['birth']['gender'] == 'male'
    assert c.put('/api/journey', json={'profile_id':profile['id'],'guide_gender':'male'}).status_code == 200
    assert c.get('/api/journey').json()['guide_gender'] == 'male'


def test_hindi_guide_rejects_english_provider_output(database, monkeypatch):
    from backend import ai_providers
    providers = [ai_providers.Provider(name,'test','openai','https://example.test') for name in ['wrong_language','hindi']]
    monkeypatch.setattr(ai_providers,'configured_providers',lambda:providers)
    def call(provider,*args):
        text = 'What matters most to you when you think about marriage?' if provider.name == 'wrong_language' else 'सब पूछते हैं कब। आप सोचिए, कैसा? आपके लिए शादी में सबसे ज़रूरी बात क्या है?'
        return {'text':text},1
    monkeypatch.setattr(ai_providers,'_call',call)
    result = session().post('/api/journey/guide',json={'focus':'marriage','language':'hi'}).json()
    assert result['source'] == 'hindi'
    assert result['text'].startswith('सब पूछते')
