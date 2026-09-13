from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo
from skyfield.api import wgs84
from skyfield import almanac

from .ephemeris import LOCK, initialize_ephemeris, local_to_utc, julian, from_julian, get_astronomy
from .vedic import panchang_elements
from .storage import cache_get, cache_set

def daily(day, place):
    initialize_ephemeris()
    from .config import ENGINE_VERSION
    key = f"panchang-v2:{ENGINE_VERSION}:{day}:{place['id']}"
    cached = cache_get(key)
    if cached:
        return cached

    tz = ZoneInfo(place["timezone"])
    t_start = datetime.combine(day, time.min, tzinfo=tz)
    t_end = datetime.combine(day, time.max, tzinfo=tz)

    _, ts, eph = get_astronomy()
    t0 = ts.from_datetime(t_start)
    t1 = ts.from_datetime(t_end)

    observer = wgs84.latlon(place["lat"], place["lon"])
    find_rise_set = almanac.sunrise_sunset(eph, observer)
    times, events = almanac.find_discrete(t0, t1, find_rise_set)

    sunrise = None
    sunset = None
    for t_event, event_type in zip(times, events):
        dt = t_event.astimezone(tz)
        if dt.date() == day:
            if event_type == 1 and sunrise is None:
                sunrise = dt
            elif event_type == 0 and sunset is None:
                sunset = dt

    evaluation_jd = julian(sunrise) if sunrise else julian(local_to_utc(datetime.combine(day, time(12)), place["timezone"], 0))
    data = panchang_elements(evaluation_jd)

    # End times for the four limbs: bracket the next change, then bisect to one second.
    ends = {}
    for element in ["tithi", "nakshatra", "yoga", "karana"]:
        low = evaluation_jd
        high = low
        for _ in range(72):
            high += 1 / 24
            if panchang_elements(high)[element] != data[element]:
                break
            low = high
        else:
            ends[element] = None
            continue
        for _ in range(20):
            middle = (low + high) / 2
            if panchang_elements(middle)[element] == data[element]:
                low = middle
            else:
                high = middle
        ends[element] = from_julian(high)

    rahu = None
    abhijit = None
    if sunrise and sunset and sunset > sunrise:
        segment = (sunset - sunrise) / 8
        number = [2, 7, 5, 6, 4, 3, 8][day.weekday()]
        rahu = {
            "start": (sunrise + segment * (number - 1)).isoformat(),
            "end": (sunrise + segment * number).isoformat(),
        }
        if day.weekday() != 2:
            muhurta = (sunset - sunrise) / 15
            begin, finish = sunrise + 7 * muhurta, sunrise + 8 * muhurta
            overlap = begin < datetime.fromisoformat(rahu["end"]) and finish > datetime.fromisoformat(rahu["start"])
            abhijit = {"start": begin.isoformat(), "end": finish.isoformat(), "overlaps_rahu_kaal": overlap}

    data.update(
        date=day.isoformat(),
        place=place,
        sunrise=sunrise.isoformat() if sunrise else None,
        sunset=sunset.isoformat() if sunset else None,
        rahu_kaal=rahu,
        abhijit=abhijit,
        ends=ends,
        convention="Lahiri; limbs at local sunrise; apparent upper-limb sunrise via high-precision astronomical calculations",
        warning=None if sunrise else "No sunrise on this local date; limbs evaluated at local noon, Rahu Kaal unavailable.",
    )
    cache_set(key, data, 7 * 86400)
    return data
