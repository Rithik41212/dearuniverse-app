from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor
import pytest
import backend.ephemeris as ephemeris
from backend.models import BirthInput
from backend.ephemeris import calculate_chart, local_to_utc, angular_diff, assign_house, aspects, positions, julian
from backend.vedic import nakshatra, subdivision, dashas, kundali, YEARS
from backend.vedic_knowledge import NAKSHATRA_METADATA
from backend.vedic_rules import detect_doshas, detect_yogas, dignity
from backend.compatibility import ashtakoota, YONI

PLACE = {"lat": 26.9124, "lon": 75.7873, "timezone": "Asia/Kolkata"}

def birth(**changes):
    return BirthInput(**{"name": "Test", "birth_date": "1996-08-14", "birth_time": "09:42", "place_id": "city:jaipur", **changes})

def test_reference_chart_against_published_astrodienst_and_astrotheme():
    # Astrodienst AA source: https://www.astro.com/adbvip/adbvip_08_04.htm
    # Published Sun 12 Leo 33, Moon 3 Gemini 21, Asc 18 Aquarius 03.
    # House reference: https://www.astrotheme.fr/pdf/Barack_Obama_portrait.pdf
    place = {"lat": 21.3, "lon": -157 - 52 / 60, "timezone": "Pacific/Honolulu"}
    chart = calculate_chart(birth(birth_date="1961-08-04", birth_time="19:24"), place, "western")
    assert abs(chart["planets"]["Sun"]["longitude"] - (132 + 33/60)) < 1/60
    assert abs(chart["planets"]["Moon"]["longitude"] - (63 + 21/60)) < 1/60
    assert abs(chart["houses"]["ascendant"] - (318 + 3/60)) < 1/60
    assert chart["planets"]["Sun"]["house"] == 6
    assert chart["planets"]["Moon"]["house"] == 4
    assert chart["planets"]["Jupiter"]["retrograde"] is True
    assert chart["planets"]["Saturn"]["retrograde"] is True
    expected_cusps = [318+3/60, 355+55/60, 30+18/60, 58+54/60, 83+59/60, 109+2/60]
    for actual, expected in zip(chart["houses"]["cusps"], expected_cusps):
        assert abs(actual - expected) < 2/60

def test_midnight_and_date_line():
    assert local_to_utc(datetime(2000,1,1,0,15), "Asia/Kolkata").isoformat() == "1999-12-31T18:45:00+00:00"
    assert local_to_utc(datetime(2000,1,1,0,15), "Pacific/Kiritimati").isoformat() == "1999-12-31T10:15:00+00:00"

def test_dst_requires_disambiguation():
    naive = datetime(2020,11,1,1,30)
    with pytest.raises(ValueError, match="occurred twice"):
        local_to_utc(naive, "America/New_York")
    assert (local_to_utc(naive, "America/New_York", 1) - local_to_utc(naive, "America/New_York", 0)).total_seconds() == 3600
    with pytest.raises(ValueError, match="did not exist"):
        local_to_utc(datetime(2020,3,8,2,30), "America/New_York")

def test_unknown_time_never_fabricates_precise_results():
    chart = calculate_chart(birth(time_accuracy="unknown", birth_time=None), PLACE, "vedic")
    assert chart["jd"] is None and chart["utc"] is None and chart["houses"] is None
    assert chart["aspects"] == []
    assert all(p["longitude"] is None for p in chart["planets"].values())
    assert all(p["possible_signs"] for p in chart["planets"].values())
    assert not dashas(chart)["available"]
    assert not kundali(chart)["available"]


def test_approximate_time_keeps_estimated_planets_but_withholds_angles():
    chart = calculate_chart(birth(time_accuracy="approximate", uncertainty_minutes=30), PLACE, "vedic")
    assert chart["jd"] is not None and chart["utc"] is not None and chart["houses"] is None
    assert chart["aspects"] == [] and chart["time_known"] is False and chart["time_available"] is True
    assert all(p["longitude"] is not None and p["estimated"] for p in chart["planets"].values())
    assert all(p["longitude_uncertainty_degrees"] >= 0 for p in chart["planets"].values())
    assert chart["planets"]["Moon"]["longitude_uncertainty_degrees"] > chart["planets"]["Sun"]["longitude_uncertainty_degrees"]
    assert not dashas(chart)["available"]
    assert not kundali(chart)["available"]

def test_polar_fallback_is_explicit():
    chart = calculate_chart(birth(), {"lat":69.65,"lon":18.96,"timezone":"Europe/Oslo"}, "western")
    assert chart["houses"]["system"] == "Whole Sign"
    assert chart["houses"]["fallback"]
    assert len(chart["houses"]["cusps"]) == 12

def test_wraparound_aspects_and_house_edges():
    assert angular_diff(359,1) == 2
    cusps = [(350 + i*30) % 360 for i in range(12)]
    assert assign_house(0, cusps) == 1
    assert assign_house(20, cusps) == 2
    assert assign_house(349.99, cusps) == 12
    ps = {"Sun":{"longitude":359}, "Moon":{"longitude":1}}
    found = aspects(ps, ps, True)
    assert len(found) == 1 and found[0]["aspect"] == "Conjunction" and found[0]["orb"] == 2

def test_sidereal_settings_do_not_leak_between_concurrent_charts():
    jd = julian(datetime(2000,1,1,12,tzinfo=timezone.utc))
    expected = {s: positions(jd,s)["Sun"]["longitude"] for s in ["western","vedic"]}
    with ThreadPoolExecutor(max_workers=4) as pool:
        values = list(pool.map(lambda s: (s, positions(jd,s)["Sun"]["longitude"]), ["western","vedic"]*20))
    assert all(v == expected[s] for s,v in values)
    assert 23 < (expected["western"] - expected["vedic"]) % 360 < 25

def test_skyfield_initialization_and_engine_metadata(monkeypatch):
    monkeypatch.setattr(ephemeris._THREAD_STATE, "initialized", False, raising=False)
    ephemeris.initialize_ephemeris()
    assert ephemeris._THREAD_STATE.initialized is True
    loader, ts, eph = ephemeris.get_astronomy()
    assert loader is not None
    assert ts is not None
    assert eph is not None
    assert "skyfield-de440" in ephemeris.ENGINE_VERSION

def test_nakshatra_and_divisional_boundaries():
    assert nakshatra(0)["name"] == "Ashwini"
    assert nakshatra(0)["deity"] == "Ashwini Kumaras"
    assert nakshatra(359.999)["pada"] == 4
    assert nakshatra(360/27)["name"] == "Bharani"
    assert subdivision(0,9) == 0
    assert subdivision(30,9) == 9
    assert subdivision(60,9) == 6
    assert subdivision(29.999,9) == 8
    assert subdivision(30,10) == 9


def test_vedic_reference_data_and_rule_evidence_are_complete():
    assert len(NAKSHATRA_METADATA) == 27
    assert len({entry["name"] for entry in NAKSHATRA_METADATA}) == 27
    assert NAKSHATRA_METADATA[-1]["name"] == "Revati"
    assert dignity("Jupiter", 95)["status"] == "exalted"
    assert dignity("Jupiter", 275)["status"] == "debilitated"

    longitudes = {
        "Sun": 125, "Moon": 95, "Mars": 275, "Mercury": 130,
        "Jupiter": 100, "Venus": 5, "Saturn": 190, "Rahu": 128, "Ketu": 308,
    }
    chart = {
        "time_known": True,
        "houses": {"ascendant": 5},
        "planets": {name: {"longitude": longitude} for name, longitude in longitudes.items()},
    }
    yoga_rows = detect_yogas(chart)
    yoga_names = {row["name"] for row in yoga_rows}
    assert {"Gaja Kesari Yoga", "Ruchaka Yoga", "Hamsa Yoga", "Budha-Aditya Yoga"} <= yoga_names
    assert all(row["rule"] and row["evidence"] and row["convention"] for row in yoga_rows)

    mangal = {"Ascendant": {"house": 10, "present": False},
              "Moon": {"house": 7, "present": True},
              "Venus": {"house": 10, "present": False}}
    dosha_rows = detect_doshas(chart, mangal, {"present": False, "boundary_uncertain": False})
    dosha_names = {row["name"] for row in dosha_rows}
    assert {"Mangal Dosha", "Pitri Dosha"} <= dosha_names
    assert all(row["rule"] and row["evidence"] and row["convention"] for row in dosha_rows)

def test_vimshottari_balance_and_continuity():
    chart = calculate_chart(birth(), PLACE, "vedic")
    result = dashas(chart)
    assert sum(YEARS.values()) == 120
    assert 0 <= result["birth_balance_years"] <= YEARS[result["nakshatra"]["lord"]]
    for i, p in enumerate(result["periods"]):
        if i:
            assert p["start"] == result["periods"][i-1]["end"]
        assert p["antardashas"][0]["start"] == p["start"]
        delta = abs((datetime.fromisoformat(p["antardashas"][-1]["end"]) - datetime.fromisoformat(p["end"])).total_seconds())
        assert delta < .01
    assert result["current"] is not None
    boundary = datetime.fromisoformat(result["periods"][1]["start"])
    after = dashas(chart, boundary)
    assert after["current"]["mahadasha"] == result["periods"][1]["lord"]

def test_compatibility_reference_and_score_bounds():
    def chart(lon): return {"time_known":True, "planets":{"Moon":{"longitude":lon}}}
    # Ashwini vs Bharani, both Aries: eight base factors sum to 33/36 in the declared convention.
    result = ashtakoota(chart(1),chart(14))
    assert result["total"] == 33
    assert len(result["factors"]) == 8
    assert ashtakoota(chart(1),chart(1))["total"] == 28  # same Nadi earns zero, never an automatic 36
    for i in range(27):
        for j in range(27):
            result = ashtakoota(chart(i*360/27+.1),chart(j*360/27+.1))
            assert 0 <= result["total"] <= 36
    assert all(YONI[i][j] == YONI[j][i] for i in range(14) for j in range(14))

def test_birth_edit_changes_signature():
    assert calculate_chart(birth(), PLACE, "vedic")["signature"] != calculate_chart(birth(birth_time="10:42"), PLACE, "vedic")["signature"]
