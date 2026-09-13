from datetime import date
import json
import httpx
from fastapi.testclient import TestClient
from backend.app import app
from backend import journey, ai_providers, config
from backend.numerology import calculate, reduce_number
from backend.storage import connection

PAYLOAD = {'name':'Hitesh Chandwani','birth_date':'1996-08-14','birth_time':'09:42','place_id':'city:jaipur'}

def session():
    client = TestClient(app)
    client.post('/api/session')
    return client

def test_numerology_reference_and_conventions():
    result = calculate('hitesh chandwani','1996-08-14',date(2026,9,11))
    assert result['destiny']['steps'] == [74,11]
    assert result['soul_urge']['steps'] == [25,7]
    assert result['life_path']['steps'] == [38,11]
    assert reduce_number(29)['steps'] == [29,11]
    assert reduce_number(33)['value'] == 33
    assert calculate('Y','2000-01-01')['soul_urge'] is None
    unsupported = calculate('साहिल','2000-01-01')
    assert unsupported['destiny'] is None and unsupported['letters'] == []
    assert calculate('José','2000-01-01')['letters'][-1]['letter'] == 'E'

def test_state_ownership_reading_cache_and_deletion(database):
    a,b = session(),session()
    p = a.post('/api/profiles',json=PAYLOAD).json()
    body = {'profile_id':p['id'],'context':'I enjoy learning.','focus':'career'}
    assert b.post('/api/journey/reading',json=body).status_code == 404
    assert b.put('/api/journey',json={'profile_id':p['id']}).status_code == 404
    saved = {'step':3,'profile_id':p['id'],'context':body['context'],'draft':{'name':'A'}}
    assert a.put('/api/journey',json=saved).status_code == 200
    assert a.get('/api/journey').json()['step'] == 3
    assert b.get('/api/journey').json()['step'] == 0
    result = a.post('/api/journey/reading',json=body)
    assert result.status_code == 200, result.text
    r = result.json()
    assert r['source'] == 'template' and len(r['sections']) == 6
    assert all(i in {f['id'] for f in r['facts']} for s in r['sections'] for i in s['fact_ids'])
    assert a.post('/api/journey/reading',json=body).json()['cached'] is True
    assert b.get(f"/api/profiles/{p['id']}/numerology").status_code == 404
    assert a.delete(f"/api/profiles/{p['id']}").status_code == 204
    assert a.get('/api/journey').json()['profile_id'] is None

def test_unknown_time_never_invents_timing(database):
    c = session()
    p = c.post('/api/profiles',json={**PAYLOAD,'birth_time':None,'time_accuracy':'unknown'}).json()
    result = c.post('/api/journey/reading',json={'profile_id':p['id']}).json()
    assert len(result['sections']) == 6
    assert not any(f['id'] == 'DASHA_CURRENT' or f['id'].startswith('TRANSIT_') for f in result['facts'])
    assert result['warnings']

def test_reading_accepts_grounded_ai_and_falls_through_invalid_output(database,monkeypatch):
    c = session(); p = c.post('/api/profiles',json=PAYLOAD).json()
    good = journey.fallback_sections(p,*journey.evidence(p,journey.ReadingInput(profile_id=p['id'])),journey.ReadingInput(profile_id=p['id']))
    providers = [ai_providers.Provider('bad','test','openai','https://example.test'),ai_providers.Provider('good','test','openai','https://example.test')]
    monkeypatch.setattr(ai_providers,'configured_providers',lambda:providers)
    def call(provider,*args):
        rows = [{'id':r['id'],'text':r['text'],'fact_ids':r['fact_ids']} for r in good]
        if provider.name == 'bad': rows[0]['text'] = 'You are guaranteed to become rich. This claim must never reach the reading.'
        return {'sections':rows},1
    monkeypatch.setattr(ai_providers,'_call',call)
    r = c.post('/api/journey/reading',json={'profile_id':p['id']}).json()
    assert r['source'] == 'good'

def test_provider_pool_respects_shared_rate_limit(monkeypatch):
    providers = [ai_providers.Provider(n,'test','openai','https://example.test') for n in ['groq_pool_1','groq_pool_2','pollinations']]
    monkeypatch.setattr(ai_providers,'configured_providers',lambda:providers)
    visited=[]
    def call(provider,*args):
        visited.append(provider.name)
        if provider.name.startswith('groq'): raise ai_providers.ProviderFailure('limited',status=429)
        return {'ok':True},1
    monkeypatch.setattr(ai_providers,'_call',call)
    assert ai_providers.generate_json('','',{})['source'] == 'pollinations'
    assert visited == ['groq_pool_1','pollinations']

def test_invalid_provider_content_is_recoverable():
    import pytest
    provider = ai_providers.Provider('test','test','openai','https://example.test')
    with pytest.raises(ai_providers.ProviderFailure):
        ai_providers._extract(provider,{'choices':[{'message':{'content':None}}]})
    with pytest.raises(ValueError):
        journey.validate_numbers('Your Destiny number is 8.',calculate('Hitesh Chandwani','1996-08-14'))

def test_daily_chat_limit_and_voice_fallback(database):
    c = session(); p = c.post('/api/profiles',json=PAYLOAD).json()
    body = {'profile_id':p['id'],'message':'How can I build a useful routine?'}
    assert c.post('/api/journey/chat',json=body).json()['source'] == 'template'
    with connection() as db:
        db.execute("UPDATE journey_usage SET count=25 WHERE kind='chat'")
    assert c.post('/api/journey/chat',json=body).status_code == 429
    assert c.post('/api/journey/speech',json={'text':'Hello there.'}).status_code == 503


def test_six_categories_have_distinct_practical_readings_in_both_languages(database):
    c = session()
    p = c.post('/api/profiles', json=PAYLOAD).json()
    openings = set()
    for focus in ['marriage', 'relationships', 'career', 'growth', 'business', 'numerology']:
        for language in ['en', 'hi']:
            body = {'profile_id': p['id'], 'focus': focus, 'language': language}
            assert c.put('/api/journey', json={**body, 'step': 3}).status_code == 200
            result = c.post('/api/journey/reading', json=body)
            assert result.status_code == 200, result.text
            reading = result.json()
            assert len(reading['sections']) == 6
            assert reading['source'] == 'template'
            openings.add(reading['sections'][0]['text'])
            if language == 'en':
                assert reading['sections'][3]['title'] == 'The tradeoff to consider'
                assert reading['sections'][5]['title'] == 'Your next small step'
                assert not any(word in ' '.join(s['text'] for s in reading['sections']) for word in ['Mahadasha', 'degrees', 'Life Path', 'Sun is in'])
    assert len(openings) == 12


def test_chat_history_keeps_categories_separate_and_retains_fallback_source(database):
    c = session()
    p = c.post('/api/profiles', json=PAYLOAD).json()
    body = {'profile_id': p['id'], 'focus': 'marriage', 'message': 'How can I start a conversation?'}
    response = c.post('/api/journey/chat', json=body)
    assert response.status_code == 200
    assert 'three values' in response.json()['text']
    marriage = c.get('/api/journey/chat', params={'profile_id': p['id'], 'focus': 'marriage'}).json()
    career = c.get('/api/journey/chat', params={'profile_id': p['id'], 'focus': 'career'}).json()
    assert len(marriage) == 2 and marriage[1]['source'] == 'template'
    assert career == []
    assert session().get('/api/journey/chat', params={'profile_id': p['id'], 'focus': 'marriage'}).status_code == 404


def test_midpoint_answer_is_saved_and_changes_the_reading_request(database, monkeypatch):
    c = session(); p = c.post('/api/profiles', json=PAYLOAD).json()
    prompts = []
    def generate(system, prompt, *args, **kwargs):
        prompts.append(json.loads(prompt))
        return None
    monkeypatch.setattr(journey, 'generate_json', generate)
    base = {'profile_id':p['id'], 'focus':'career'}
    assert c.post('/api/journey/reading',json=base).status_code == 200
    answer = 'Finding confidence. I would like a small practice each week.'
    assert c.put('/api/journey',json={**base,'step':9,'reflection':answer}).status_code == 200
    assert c.get('/api/journey').json()['reflection'] == answer
    response = c.post('/api/journey/reading',json={**base,'reflection':answer})
    assert response.status_code == 200 and response.json()['cached'] is False
    assert prompts[-1]['user_stated']['reflection'] == answer
    assert len(prompts) == 2
