"""Natural male/female Hindi and Indian-English speech with real word timings."""
import asyncio
import base64
import io
import json
import logging
import re
import threading
import time
import wave
from typing import Literal
import httpx
from pydantic import BaseModel, Field
from fastapi import HTTPException
from . import config
from .journey import allowance
from .storage import digest

class UtteranceInput(BaseModel):
    text: str = Field(min_length=1, max_length=1800)
    language: Literal['en', 'hi'] = 'en'
    gender: Literal['female', 'male'] = 'female'
    rate: float = Field(default=1.0, ge=0.8, le=1.2)

_lock = threading.Lock()
_cache = {}
_cooldown = {}
_locks = [threading.Lock() for _ in range(16)]
LOGGER = logging.getLogger('dearuniverse.speech')
VOICES = {('en','female'):'en-IN-NeerjaNeural', ('en','male'):'en-IN-PrabhatNeural',
          ('hi','female'):'hi-IN-SwaraNeural', ('hi','male'):'hi-IN-MadhurNeural'}

async def _edge(body):
    import edge_tts
    speech = edge_tts.Communicate(body.text, VOICES[(body.language,body.gender)],
                                  rate=f'{round((body.rate-1)*100):+d}%', boundary='WordBoundary',
                                  connect_timeout=5, receive_timeout=12)
    chunks, words = [], []
    async for chunk in speech.stream():
        if chunk['type'] == 'audio': chunks.append(chunk['data'])
        elif chunk['type'] == 'WordBoundary':
            words.append({'text':chunk['text'], 'start':round(chunk['offset']/10_000_000,3),
                          'end':round((chunk['offset']+chunk['duration'])/10_000_000,3)})
    audio = b''.join(chunks)
    if not audio: raise ValueError('No audio returned')
    return {'audio':base64.b64encode(audio).decode(), 'mime':'audio/mpeg','words':words,
            'source':'edge-neural','voice':VOICES[(body.language,body.gender)],'timing':'word-boundaries'}

def _gemini(body):
    keys = config.GEMINI_API_KEYS or ([config.GEMINI_API_KEY] if config.GEMINI_API_KEY else [])
    if not keys: raise ValueError('No Gemini speech configuration')
    model = config.GEMINI_TTS_MODEL
    name = 'Sulafat' if body.gender == 'female' else 'Achird'
    response = httpx.post(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
        headers={'x-goog-api-key':keys[0]}, timeout=15,
        json={'contents':[{'parts':[{'text':f'Read the following words exactly, as a warm {body.gender} Indian conversational guide. Natural Hindi and Indian English pronunciation, relaxed human rhythm, gentle pauses, no theatrical delivery. Do not add any words.\nTRANSCRIPT:\n{body.text}'}]}],
              'generationConfig':{'responseModalities':['AUDIO'],'speechConfig':{'voiceConfig':{'prebuiltVoiceConfig':{'voiceName':name}}}}})
    response.raise_for_status()
    parts = response.json()['candidates'][0]['content']['parts']
    inline = next(p['inlineData'] for p in parts if 'inlineData' in p)
    pcm = base64.b64decode(inline['data'])
    rate = int(re.search(r'rate=(\d+)', inline.get('mimeType','')).group(1)) if 'rate=' in inline.get('mimeType','') else 24000
    output = io.BytesIO()
    with wave.open(output,'wb') as wav:
        wav.setnchannels(1); wav.setsampwidth(2); wav.setframerate(rate); wav.writeframes(pcm)
    return {'audio':base64.b64encode(output.getvalue()).decode(),'mime':'audio/wav','words':[],
            'source':'gemini-tts','voice':name,'timing':'audio-envelope'}

def render(body, owner):
    if not config.GUIDE_NEURAL_VOICE:
        raise HTTPException(503, 'Natural speech is unavailable. Device narration and the transcript are available.')
    key = digest(body.model_dump_json())
    with _locks[int(key[:2],16)%len(_locks)]:
        with _lock:
            cached = _cache.get(key)
            if cached and cached[0] > time.monotonic(): return cached[1]
        allowance(owner,'guide_speech',160)
        # Edge supplies accurate word boundaries for animation and Indic phonetics.
        # Gemini is independently configured and can recover a speech-service outage.
        for source, generate in [('edge-neural', lambda: asyncio.run(asyncio.wait_for(_edge(body), timeout=16))),
                                  ('gemini-tts', lambda: _gemini(body))]:
            with _lock:
                if _cooldown.get(source,0)>time.monotonic(): continue
            try:
                result = generate()
                with _lock:
                    if len(_cache)>=48: _cache.pop(next(iter(_cache)))
                    _cache[key]=(time.monotonic()+1800,result)
                return result
            except Exception as error:
                # Do not log provider responses, API credentials or spoken user text.
                LOGGER.warning('Natural speech route unavailable: %s (%s)',source,type(error).__name__)
                with _lock: _cooldown[source]=time.monotonic()+120
        raise HTTPException(503,'Natural speech is temporarily unavailable. You can use device narration or read along.')
