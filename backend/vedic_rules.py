"""Deterministic, convention-labelled Vedic chart pattern detection.

These functions identify structural chart patterns. They intentionally return
the exact rule and evidence instead of turning a pattern into a life event.
"""
from .ephemeris import SIGNS, angular_diff

CLASSICAL = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
              "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"]
OWN_SIGNS = {
    "Sun": {4}, "Moon": {3}, "Mars": {0, 7}, "Mercury": {2, 5},
    "Jupiter": {8, 11}, "Venus": {1, 6}, "Saturn": {9, 10},
}
EXALTATION = {"Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5,
              "Jupiter": 3, "Venus": 11, "Saturn": 6}
DEBILITATION = {planet: (sign + 6) % 12 for planet, sign in EXALTATION.items()}


def _sign(chart, planet):
    return int(chart["planets"][planet]["longitude"] // 30)


def _house_from_sign(sign, base_sign):
    return (sign - base_sign) % 12 + 1


def _lord_of_house(ascendant_sign, house):
    return SIGN_LORDS[(ascendant_sign + house - 1) % 12]


def dignity(planet, longitude):
    """Return sign-level dignity without inventing degree-sensitive strength."""
    sign = int(longitude // 30)
    if planet not in CLASSICAL:
        status = "not_evaluated"
    elif sign == EXALTATION[planet]:
        status = "exalted"
    elif sign == DEBILITATION[planet]:
        status = "debilitated"
    elif sign in OWN_SIGNS[planet]:
        status = "own_sign"
    else:
        status = "ordinary"
    return {"planet": planet, "sign": SIGNS[sign], "status": status,
            "basis": "Sign-level dignity; moolatrikona degrees and temporary friendship are not applied."}


def vedic_aspects(planet_a, sign_a, sign_b):
    """Full Parashari sign aspects for the seven classical planets."""
    offset = (sign_b - sign_a) % 12
    aspects = {6: "7th"}
    if planet_a == "Mars":
        aspects.update({3: "4th", 7: "8th"})
    elif planet_a == "Jupiter":
        aspects.update({4: "5th", 8: "9th"})
    elif planet_a == "Saturn":
        aspects.update({2: "3rd", 9: "10th"})
    return aspects.get(offset)


def _relation(chart, a, b):
    if a == b:
        return "one planet rules both houses"
    sa, sb = _sign(chart, a), _sign(chart, b)
    if sa == sb:
        return "conjunction by sign"
    if SIGN_LORDS[sa] == b and SIGN_LORDS[sb] == a:
        return "sign exchange"
    ab, ba = vedic_aspects(a, sa, sb), vedic_aspects(b, sb, sa)
    if ab and ba:
        return f"mutual full aspect ({ab}/{ba})"
    return None


def _pattern(name, planets, rule, evidence):
    return {"name": name, "planets": sorted(set(planets)), "rule": rule,
            "evidence": evidence, "status": "detected",
            "convention": "Lahiri sidereal, true nodes, Whole Sign D1; structural pattern only."}


def detect_yogas(chart):
    if not chart.get("time_known"):
        return []
    ascendant_sign = int(chart["houses"]["ascendant"] // 30)
    yogas = []

    moon_sign, jupiter_sign = _sign(chart, "Moon"), _sign(chart, "Jupiter")
    jupiter_from_moon = _house_from_sign(jupiter_sign, moon_sign)
    if jupiter_from_moon in {1, 4, 7, 10}:
        yogas.append(_pattern("Gaja Kesari Yoga", ["Moon", "Jupiter"],
                             "Jupiter occupies a kendra (1, 4, 7 or 10) from the Moon.",
                             f"Jupiter is {jupiter_from_moon} from the Moon."))

    pancha = {
        "Mars": "Ruchaka Yoga", "Mercury": "Bhadra Yoga", "Jupiter": "Hamsa Yoga",
        "Venus": "Malavya Yoga", "Saturn": "Shasha Yoga",
    }
    for planet, name in pancha.items():
        sign = _sign(chart, planet)
        house = _house_from_sign(sign, ascendant_sign)
        strong_sign = sign in OWN_SIGNS[planet] or sign == EXALTATION[planet]
        if house in {1, 4, 7, 10} and strong_sign:
            sign_status = dignity(planet, chart["planets"][planet]["longitude"])["status"]
            yogas.append(_pattern(name, [planet],
                                 f"{planet} is in an own or exaltation sign and a kendra from the Ascendant.",
                                 f"{planet} is {sign_status} in {SIGNS[sign]}, house {house}."))

    if _sign(chart, "Sun") == _sign(chart, "Mercury"):
        yogas.append(_pattern("Budha-Aditya Yoga", ["Sun", "Mercury"],
                             "Sun and Mercury occupy the same sign.",
                             f"Both occupy {SIGNS[_sign(chart, 'Sun')]}.") )
    if _sign(chart, "Moon") == _sign(chart, "Mars"):
        yogas.append(_pattern("Chandra-Mangala Yoga", ["Moon", "Mars"],
                             "Moon and Mars occupy the same sign.",
                             f"Both occupy {SIGNS[_sign(chart, 'Moon')]}.") )

    kendra_lords = {_lord_of_house(ascendant_sign, house) for house in (1, 4, 7, 10)}
    trikona_lords = {_lord_of_house(ascendant_sign, house) for house in (5, 9)}
    raja = []
    for kendra_lord in sorted(kendra_lords):
        for trikona_lord in sorted(trikona_lords):
            relation = _relation(chart, kendra_lord, trikona_lord)
            if relation:
                raja.append(f"{kendra_lord}-{trikona_lord}: {relation}")
    if raja:
        planets = [name for item in raja for name in item.split(":", 1)[0].split("-")]
        yogas.append(_pattern("Raja Yoga", planets,
                             "A kendra lord and a trikona lord are the same or connect by conjunction, mutual full aspect or exchange.",
                             raja))

    wealth_lords = {_lord_of_house(ascendant_sign, house) for house in (2, 11)}
    dhana = []
    for wealth_lord in sorted(wealth_lords):
        for trikona_lord in sorted(trikona_lords):
            relation = _relation(chart, wealth_lord, trikona_lord)
            if relation:
                dhana.append(f"{wealth_lord}-{trikona_lord}: {relation}")
    second_lord, eleventh_lord = (_lord_of_house(ascendant_sign, house) for house in (2, 11))
    relation = _relation(chart, second_lord, eleventh_lord)
    if relation:
        dhana.append(f"{second_lord}-{eleventh_lord}: {relation}")
    if dhana:
        planets = [name for item in dhana for name in item.split(":", 1)[0].split("-")]
        yogas.append(_pattern("Dhana Yoga", planets,
                             "Lords of houses 2 or 11 connect with lords of houses 5 or 9, or the 2nd and 11th lords connect.",
                             list(dict.fromkeys(dhana))))
    return yogas


def detect_doshas(chart, mangal, kaal_sarp):
    if not chart.get("time_known"):
        return []
    found = []
    present_from = [base for base, value in mangal.items() if value["present"]]
    if present_from:
        found.append({"name": "Mangal Dosha", "status": "detected", "evidence": mangal,
                      "rule": "Mars is in house 1, 2, 4, 7, 8 or 12 from at least one declared reference point.",
                      "convention": "Checked separately from Ascendant, Moon and Venus; cancellation rules are not applied."})
    if kaal_sarp["present"] is True:
        found.append({"name": "Kaal Sarp", "status": "detected", "evidence": kaal_sarp,
                      "rule": "All seven classical planets are strictly enclosed within one half of the Rahu-Ketu axis.",
                      "convention": "True nodes; strict enclosure; planets on the axis are reported as uncertain."})

    sun = chart["planets"]["Sun"]["longitude"]
    node_orbs = {node: angular_diff(sun, chart["planets"][node]["longitude"])
                 for node in ("Rahu", "Ketu")}
    node, orb = min(node_orbs.items(), key=lambda item: item[1])
    if orb <= 10:
        found.append({"name": "Pitri Dosha", "status": "detected",
                      "evidence": {"Sun": sun, node: chart["planets"][node]["longitude"], "orb": round(orb, 5)},
                      "rule": "Sun is within 10 degrees of Rahu or Ketu.",
                      "convention": "Popular Sun-node conjunction definition; definitions vary by school and no life outcome is inferred."})
    return found

