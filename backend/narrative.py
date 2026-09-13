"""Grounded narrative generation. AI writes prose but never calculates astrology."""
import json
import re
from .ai_providers import generate_json, record_rejection
from .ephemeris import SIGNS

SIGN_THEMES = {
    "Aries": "direct initiative", "Taurus": "stability and steady values",
    "Gemini": "curiosity and exchange", "Cancer": "care and emotional security",
    "Leo": "creative self-expression", "Virgo": "discernment and practical service",
    "Libra": "balance and partnership", "Scorpio": "depth and transformation",
    "Sagittarius": "meaning and exploration", "Capricorn": "structure and responsibility",
    "Aquarius": "independence and community", "Pisces": "imagination and compassion",
}
HOUSE_THEMES = {
    1: "identity and approach", 2: "resources and values", 3: "learning and communication",
    4: "home and foundations", 5: "creativity and joy", 6: "routines and service",
    7: "partnership", 8: "shared resources and change", 9: "beliefs and wider learning",
    10: "public direction and work", 11: "community and long-term aims", 12: "rest and inner life",
}
ASPECT_PHRASES = {
    "Conjunction": "concentrates attention with", "Sextile": "opens a cooperative link with",
    "Square": "creates a point of friction with", "Trine": "moves easily with",
    "Opposition": "asks for balance with",
}
PLANET_PROMPTS = {
    "Sun": "act from a clear sense of purpose", "Moon": "notice your emotional pace",
    "Mercury": "slow down and make your words precise", "Venus": "choose reciprocity and proportion",
    "Mars": "direct effort into one useful action", "Jupiter": "make room for learning without overreaching",
    "Saturn": "work patiently with limits", "Rahu": "question urgency before pursuing it",
    "Ketu": "release what no longer needs your attention", "Uranus": "leave room for adjustment",
    "Neptune": "separate intuition from assumption", "Pluto": "approach change deliberately",
}
FORBIDDEN = re.compile(
    r"\b(you will die|death is certain|terminal|diagnos(?:e|is)|you are pregnant|guaranteed|"
    r"certainly will|must invest|quit your medication|curse(?:d)?|doomed|fatal)\b", re.I,
)
PLACEMENT = re.compile(
    r"\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Rahu|Ketu)\b"
    r".{0,24}?\b(?:in|occupies|placed in)\s+"
    r"(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b",
    re.I,
)

SYSTEM = """You write careful, warm astrology reflections from supplied calculated facts.
Astrology is interpretive, so use language such as may, can, invites, suggests, or in this tradition.
Never calculate a placement, add a transit, predict a concrete event, diagnose health, guarantee an
outcome, or give legal, medical, financial, fertility, death, or relationship directives. Use only
the supplied fact IDs. Return JSON matching the schema, with no Markdown or extra keys."""


def _fact(identifier, text, section=None):
    return {"id": identifier, "text": text, "section": section}


def _placement_pairs(facts):
    pairs = set()
    for fact in facts:
        for planet, sign in PLACEMENT.findall(fact["text"]):
            pairs.add((planet.lower(), sign.lower()))
    return pairs


def _validate_text(text, facts, minimum=30, maximum=900):
    if not isinstance(text, str):
        raise ValueError("Narrative text must be a string")
    text = " ".join(text.split())
    if not minimum <= len(text) <= maximum or "<" in text or ">" in text or FORBIDDEN.search(text):
        raise ValueError("Narrative text did not pass safety validation")
    allowed = _placement_pairs(facts)
    for planet, sign in PLACEMENT.findall(text):
        if (planet.lower(), sign.lower()) not in allowed:
            raise ValueError("Narrative introduced an unsupported placement")
    return text


def _item_schema(fact_ids):
    return {"type": "object", "properties": {
        "text": {"type": "string"},
        "fact_ids": {"type": "array", "items": {"type": "string", "enum": fact_ids},
                     "minItems": 1, "maxItems": 4}},
        "required": ["text", "fact_ids"], "additionalProperties": False}


def _daily_facts(facts):
    rows = []
    for key, label in (("sun_sign", "Sun"), ("moon_sign", "Moon"), ("rising_sign", "Ascendant")):
        if facts.get(key):
            rows.append(_fact(label.upper(), f"Natal {label} is in {facts[key]}."))
    for index, transit in enumerate(facts.get("top_transits", []), 1):
        direction = "applying" if transit.get("applying") else "separating"
        rows.append(_fact(f"T{index}",
            f"Transiting {transit['planet_a']} forms a {transit['aspect']} to natal "
            f"{transit['planet_b']} at {transit['orb']:.2f} degrees orb; it is {direction}."))
    return rows


def _daily_fallback(facts, language):
    top = facts.get("top_transits", [])
    if language == "hi":
        return ["आज एक ऐसी प्राथमिकता चुनें जो आपके लिए मायने रखती हो। उसे थोड़ा ध्यान देने से प्रगति महसूस हो सकती है; बहुत सारे वादे आपकी ऊर्जा बाँट सकते हैं।",
                "एक छोटे काम के लिए बीस मिनट रखें या कोई अधूरी बात शांति से शुरू करें। फिर अपने अनुभव से देखें कि क्या मददगार था और क्या बदलना चाहेंगे।"]
    focus = PLANET_PROMPTS.get(top[0]['planet_a'], 'give one meaningful task your attention') if top else 'give one meaningful task your attention'
    return [
        f"A useful reflection for today: {focus}. A clear priority can help you make progress, while too many commitments can divide the energy you need for it.",
        "Give one manageable task twenty focused minutes, or make room for an unhurried conversation. Notice what helped and adjust the next step to your actual circumstances.",
    ]


def daily_narrative(facts, language="en"):
    rows = _daily_facts(facts)
    ids = [row["id"] for row in rows]
    fallback = _daily_fallback(facts, language)
    if not ids:
        return {"source": "template", "model": None, "reflections": fallback,
                "grounding_fact_ids": [], "provider_latency_ms": None}
    schema = {"type": "object", "properties": {
        "paragraphs": {"type": "array", "items": _item_schema(ids), "minItems": 2, "maxItems": 2}},
        "required": ["paragraphs"], "additionalProperties": False}
    prompt = json.dumps({"language": "Hindi" if language == "hi" else "English",
                         "task": "Write two concise paragraphs for today's reflective reading. Use plain everyday language about potential benefits, a relevant tradeoff and an achievable next step. Explain what the user can do, without naming planets, degrees, aspects or calculations in the prose; keep the supporting evidence in fact_ids. Never present the suggestions as guaranteed outcomes.",
                         "facts": rows}, ensure_ascii=False)
    result = generate_json(SYSTEM, prompt, schema, 320)
    if not result:
        return {"source": "template", "model": None, "reflections": fallback,
                "grounding_fact_ids": [], "provider_latency_ms": None}
    try:
        items = result["data"]["paragraphs"]
        if not isinstance(items, list) or len(items) != 2:
            raise ValueError("Expected two paragraphs")
        used, texts = [], []
        for item in items:
            fact_ids = item.get("fact_ids")
            if not isinstance(fact_ids, list) or not fact_ids or any(value not in ids for value in fact_ids):
                raise ValueError("Invalid grounding IDs")
            used.extend(fact_ids)
            texts.append(_validate_text(item.get("text"), rows, 40, 650))
        if any(row["id"].startswith("T") for row in rows) and not any(value.startswith("T") for value in used):
            raise ValueError("Transit facts were not used")
    except (KeyError, TypeError, ValueError):
        record_rejection(result["source"])
        return {"source": "template_validation", "model": result["model"], "reflections": fallback,
                "grounding_fact_ids": [], "provider_latency_ms": result["latency_ms"]}
    return {"source": result["source"], "model": result["model"], "reflections": texts,
            "grounding_fact_ids": list(dict.fromkeys(used)), "provider_latency_ms": result["latency_ms"]}


def _life_facts(chart, system):
    planets, houses = chart["planets"], chart.get("houses")
    def placement(identifier, planet, section):
        data = planets[planet]
        sign = data.get("sign") or " or ".join(data.get("possible_signs", [])) or "uncertain"
        house = f", house {data['house']} ({HOUSE_THEMES[data['house']]})" if data.get("house") else ""
        precision = " Possible sign range due to birth-time uncertainty." if data.get("sign") is None else ""
        return _fact(identifier, f"Natal {planet} is in {sign}{house}.{precision}", section)
    rows = [placement("CORE_SUN", "Sun", "core"), placement("CORE_MOON", "Moon", "core"),
            placement("LOVE_VENUS", "Venus", "relationships"), placement("DRIVE_MARS", "Mars", "relationships"),
            placement("GROWTH_SATURN", "Saturn", "growth")]
    if houses:
        rising = SIGNS[int(houses["ascendant"] // 30)]
        mc = SIGNS[int(houses["midheaven"] // 30)]
        rows.extend([_fact("CORE_RISING", f"Natal Ascendant is in {rising}.", "core"),
                     _fact("CAREER_MC", f"Natal Midheaven is in {mc}.", "career")])
        tenth = [name for name, value in planets.items() if value.get("house") == 10]
        rows.append(_fact("CAREER_TENTH", "Planets in the natal 10th house: " + (", ".join(tenth) if tenth else "none of the calculated bodies") + ".", "career"))
    else:
        rows.append(_fact("CAREER_UNAVAILABLE", "Midheaven and 10th-house placements are unavailable because an exact birth time was not supplied.", "career"))
    for index, aspect in enumerate(chart.get("aspects", [])[:4], 1):
        rows.append(_fact(f"NATAL_ASPECT_{index}",
            f"Natal {aspect['planet_a']} forms a {aspect['aspect']} to {aspect['planet_b']} at {aspect['orb']:.2f} degrees orb.",
            "growth"))
    if system == "vedic":
        from .vedic import kundali
        report = kundali(chart)
        moon_star = report.get("moon_nakshatra")
        if moon_star:
            rows.append(_fact("CORE_NAKSHATRA", f"Moon nakshatra is {moon_star['name']}, pada {moon_star['pada']}, ruled by {moon_star['lord']}.", "core"))
        for index, yoga in enumerate(report.get("yogas", [])[:4], 1):
            rows.append(_fact(f"YOGA_{index}", f"Detected {yoga['name']}: {yoga['evidence']} Rule: {yoga['rule']}", "growth"))
    return rows


def _life_fallback(chart, facts):
    by_id = {row["id"]: row["text"] for row in facts}
    def sign_of(planet):
        data = chart["planets"][planet]
        return data.get("sign") or " or ".join(data.get("possible_signs", [])) or "uncertain"
    sun, moon = sign_of("Sun"), sign_of("Moon")
    venus, mars = chart["planets"]["Venus"], chart["planets"]["Mars"]
    saturn = chart["planets"]["Saturn"]
    rising = next((row["text"] for row in facts if row["id"] == "CORE_RISING"), "Birth time does not provide a reliable Ascendant.")
    tenth = by_id.get("CAREER_TENTH", "The 10th house is unavailable without an exact birth time.")
    return [
        {"title": "Core personality", "text": f"Your calculated Sun sign is {sun}, while your Moon sign is {moon}. {rising} Where a sign is uncertain, the app deliberately preserves the range instead of choosing one. This is a traditional symbolic synthesis, and your lived experience remains the better guide."},
        {"title": "Love and relationships", "text": f"Venus is in {sign_of('Venus')} and house {venus.get('house')}, while Mars is in {sign_of('Mars')} and house {mars.get('house')}. These are symbolic relationship and motivation themes; choices still depend on communication and circumstances."},
        {"title": "Career and direction", "text": f"{by_id.get('CAREER_MC', 'The Midheaven is unavailable.')} {tenth} These placements offer a symbolic lens for public direction rather than a fixed occupation or guaranteed outcome."},
        {"title": "Challenges and growth", "text": f"Saturn is in {sign_of('Saturn')} and house {saturn.get('house')}, connecting responsibility with {HOUSE_THEMES.get(saturn.get('house'), 'an unavailable house area')}. The closest natal aspects can describe tensions or supports to explore, but they do not predict a concrete event."},
    ]


def life_narrative(chart, system, language="en"):
    facts = _life_facts(chart, system)
    fallback = _life_fallback(chart, facts)
    ids = [row["id"] for row in facts]
    section_ids = ["core", "relationships", "career", "growth"]
    item = _item_schema(ids)
    item["properties"]["id"] = {"type": "string", "enum": section_ids}
    item["required"] = ["id", "text", "fact_ids"]
    schema = {"type": "object", "properties": {
        "sections": {"type": "array", "items": item, "minItems": 4, "maxItems": 4}},
        "required": ["sections"], "additionalProperties": False}
    prompt = json.dumps({"language": "Hindi" if language == "hi" else "English",
        "task": "Write four specific but non-fatalistic sections: core, relationships, career, growth. Each section must cite only relevant fact IDs.",
        "facts": facts}, ensure_ascii=False)
    result = generate_json(SYSTEM, prompt, schema, 800)
    if not result:
        return {"source": "template", "model": None, "steps": fallback,
                "facts": [row["text"] for row in facts], "grounding": {}}
    titles = {"core": "Core personality", "relationships": "Love and relationships",
              "career": "Career and direction", "growth": "Challenges and growth"}
    try:
        sections = result["data"]["sections"]
        if not isinstance(sections, list) or {section.get("id") for section in sections} != set(section_ids):
            raise ValueError("Expected four unique sections")
        steps, grounding = [], {}
        fact_sections = {row["id"]: row["section"] for row in facts}
        for section_id in section_ids:
            section = next(value for value in sections if value["id"] == section_id)
            selected = section.get("fact_ids")
            if not isinstance(selected, list) or not selected or any(value not in ids for value in selected):
                raise ValueError("Invalid grounding IDs")
            if not any(fact_sections[value] == section_id for value in selected):
                raise ValueError("Section is not grounded in its subject")
            steps.append({"title": titles[section_id],
                          "text": _validate_text(section.get("text"), facts, 70, 850)})
            grounding[section_id] = selected
    except (KeyError, StopIteration, TypeError, ValueError):
        record_rejection(result["source"])
        return {"source": "template_validation", "model": result["model"], "steps": fallback,
                "facts": [row["text"] for row in facts], "grounding": {}}
    return {"source": result["source"], "model": result["model"], "steps": steps,
            "facts": [row["text"] for row in facts], "grounding": grounding,
            "provider_latency_ms": result["latency_ms"]}


# Compatibility for callers created before grounded-narrative-2.
choose_reflections = daily_narrative
