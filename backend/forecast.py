from datetime import datetime, timedelta, timezone, time
from zoneinfo import ZoneInfo
import hashlib
import json
import threading
from . import config
from .ephemeris import aspects, SIGNS
from .transits import read_snapshot
from .storage import cache_get, cache_set
from .narrative import daily_narrative
from .ai_providers import provider_signature, record_cache

# Bounded lock stripes avoid duplicate AI requests without an ever-growing lock map.
LOCKS = [threading.Lock() for _ in range(32)]

def forecast(profile, system, zone, language="en", period="day", day=None):
    tz = ZoneInfo(zone)
    day = day or datetime.now(tz).date()
    chart = profile["charts"][system]
    # Local noon is rounded to the nearest shared UTC hour; the actual instant is returned.
    noon = datetime.combine(day, time(12), tz).astimezone(timezone.utc)
    rounded = (noon + timedelta(minutes=30)).replace(minute=0, second=0, microsecond=0)
    if period == "day":
        moments = [rounded]
    elif period in ("week", "month"):
        moments = [datetime.combine(day + timedelta(days=d), time(12), timezone.utc) for d in range(7 if period == "week" else 30)]
    else:
        moments = [datetime.combine(day + timedelta(days=d), time(12), timezone.utc) for d in range(0, 365, 30)]
    # Reject missing/stale snapshots before considering cached prose.
    snapshots = [read_snapshot(m, system) for m in moments]
    key_data = [chart["signature"], day.isoformat(), zone, language, period, config.NARRATIVE_VERSION,
                provider_signature(), [s["at"] for s in snapshots]]
    key = "forecast:" + hashlib.sha256(json.dumps(key_data).encode()).hexdigest()
    with LOCKS[int(key[-2:], 16) % len(LOCKS)]:
        cached = cache_get(key)
        if cached:
            record_cache(True)
            return {**cached, "cached": True}
        record_cache(False)
        all_aspects = []
        for snapshot in snapshots:
            for aspect in aspects(snapshot["planets"], chart["planets"], transit=True):
                uncertainty = chart["planets"][aspect["planet_b"]].get("longitude_uncertainty_degrees", 0)
                all_aspects.append({**aspect, "at": snapshot["at"],
                                    "estimated": chart["time_accuracy"] == "approximate",
                                    "orb_uncertainty": uncertainty})
        # Weight contacts to personal planets, then exactness; deduplicate repeating slow transits.
        ranked = sorted(all_aspects, key=lambda a: a["orb"] + (0 if a["planet_b"] in ["Sun", "Moon", "Mercury", "Venus", "Mars"] else 1))
        top, seen = [], set()
        for a in ranked:
            identity = (a["planet_a"], a["planet_b"], a["aspect"])
            if identity not in seen:
                seen.add(identity)
                top.append(a)
            if len(top) == 4:
                break
        facts = {"system": system, "sun_sign": chart["planets"]["Sun"]["sign"],
                 "moon_sign": chart["planets"]["Moon"]["sign"],
                 "rising_sign": SIGNS[int(chart["houses"]["ascendant"] / 30)] if chart["houses"] else None,
                 "top_transits": top, "time_known": chart["time_known"]}
        narrative = daily_narrative(facts, language)
        statements = [f"{a['planet_a']} {a['aspect'].lower()} natal {a['planet_b']} · orb {a['orb']:.2f}°"
                      + (f" ±{a['orb_uncertainty']:.4f}° estimated" if a["estimated"] and a["orb_uncertainty"] < 0.001
                         else f" ±{a['orb_uncertainty']:.3f}° estimated" if a["estimated"] and a["orb_uncertainty"] < 0.01
                         else f" ±{a['orb_uncertainty']:.2f}° estimated" if a["estimated"] else "") for a in top]
        result = {"date": day.isoformat(), "timezone": zone, "system": system, "period": period,
                  "chart_signature": chart["signature"], "language": language, "facts": facts,
                  "statements": statements, **narrative, "cached": False,
                  "snapshot": snapshots[0], "snapshot_times": [s["at"] for s in snapshots],
                  "sampling": "Nearest UTC hour to local noon" if period == "day" else "Daily noon UTC samples" if period in ("week", "month") else "30-day noon UTC samples; broad overview, not an event calendar",
                  "uncertainty": chart["warnings"],
                  "notice": "Astronomical positions are calculated; interpretations are reflective, not verified predictions."}
        # Short fallback TTL lets a newly started model recover automatically.
        cache_set(key, result, 3600 if narrative["source"] == "template" else 2 * 86400)
        return result
