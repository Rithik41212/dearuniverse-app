import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, date, timezone
from itertools import combinations
import json
import logging
import os
import secrets
import time
from typing import Annotated, Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from fastapi import FastAPI, Depends, HTTPException, Request, Response, Query
from fastapi.responses import JSONResponse
import httpx
from . import config
from .storage import init_db, connection, digest
from .places import seed_places, search, get_place
from .models import BirthInput, MatchInput, GroupInput
from .ephemeris import calculate_chart, initialize_ephemeris, swe, EphemerisError
from .transits import refresh_snapshots
from .forecast import forecast
from .vedic import kundali, dashas
from .compatibility import compare
from .panchang import daily as panchang_daily
from .ai_providers import health as ai_health, provider_signature, record_cache
from .narrative import life_narrative
from . import journey
from .guide_service import GuideInput
from .guide_speech import UtteranceInput

async def scheduler():
    while True:
        try:
            await asyncio.to_thread(refresh_snapshots)
        except Exception:
            logging.getLogger(__name__).exception("Scheduled ephemeris refresh failed; retrying in 60 seconds")
        await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app):
    initialize_ephemeris()
    init_db()
    journey.initialize()
    seed_places()
    migrate_saved_profiles()
    task = asyncio.create_task(scheduler())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(title="DearUniverse local astrology", version="1.0.0", lifespan=lifespan)
ORIGINS = set(os.environ.get("ASTRO_ALLOWED_ORIGINS", "http://localhost:8443,http://127.0.0.1:8443,http://localhost:8000,http://127.0.0.1:8000").split(","))

@app.middleware("http")
async def protect_local_api(request: Request, call_next):
    origin = request.headers.get("origin")
    if origin and origin not in ORIGINS:
        return JSONResponse({"detail": "Origin not allowed"}, status_code=403)
    if int(request.headers.get("content-length", "0")) > 32768:
        return JSONResponse({"detail": "Request too large"}, status_code=413)
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response

@app.exception_handler(ValueError)
async def input_error(request, error):
    return JSONResponse({"detail": str(error)}, status_code=422)

@app.exception_handler(ZoneInfoNotFoundError)
async def timezone_error(request, error):
    return JSONResponse({"detail": "Unknown timezone"}, status_code=422)

@app.exception_handler(LookupError)
async def missing_snapshot(request, error):
    return JSONResponse({"detail": str(error)}, status_code=503)

@app.exception_handler(httpx.HTTPError)
async def geocoder_error(request, error):
    return JSONResponse({"detail": "Place search is unavailable. Try a supported offline city or retry later."}, status_code=503)

@app.exception_handler(EphemerisError)
async def ephemeris_error(request, error):
    return JSONResponse({"detail": "This chart could not be calculated with the supplied data."}, status_code=422)

def owner(request: Request):
    token = request.cookies.get("astro_session", "")
    if not token:
        raise HTTPException(401, "Start a local session first.")
    identity = digest(token)
    with connection() as db:
        exists = db.execute("SELECT 1 FROM sessions WHERE id=?", (identity,)).fetchone()
    if not exists:
        raise HTTPException(401, "Session expired. Reload the app.")
    return identity

Owner = Annotated[str, Depends(owner)]
System = Literal["western", "vedic"]

@app.get('/api/journey')
def journey_state(identity: Owner):
    return journey.read_state(identity)

@app.put('/api/journey')
def update_journey(body: journey.StateInput, identity: Owner):
    if body.profile_id:
        get_profile(body.profile_id, identity)
    return journey.save_state(identity, body)

@app.post('/api/journey/reading')
def journey_reading(body: journey.ReadingInput, identity: Owner):
    return journey.reading(get_profile(body.profile_id, identity), body, identity)

@app.post('/api/journey/chat')
def journey_chat(body: journey.ChatInput, identity: Owner):
    return journey.chat(get_profile(body.profile_id, identity), body, identity)

@app.get('/api/journey/chat')
def journey_chat_history(profile_id: str, identity: Owner, focus: Literal['growth', 'career', 'relationships', 'wellbeing', 'marriage', 'business', 'numerology'] = 'growth'):
    profile = get_profile(profile_id, identity)
    with connection() as db:
        rows = db.execute('SELECT role,text,source FROM journey_chat WHERE owner=? AND signature=? ORDER BY rowid DESC LIMIT 40',
                          (identity,journey.chat_signature(profile, focus))).fetchall()
    return [dict(row) for row in rows][::-1]

@app.post('/api/journey/speech')
def journey_speech(body: journey.SpeechInput, identity: Owner):
    from .voice import speak
    return Response(speak(body.text, identity), media_type='audio/wav')

@app.post('/api/journey/guide')
def guide_turn(body: GuideInput, identity: Owner):
    from .guide_service import respond
    return respond(body, identity)

@app.post('/api/journey/utterance')
def guide_utterance(body: UtteranceInput, identity: Owner):
    from .guide_speech import render
    return render(body, identity)

@app.get('/api/profiles/{profile_id}/numerology')
def profile_numerology(profile_id: str, identity: Owner, name: str = Query(default='',max_length=80)):
    from .numerology import calculate
    profile = get_profile(profile_id, identity)
    return calculate(name or profile['birth']['name'],profile['birth']['birth_date'],datetime.now(ZoneInfo(profile['place']['timezone'])).date())


@app.get("/api/health/ai-providers")
def ai_provider_health(identity: Owner, probe: bool = False):
    """An explicit authenticated probe spends one small call per configured provider."""
    return ai_health(probe)


def _profile_is_current(profile):
    charts = profile.get("charts", {})
    return all(charts.get(system, {}).get("engine_version") == config.ENGINE_VERSION
               for system in ("western", "vedic"))


def _recalculate_profile(profile):
    birth = BirthInput.model_validate(profile["birth"])
    place = get_place(birth.place_id)
    return {**profile, "birth": birth.model_dump(mode="json"), "place": place,
            "charts": {system: calculate_chart(birth, place, system) for system in ("western", "vedic")},
            "updated_at": datetime.now(timezone.utc).isoformat()}


def migrate_saved_profiles():
    """Recalculate stored charts when calculation semantics or ephemeris data change."""
    with connection() as db:
        rows = db.execute("SELECT id, owner, data FROM profiles").fetchall()
    for row in rows:
        try:
            profile = json.loads(row["data"])
            if _profile_is_current(profile):
                continue
            profile = _recalculate_profile(profile)
            with connection() as db:
                db.execute("UPDATE profiles SET data=? WHERE id=? AND owner=?",
                           (json.dumps(profile), row["id"], row["owner"]))
        except (KeyError, TypeError, ValueError, LookupError):
            logging.getLogger(__name__).exception("Stored profile migration failed id=%s", row["id"])


def get_profile(profile_id, identity):
    with connection() as db:
        row = db.execute("SELECT data FROM profiles WHERE id=? AND owner=?", (profile_id, identity)).fetchone()
    if not row:
        raise HTTPException(404, "Profile not found")
    profile = json.loads(row[0])
    if not _profile_is_current(profile):
        profile = _recalculate_profile(profile)
        with connection() as db:
            db.execute("UPDATE profiles SET data=? WHERE id=? AND owner=?",
                       (json.dumps(profile), profile_id, identity))
    return profile

@app.get("/api/health")
def health():
    return {"status": "ok", "engine": config.ENGINE_VERSION, "ephemeris": "High-precision Vedic ephemeris",
            "kernel": "de440s.bsp", "swiss_ephemeris": swe.version,
            "ai_configured": bool(provider_signature()), "ai_providers": provider_signature(),
            "storage": "SQLite", "mode": "local"}

@app.post("/api/session")
def session(request: Request, response: Response):
    try:
        owner(request)
    except HTTPException:
        token = secrets.token_urlsafe(48)
        with connection() as db:
            db.execute("INSERT INTO sessions VALUES (?,?)", (digest(token), time.time()))
        response.set_cookie("astro_session", token, httponly=True, samesite="strict",
                            secure=os.environ.get("ASTRO_SECURE_COOKIE") == "1", max_age=365*86400, path="/api")
    return {"ok": True}

@app.get("/api/places")
def places(identity: Owner, q: str = Query(min_length=2, max_length=120)):
    return search(q)

@app.get("/api/profiles")
def profiles(identity: Owner):
    with connection() as db:
        profile_ids = [row[0] for row in db.execute("SELECT id FROM profiles WHERE owner=?", (identity,))]
    return [get_profile(profile_id, identity) for profile_id in profile_ids]

def save_profile(birth, identity, profile_id=None):
    place = get_place(birth.place_id)
    if profile_id:
        get_profile(profile_id, identity)
    else:
        with connection() as db:
            count = db.execute("SELECT count(*) FROM profiles WHERE owner=?", (identity,)).fetchone()[0]
        if count >= 20:
            raise HTTPException(409, "This local session supports up to 20 profiles.")
    result = {"id": profile_id or secrets.token_urlsafe(18), "birth": birth.model_dump(mode="json"),
              "place": place, "charts": {system: calculate_chart(birth, place, system) for system in ["western", "vedic"]},
              "updated_at": datetime.now(timezone.utc).isoformat()}
    with connection() as db:
        db.execute("INSERT OR REPLACE INTO profiles VALUES (?,?,?)", (result["id"], identity, json.dumps(result)))
    return result

@app.post("/api/profiles", status_code=201)
@app.post("/api/signup", status_code=201)
def create_profile(birth: BirthInput, identity: Owner):
    return save_profile(birth, identity)

@app.put("/api/profiles/{profile_id}")
def update_profile(profile_id: str, birth: BirthInput, identity: Owner):
    return save_profile(birth, identity, profile_id)

@app.get("/api/profiles/{profile_id}")
def profile(profile_id: str, identity: Owner):
    return get_profile(profile_id, identity)

@app.delete("/api/profiles/{profile_id}", status_code=204)
def delete_profile(profile_id: str, identity: Owner):
    get_profile(profile_id, identity)
    with connection() as db:
        db.execute("DELETE FROM profiles WHERE id=? AND owner=?", (profile_id, identity))
        # Purge derived cached narratives too; snapshots contain no personal data.
        db.execute("DELETE FROM cache WHERE key LIKE 'forecast:%' OR key LIKE 'onboarding:%' OR key LIKE 'journey:%'")
        db.execute("DELETE FROM journey_chat WHERE owner=?", (identity,))
        saved = db.execute("SELECT data FROM journeys WHERE owner=?", (identity,)).fetchone()
        if saved and json.loads(saved[0]).get('profile_id') == profile_id:
            db.execute("DELETE FROM journeys WHERE owner=?", (identity,))
    return Response(status_code=204)

@app.get("/api/profiles/{profile_id}/chart")
def chart(profile_id: str, identity: Owner, system: System = "vedic"):
    return get_profile(profile_id, identity)["charts"][system]

@app.get("/api/profiles/{profile_id}/forecast")
@app.get("/api/profiles/{profile_id}/daily-forecast")
def daily_forecast(profile_id: str, identity: Owner, system: System = "vedic", tz: str = "Asia/Kolkata",
                   language: Literal["en", "hi"] = "en", period: Literal["day", "week", "month", "year"] = "day"):
    ZoneInfo(tz)
    return forecast(get_profile(profile_id, identity), system, tz, language, period)

@app.get("/api/profiles/{profile_id}/onboarding-funnel")
def onboarding(profile_id: str, identity: Owner, system: System = "vedic"):
    data = get_profile(profile_id, identity)["charts"][system]
    from .storage import cache_get, cache_set
    key_data = [data["signature"], config.NARRATIVE_VERSION, provider_signature()]
    key = "onboarding:" + digest(json.dumps(key_data, sort_keys=True))
    result = cache_get(key)
    record_cache(bool(result))
    if not result:
        prose = life_narrative(data, system)
        result = {"system": system, "warnings": data["warnings"], **prose}
        cache_set(key, result, 3600 if prose["source"].startswith("template") else 2 * 86400)
    return result

@app.get("/api/profiles/{profile_id}/kundali")
def kundali_route(profile_id: str, identity: Owner):
    return kundali(get_profile(profile_id, identity)["charts"]["vedic"])

@app.get("/api/profiles/{profile_id}/dashas")
def dasha_route(profile_id: str, identity: Owner, year_days: Literal[365.25636, 365.2425, 360.0] = 365.25636):
    return dashas(get_profile(profile_id, identity)["charts"]["vedic"], year_days=year_days)

@app.get("/api/panchang")
def panchang_route(identity: Owner, place_id: str, day: date | None = None):
    place = get_place(place_id)
    today = datetime.now(ZoneInfo(place["timezone"])).date()
    chosen = day or today
    if abs((chosen - today).days) > 366:
        raise HTTPException(422, "Choose a date within one year of today.")
    return panchang_daily(chosen, place)

@app.post("/api/compatibility")
def compatibility_route(body: MatchInput, identity: Owner):
    if body.profile_a == body.profile_b:
        raise HTTPException(422, "Choose two different profiles.")
    return compare(get_profile(body.profile_a, identity), get_profile(body.profile_b, identity), body.orientation)

@app.post("/api/prashna")
def prashna_route(identity: Owner, place_id: str):
    place = get_place(place_id)
    now = datetime.now(ZoneInfo(place["timezone"]))
    # Event time comes from the server, not untrusted birth-date validation.
    birth = BirthInput.model_construct(name="Prashna", birth_date=now.date(), birth_time=now.time().replace(tzinfo=None),
                                      place_id=place_id, fold=now.fold)
    return {"id": "prashna", "birth": birth.model_dump(mode="json"), "place": place,
            "charts": {s: calculate_chart(birth, place, s) for s in ["western", "vedic"]}}

@app.post("/api/compatibility/group")
def group_route(body: GroupInput, identity: Owner):
    if len(set(body.profile_ids)) != len(body.profile_ids):
        raise HTTPException(422, "Choose distinct profiles.")
    ps = [get_profile(i, identity) for i in body.profile_ids]
    return {"pairs": [compare(a,b) for a,b in combinations(ps, 2)], "notice": "Pairwise comparisons; no invented group score."}
