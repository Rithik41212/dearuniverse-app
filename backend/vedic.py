"""Explicit Lahiri/true-node conventions. Traditional indicators, not predictions."""
from datetime import datetime, timezone
from .ephemeris import SIGNS, from_julian, julian, positions
from .vedic_knowledge import NAKSHATRA_METADATA
from .vedic_rules import dignity, detect_doshas, detect_yogas

NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
 "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
 "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
 "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
 "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]
LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
YEARS = dict(zip(LORDS, [7, 20, 6, 10, 7, 18, 16, 19, 17]))
YEAR_DAYS = 365.25636  # sidereal-year convention, explicitly versioned
CLASSICAL = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]

def nakshatra(lon):
    index = int((lon % 360) / (360 / 27))
    progress = (lon % (360 / 27)) / (360 / 27)
    metadata = NAKSHATRA_METADATA[index]
    return {"index": index, "name": NAKSHATRAS[index], "pada": min(4, int(progress * 4) + 1),
            "lord": LORDS[index % 9], "fraction_elapsed": progress,
            "degree_in_nakshatra": progress * (360 / 27),
            "deity": metadata["deity"], "symbol": metadata["symbol"], "shakti": metadata["shakti"]}

def subdivision(lon, division):
    sign = int(lon / 30)
    part = min(division - 1, int(lon % 30 / (30 / division)))
    if division == 9:
        # Movable starts from itself; fixed from ninth; dual from fifth.
        start = (sign + [0, 8, 4][sign % 3]) % 12
    elif division == 10:
        start = sign if sign % 2 == 0 else (sign + 8) % 12
    else:
        start, part = sign, 0
    return (start + part) % 12

def kundali(chart):
    if not chart["time_known"]:
        return {"available": False, "reason": "An exact birth time is required for Kundali divisions and house-based indicators."}
    ps = chart["planets"]
    asc = chart["houses"]["ascendant"]
    divisions = {}
    for factor in (1, 9, 10):
        rising = subdivision(asc, factor)
        divisions[f"D{factor}"] = {"ascendant_sign": SIGNS[rising], "planets": {
            name: {"sign": SIGNS[subdivision(p["longitude"], factor)],
                   "house": (subdivision(p["longitude"], factor) - rising) % 12 + 1}
            for name, p in ps.items() if name in CLASSICAL + ["Rahu", "Ketu"]}}
    mars_sign = int(ps["Mars"]["longitude"] / 30)
    mangal = {}
    for label, base in [("Ascendant", int(asc / 30)), ("Moon", int(ps["Moon"]["longitude"] / 30)),
                        ("Venus", int(ps["Venus"]["longitude"] / 30))]:
        house = (mars_sign - base) % 12 + 1
        mangal[label] = {"house": house, "present": house in [1, 2, 4, 7, 8, 12]}
    node = ps["Rahu"]["longitude"]
    offsets = [(ps[n]["longitude"] - node) % 360 for n in CLASSICAL]
    boundary = any(min(v, abs(v - 180), 360 - v) < .01 for v in offsets)
    enclosed = all(0 < v < 180 for v in offsets) or all(180 < v < 360 for v in offsets)
    kaal_sarp = {"present": None if boundary else enclosed, "boundary_uncertain": boundary}
    dignities = {name: dignity(name, data["longitude"])
                 for name, data in ps.items() if name in CLASSICAL + ["Rahu", "Ketu"]}
    result = {"available": True, "moon_nakshatra": nakshatra(ps["Moon"]["longitude"]),
            "planet_nakshatras": {name: nakshatra(data["longitude"]) for name, data in ps.items()},
            "divisions": divisions, "dignities": dignities,
            "mangal": mangal, "kaal_sarp": kaal_sarp,
            "conventions": ["Lahiri sidereal, true nodes, Whole Sign D1 houses",
                            "D9 Parashari navamsa; D10 odd/even sign convention",
                            "Mangal: Mars in 1, 2, 4, 7, 8, 12 from Lagna, Moon and Venus; cancellation rules not applied",
                            "Kaal Sarp: strict enclosure of seven classical planets between nodes; no life-event inference",
                            "Yogas are structural detections with evidence; strength, cancellation and life outcomes are not inferred"]}
    result["yogas"] = detect_yogas(chart)
    result["doshas"] = detect_doshas(chart, mangal, kaal_sarp)
    return result

def dashas(chart, as_of=None, year_days=YEAR_DAYS):
    if not chart["time_known"]:
        return {"available": False, "reason": "An exact birth time is needed for reliable dasha dates.", "periods": [], "current": None}
    birth_jd = chart["jd"]
    star = nakshatra(chart["planets"]["Moon"]["longitude"])
    initial = LORDS.index(star["lord"])
    cursor = birth_jd - star["fraction_elapsed"] * YEARS[star["lord"]] * year_days
    now_jd = julian(as_of or datetime.now(timezone.utc))
    periods, current = [], None
    # Two cycles include a complete 120-year post-birth horizon, even after a partial first period.
    for i in range(18):
        lord = LORDS[(initial + i) % 9]
        end = cursor + YEARS[lord] * year_days
        children, sub_start = [], cursor
        for j in range(9):
            sub = LORDS[(initial + i + j) % 9]
            sub_end = sub_start + YEARS[lord] * YEARS[sub] / 120 * year_days
            item = {"lord": sub, "start": from_julian(sub_start), "end": from_julian(sub_end)}
            children.append(item)
            if sub_start <= now_jd < sub_end:
                pratyantar, third_start = [], sub_start
                for k in range(9):
                    third = LORDS[(initial + i + j + k) % 9]
                    third_end = third_start + (sub_end - sub_start) * YEARS[third] / 120
                    pratyantar.append({"lord": third, "start": from_julian(third_start), "end": from_julian(third_end),
                                       "active": third_start <= now_jd < third_end})
                    third_start = third_end
                current = {"mahadasha": lord, "antardasha": sub, **item, "pratyantardashas": pratyantar}
            sub_start = sub_end
        periods.append({"lord": lord, "start": from_julian(cursor), "end": from_julian(end), "antardashas": children})
        cursor = end
        if cursor >= birth_jd + 120 * year_days:
            break
    return {"available": True, "system": "Vimshottari", "year_days": year_days,
            "birth_balance_years": (1 - star["fraction_elapsed"]) * YEARS[star["lord"]],
            "nakshatra": star, "periods": periods, "current": current,
            "as_of": (as_of or datetime.now(timezone.utc)).isoformat()}

YOGAS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti",
 "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
 "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"]
TITHIS = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
          "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"]

def panchang_elements(jd):
    ps = positions(jd, "vedic")
    sun, moon = ps["Sun"]["longitude"], ps["Moon"]["longitude"]
    elongation = (moon - sun) % 360
    tithi = int(elongation / 12)
    karana = int(elongation / 6)
    karana_name = ("Kimstughna" if karana == 0 else
                   ["Shakuni", "Chatushpada", "Naga"][karana - 57] if karana >= 57 else
                   ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"][(karana - 1) % 7])
    return {"tithi": "Amavasya" if tithi == 29 else TITHIS[tithi % 15], "tithi_number": tithi + 1,
            "paksha": "Shukla" if tithi < 15 else "Krishna", "nakshatra": nakshatra(moon)["name"],
            "yoga": YOGAS[int(((sun + moon) % 360) / (360 / 27))], "karana": karana_name,
            "at": from_julian(jd)}
