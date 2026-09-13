from datetime import date, datetime, timezone
from concurrent.futures import ThreadPoolExecutor
import json
import httpx
from fastapi.testclient import TestClient
from backend.app import app
from backend import ai_providers, config, narrative, transits
from backend.storage import connection, cache_get
from backend.places import get_place
from backend.panchang import daily

PAYLOAD = {"name":"Test User", "birth_date":"1996-08-14", "birth_time":"09:42", "place_id":"city:jaipur"}

def client():
    c = TestClient(app)
    assert c.post("/api/session").status_code == 200
    return c

def test_profile_ownership_edit_delete_and_invalid_places(database):
    a,b = client(),client()
    response = a.post("/api/profiles", json=PAYLOAD)
    assert response.status_code == 201
    profile = response.json()
    pid = profile["id"]
    assert len(profile["charts"]) == 2
    assert b.get(f"/api/profiles/{pid}").status_code == 404
    assert b.delete(f"/api/profiles/{pid}").status_code == 404
    changed = a.put(f"/api/profiles/{pid}",json={**PAYLOAD,"birth_time":"10:42"}).json()
    assert profile["charts"]["western"]["signature"] != changed["charts"]["western"]["signature"]
    assert a.post("/api/profiles",json={**PAYLOAD,"place_id":"injected"}).status_code == 422
    assert a.delete(f"/api/profiles/{pid}").status_code == 204
    assert a.get("/api/profiles").json() == []

def test_reject_cross_origin_and_no_session(database):
    c = TestClient(app)
    assert c.get("/api/profiles").status_code == 401
    assert c.post("/api/session",headers={"Origin":"https://untrusted.example"}).status_code == 403

def test_offline_geocoding_and_unknown_time(database):
    c=client()
    assert c.get("/api/places?q=Bombay").json()["results"][0]["id"] == "city:mumbai"
    p=c.post("/api/profiles",json={**PAYLOAD,"birth_time":None,"time_accuracy":"unknown"}).json()
    assert c.get(f"/api/profiles/{p['id']}/dashas").json()["available"] is False
    assert c.get(f"/api/profiles/{p['id']}/kundali").json()["available"] is False
    reading=c.get(f"/api/profiles/{p['id']}/onboarding-funnel").json()
    assert reading["source"] == "template" and len(reading["steps"]) == 4
    assert any("unavailable" in fact for fact in reading["facts"])


def test_saved_approximate_profile_is_migrated_and_can_drive_transits(database):
    c=client()
    profile=c.post("/api/profiles",json={**PAYLOAD,"time_accuracy":"approximate","uncertainty_minutes":30}).json()
    profile["charts"]["vedic"]["engine_version"]="legacy"
    for planet in profile["charts"]["vedic"]["planets"].values():
        planet["longitude"]=None
    with connection() as db:
        db.execute("UPDATE profiles SET data=? WHERE id=?",(json.dumps(profile),profile["id"]))
    migrated=c.get(f"/api/profiles/{profile['id']}").json()
    chart=migrated["charts"]["vedic"]
    assert chart["engine_version"] == config.ENGINE_VERSION
    assert chart["time_available"] is True and chart["time_known"] is False
    assert all(planet["longitude"] is not None for planet in chart["planets"].values())
    transits.refresh_snapshots()
    forecast=c.get(f"/api/profiles/{profile['id']}/forecast?system=vedic&tz=Asia/Kolkata")
    assert forecast.status_code == 200
    assert forecast.json()["facts"]["time_known"] is False

def test_scheduler_once_and_no_calculation_in_forecast_requests(database, monkeypatch):
    with ThreadPoolExecutor(2) as pool:
        results = list(pool.map(lambda _: transits.refresh_snapshots(), range(2)))
    assert sum(value > 0 for value in results) == 1
    assert transits.refresh_snapshots() == 0
    c=client()
    p=c.post("/api/profiles",json=PAYLOAD).json()
    def forbidden(*args,**kwargs): raise AssertionError("Request recomputed ephemerides")
    monkeypatch.setattr(transits,"positions",forbidden)
    first=c.get(f"/api/profiles/{p['id']}/forecast?system=vedic&tz=Asia/Kolkata")
    assert first.status_code == 200
    assert first.json()["source"] == "template"
    assert first.json()["cached"] is False
    second=c.get(f"/api/profiles/{p['id']}/forecast?system=vedic&tz=Asia/Kolkata").json()
    assert second["cached"] is True
    assert second["reflections"] == first.json()["reflections"]
    assert second["snapshot"]["at"].endswith("07:00:00+00:00")
    for period in ["week","month","year"]:
        assert c.get(f"/api/profiles/{p['id']}/forecast?period={period}").status_code == 200

def test_missing_snapshots_fail_honestly(database):
    c=client();p=c.post("/api/profiles",json=PAYLOAD).json()
    result=c.get(f"/api/profiles/{p['id']}/forecast")
    assert result.status_code == 503

def test_ai_fallback_validation_and_private_data(monkeypatch):
    monkeypatch.setattr(config,"GEMINI_API_KEY","gemini-secret")
    monkeypatch.setattr(config,"GROQ_API_KEY","groq-secret")
    monkeypatch.setattr(config,"OPENROUTER_API_KEY","")
    monkeypatch.setattr(config,"AI_MODELS",[])
    ai_providers.BREAKER.reset()
    requests=[]
    class FakeClient:
        def __init__(self,**kw): pass
        def __enter__(self): return self
        def __exit__(self,*args): pass
        def post(self,url,**kwargs):
            requests.append({"url":url, **kwargs})
            request=httpx.Request("POST",url)
            if "googleapis" in url:
                return httpx.Response(503,json={"error":"busy"},request=request)
            content={"paragraphs":[
                {"text":"Transiting Mars square natal Moon may concentrate emotional pressure, so observe the feeling before choosing a response.","fact_ids":["T1"]},
                {"text":"Your Cancer Sun can provide a steady point of reference while you work with what is actually happening today.","fact_ids":["SUN"]},
            ]}
            return httpx.Response(200,json={"choices":[{"message":{"content":json.dumps(content)}}]},request=request)
    monkeypatch.setattr(ai_providers.httpx,"Client",FakeClient)
    facts={"sun_sign":"Cancer","moon_sign":"Taurus","top_transits":[
        {"planet_a":"Mars","planet_b":"Moon","aspect":"Square","orb":1.25,"applying":True}]}
    result=narrative.daily_narrative(facts)
    assert len(requests)==3 and result["source"] == "groq"
    serialized=json.dumps([request["json"] for request in requests])
    assert "birth_date" not in serialized and "Test User" not in serialized
    assert result["grounding_fact_ids"] == ["T1", "SUN"]


def test_ai_output_with_invented_placement_is_rejected(monkeypatch):
    monkeypatch.setattr(narrative,"generate_json",lambda *args,**kwargs:{
        "source":"gemini","model":"test","latency_ms":1,"data":{"paragraphs":[
            {"text":"Mars is in Pisces, where it guarantees a dramatic result despite the supplied chart facts.","fact_ids":["SUN"]},
            {"text":"Your Cancer Sun may support a reflective pace while actual circumstances remain central.","fact_ids":["SUN"]}]}})
    result=narrative.daily_narrative({"sun_sign":"Cancer","top_transits":[]})
    assert result["source"] == "template_validation"

def test_panchang_daylight_rahu_and_polar_absence(database):
    data=daily(date(2026,9,10),get_place("city:jaipur"))
    rise=datetime.fromisoformat(data["sunrise"])
    sunset=datetime.fromisoformat(data["sunset"])
    start=datetime.fromisoformat(data["rahu_kaal"]["start"])
    assert rise < start < sunset
    assert abs((start-rise).total_seconds()/(sunset-rise).total_seconds()-5/8)<1e-6
    assert 1 <= data["tithi_number"] <= 30
    assert all(datetime.fromisoformat(v)>rise for v in data["ends"].values() if v)
    polar=daily(date(2026,12,21),get_place("city:tromso"))
    assert polar["sunrise"] is None and polar["rahu_kaal"] is None

def test_matching_group_and_prashna(database):
    c=client()
    a=c.post("/api/profiles",json=PAYLOAD).json()
    b=c.post("/api/profiles",json={**PAYLOAD,"name":"Partner","birth_date":"1997-05-20"}).json()
    result=c.post("/api/compatibility",json={"profile_a":a["id"],"profile_b":b["id"]})
    assert result.status_code == 200 and result.json()["vedic"]["available"]
    assert len(result.json()["vedic"]["factors"]) == 8
    group=c.post("/api/compatibility/group",json={"profile_ids":[a["id"],b["id"]]}).json()
    assert len(group["pairs"]) == 1
    assert c.post("/api/prashna?place_id=city:jaipur").status_code == 200
    assert c.get(f"/api/profiles/{a['id']}/onboarding-funnel").status_code == 200
