"""Deterministic tropical + Lahiri sidereal calculations using Skyfield and NASA JPL DE440.

No AI in this module. High-precision astronomical planetary positions, houses,
aspects, and Vimshottari/Panchang foundations.
"""
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import RLock, local
from zoneinfo import ZoneInfo
import hashlib
import json
import math
from types import SimpleNamespace

import numpy as np
from skyfield.api import Loader, wgs84
from skyfield.framelib import ecliptic_frame

from .config import ENGINE_VERSION, ROOT, DE440_PATH

LOCK = RLock()
_THREAD_STATE = local()

SIGNS = "Aries Taurus Gemini Cancer Leo Virgo Libra Scorpio Sagittarius Capricorn Aquarius Pisces".split()
PLANET_NAMES = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]
ASPECTS = {
    "Conjunction": (0, 8),
    "Sextile": (60, 6),
    "Square": (90, 8),
    "Trine": (120, 8),
    "Opposition": (180, 8),
}

class EphemerisError(Exception):
    """Raised when an astronomical calculation fails."""
    pass

# Compatibility adapter for legacy references
swe = SimpleNamespace(
    Error=EphemerisError,
    version="Skyfield 1.55 (JPL DE440)",
)

_LOADER = None
_TIMESCALE = None
_EPHEMERIS = None

def get_astronomy():
    """Lazily load and return the Skyfield loader, timescale, and JPL DE440 ephemeris."""
    global _LOADER, _TIMESCALE, _EPHEMERIS
    with LOCK:
        if _EPHEMERIS is None:
            data_dir = ROOT / "data"
            data_dir.mkdir(parents=True, exist_ok=True)
            _LOADER = Loader(str(data_dir))
            _TIMESCALE = _LOADER.timescale()
            bsp_file = DE440_PATH if DE440_PATH.exists() else (data_dir / "de440s.bsp")
            if not bsp_file.exists():
                _EPHEMERIS = _LOADER("de440s.bsp")
            else:
                _EPHEMERIS = _LOADER(str(bsp_file.name))
        return _LOADER, _TIMESCALE, _EPHEMERIS

def initialize_ephemeris() -> None:
    """Ensure the Skyfield ephemeris and timescale are initialized."""
    with LOCK:
        if getattr(_THREAD_STATE, "initialized", False):
            return
        get_astronomy()
        _THREAD_STATE.initialized = True

def local_to_utc(naive: datetime, zone: str, fold: int | None = None) -> datetime:
    tz = ZoneInfo(zone)
    candidates = {}
    for f in (0, 1):
        utc = naive.replace(tzinfo=tz, fold=f).astimezone(timezone.utc)
        if utc.astimezone(tz).replace(tzinfo=None) == naive:
            candidates[f] = utc
    if not candidates:
        raise ValueError("This birth time did not exist during a clock change. Please check the recorded time.")
    if len(set(candidates.values())) > 1 and fold is None:
        raise ValueError("This birth time occurred twice during a clock change. Choose the first or second occurrence.")
    return candidates.get(fold, next(iter(candidates.values())))

def julian(utc: datetime) -> float:
    """Convert UTC datetime to standard Universal Time Julian Day Number."""
    utc = utc.astimezone(timezone.utc)
    y, m, d = utc.year, utc.month, utc.day
    h = utc.hour + utc.minute / 60.0 + (utc.second + utc.microsecond / 1e6) / 3600.0
    if m <= 2:
        y -= 1
        m += 12
    a = math.floor(y / 100)
    b = 2 - a + math.floor(a / 4)
    jd0 = math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1)) + d + b - 1524.5
    return float(jd0 + h / 24.0)

def from_julian(jd: float) -> str:
    """Convert Julian Day Number to ISO 8601 UTC timestamp string."""
    jd_calc = jd + 0.5
    z = math.floor(jd_calc)
    f = jd_calc - z
    if z < 2299161:
        a = z
    else:
        alpha = math.floor((z - 1867216.25) / 36524.25)
        a = z + 1 + alpha - math.floor(alpha / 4)
    b = a + 1524
    c = math.floor((b - 122.1) / 365.25)
    d = math.floor(365.25 * c)
    e = math.floor((b - d) / 30.6001)
    day = b - d - math.floor(30.6001 * e) + f
    month = e - 1 if e < 14 else e - 13
    year = c - 4716 if month > 2 else c - 4715
    day_int = int(day)
    day_frac = day - day_int
    total_seconds = round(day_frac * 86400.0, 6)
    hours = int(total_seconds // 3600)
    total_seconds -= hours * 3600
    minutes = int(total_seconds // 60)
    seconds = total_seconds - minutes * 60
    sec_int = int(seconds)
    microsec = int(round((seconds - sec_int) * 1e6))
    if microsec >= 1000000:
        sec_int += 1
        microsec -= 1000000
    if sec_int >= 60:
        minutes += 1
        sec_int -= 60
    if minutes >= 60:
        hours += 1
        minutes -= 60
    dt = datetime(year, month, day_int, hours, minutes, sec_int, microsec, tzinfo=timezone.utc)
    return dt.isoformat()

def lahiri_ayanamsa(jd: float) -> float:
    """High-precision Lahiri (Chitrapaksha) Ayanamsha in degrees.
    
    Standard IAU precession relative to J2000.0 epoch offset of 23° 51' 25.532".
    """
    T = (jd - 2451545.0) / 36525.0
    p = (5028.796195 * T + 1.1054348 * T**2 + 0.00007964 * T**3 - 0.000023857 * T**4) / 3600.0
    return 23.857092353866 + p

def positions(jd: float, system: str) -> dict:
    """Calculate geocentric apparent ecliptic coordinates for all planets + Rahu & Ketu."""
    initialize_ephemeris()
    _, ts, eph = get_astronomy()
    t = ts.ut1_jd(jd)

    earth = eph["earth"]
    targets = {
        "Sun": eph["sun"],
        "Moon": eph["moon"],
        "Mercury": eph["mercury"],
        "Venus": eph["venus"],
        "Mars": eph["mars barycenter"],
        "Jupiter": eph["jupiter barycenter"],
        "Saturn": eph["saturn barycenter"],
        "Uranus": eph["uranus barycenter"],
        "Neptune": eph["neptune barycenter"],
        "Pluto": eph["pluto barycenter"],
    }

    ayanamsa_deg = lahiri_ayanamsa(jd) if system == "vedic" else 0.0
    result = {}

    for name, target in targets.items():
        app = earth.at(t).observe(target).apparent()
        lat, lon, _, _, lon_rate, _ = app.frame_latlon_and_rates(ecliptic_frame)
        trop_lon = float(lon.degrees % 360.0)
        ecl_lat = float(lat.degrees)
        speed = float(lon_rate.degrees.per_day)

        calc_lon = float((trop_lon - ayanamsa_deg) % 360.0)
        sign_idx = int(calc_lon / 30.0) % 12

        result[name] = {
            "longitude": float(calc_lon),
            "latitude": float(ecl_lat),
            "speed": float(speed),
            "sign": SIGNS[sign_idx],
            "degree_in_sign": float(calc_lon % 30.0),
            "retrograde": bool(speed < 0.0),
            "house": None,
            "ephemeris": "jpl_de440",
        }

    # True Lunar Node (Rahu):
    moon_obs = earth.at(t).observe(eph["moon"])
    r_vec, v_vec = moon_obs.frame_xyz_and_velocity(ecliptic_frame)
    h_vec = np.cross(r_vec.km, v_vec.km_per_s)
    node_rad = np.arctan2(h_vec[0], -h_vec[1])
    rahu_trop = float((np.degrees(node_rad) + 360.0) % 360.0)
    rahu_lon = float((rahu_trop - ayanamsa_deg) % 360.0)
    rahu_sign_idx = int(rahu_lon / 30.0) % 12
    rahu_speed = -0.05295

    result["Rahu"] = {
        "longitude": float(rahu_lon),
        "latitude": 0.0,
        "speed": float(rahu_speed),
        "sign": SIGNS[rahu_sign_idx],
        "degree_in_sign": float(rahu_lon % 30.0),
        "retrograde": True,
        "house": None,
        "ephemeris": "jpl_de440",
    }

    # Ketu is exactly 180 degrees opposite to Rahu
    ketu_lon = float((rahu_lon + 180.0) % 360.0)
    ketu_sign_idx = int(ketu_lon / 30.0) % 12
    result["Ketu"] = {
        "longitude": float(ketu_lon),
        "latitude": 0.0,
        "speed": float(rahu_speed),
        "sign": SIGNS[ketu_sign_idx],
        "degree_in_sign": float(ketu_lon % 30.0),
        "retrograde": True,
        "house": None,
        "ephemeris": "jpl_de440",
    }

    return result

def angular_diff(a: float, b: float) -> float:
    return abs((a - b + 180) % 360 - 180)

def aspects(a: dict, b: dict, same_chart=False, transit=False) -> list:
    found = []
    for na, pa in a.items():
        for nb, pb in b.items():
            if (same_chart and na >= nb) or pa.get("longitude") is None or pb.get("longitude") is None:
                continue
            if {na, nb} == {"Rahu", "Ketu"}:
                continue
            delta = angular_diff(pa["longitude"], pb["longitude"])
            for name, (angle, orb_limit) in ASPECTS.items():
                orb = abs(delta - angle)
                if orb > (min(orb_limit, 3) if transit else orb_limit):
                    continue
                later_b = pb["longitude"] if transit else pb["longitude"] + pb.get("speed", 0) / 24
                later = angular_diff(pa["longitude"] + pa.get("speed", 0) / 24, later_b)
                found.append({
                    "planet_a": na,
                    "planet_b": nb,
                    "aspect": name,
                    "orb": round(orb, 5),
                    "exact_degree": angle,
                    "applying": abs(later - angle) < orb,
                })
    return sorted(found, key=lambda a: a["orb"])

def assign_house(lon: float, cusps: list) -> int:
    for i, start in enumerate(cusps):
        if (lon - start) % 360 < (cusps[(i + 1) % 12] - start) % 360:
            return i + 1
    raise ValueError("Invalid house cusps")

def _placidus_cusp(armc_rad: float, lat_rad: float, eps_rad: float, house_num: int) -> float | None:
    """Calculate single Placidus intermediate cusp using semi-arc iteration."""
    if house_num == 11:
        f = 1.0 / 3.0
        offset = math.radians(30.0)
        is_above = True
    elif house_num == 12:
        f = 2.0 / 3.0
        offset = math.radians(60.0)
        is_above = True
    elif house_num == 2:
        f = 2.0 / 3.0
        offset = math.radians(120.0)
        is_above = False
    elif house_num == 3:
        f = 1.0 / 3.0
        offset = math.radians(150.0)
        is_above = False
    else:
        raise ValueError(f"Invalid Placidus house: {house_num}")

    ra = (armc_rad + offset) % (2.0 * math.pi)

    for _ in range(60):
        tan_dec = math.sin(ra) * math.tan(eps_rad)
        val = math.tan(lat_rad) * tan_dec
        if abs(val) >= 1.0:
            return None  # Placidus geometry fails in circumpolar regions

        if is_above:
            D = math.acos(-val)
            target_ra = (armc_rad + f * D) % (2.0 * math.pi)
        else:
            N = math.acos(val)
            target_ra = (armc_rad + math.pi - (1.0 - f) * N) % (2.0 * math.pi)

        if abs(target_ra - ra) < 1e-8:
            break
        ra = target_ra
    else:
        return None

    lon = math.degrees(math.atan2(math.sin(ra), math.cos(ra) * math.cos(eps_rad))) % 360.0
    return lon

def houses(jd: float, lat: float, lon: float, system: str) -> dict:
    """Compute 12 house cusps, Ascendant, and Midheaven (MC).
    
    Uses Greenwich Apparent Sidereal Time (GAST) and true obliquity.
    Uses Whole Sign for Vedic and high latitudes (>=66°); Placidus for Western charts.
    """
    initialize_ephemeris()
    _, ts, _ = get_astronomy()
    t = ts.ut1_jd(jd)

    # Greenwich Apparent Sidereal Time
    gast_hours = t.gast
    theta = (gast_hours * 15.0 + lon) % 360.0
    armc_rad = math.radians(theta)
    lat_rad = math.radians(lat)

    # True obliquity of the ecliptic
    T = (jd - 2451545.0) / 36525.0
    eps_deg = 23.43929111 - 0.013004167 * T - 0.000000164 * T**2 + 0.000000504 * T**3
    eps_rad = math.radians(eps_deg)

    # Tropical MC and Ascendant
    mc_trop = math.degrees(math.atan2(math.sin(armc_rad), math.cos(armc_rad) * math.cos(eps_rad))) % 360.0
    asc_trop = math.degrees(
        math.atan2(
            math.cos(armc_rad),
            -math.sin(armc_rad) * math.cos(eps_rad) - math.tan(lat_rad) * math.sin(eps_rad)
        )
    ) % 360.0

    ayanamsa_deg = lahiri_ayanamsa(jd) if system == "vedic" else 0.0
    asc = (asc_trop - ayanamsa_deg) % 360.0
    mc = (mc_trop - ayanamsa_deg) % 360.0

    requested = "Whole Sign" if system == "vedic" else "Placidus"
    actual = requested
    fallback = False

    if system == "vedic" or abs(lat) >= 66.0:
        actual = "Whole Sign"
        fallback = requested != actual
        cusp1 = math.floor(asc / 30.0) * 30.0
        cusps = [(cusp1 + i * 30.0) % 360.0 for i in range(12)]
    else:
        # Western Placidus calculation
        try:
            c11 = _placidus_cusp(armc_rad, lat_rad, eps_rad, 11)
            c12 = _placidus_cusp(armc_rad, lat_rad, eps_rad, 12)
            c2 = _placidus_cusp(armc_rad, lat_rad, eps_rad, 3)
            c3 = _placidus_cusp(armc_rad, lat_rad, eps_rad, 2)

            if None in (c11, c12, c2, c3):
                raise EphemerisError("Placidus iteration failed")

            c10 = mc_trop
            c1 = asc_trop
            c4 = (c10 + 180.0) % 360.0
            c5 = (c11 + 180.0) % 360.0
            c6 = (c12 + 180.0) % 360.0
            c7 = (c1 + 180.0) % 360.0
            c8 = (c2 + 180.0) % 360.0
            c9 = (c3 + 180.0) % 360.0

            cusps = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12]
        except Exception:
            actual = "Whole Sign"
            fallback = True
            cusp1 = math.floor(asc / 30.0) * 30.0
            cusps = [(cusp1 + i * 30.0) % 360.0 for i in range(12)]

    return {
        "cusps": [float(c) for c in cusps],
        "ascendant": float(asc),
        "midheaven": float(mc),
        "requested_system": requested,
        "system": actual,
        "fallback": fallback,
    }

def calculate_chart(birth, place: dict, system: str) -> dict:
    """Calculate comprehensive astrological natal chart (Tropical Western or Lahiri Vedic)."""
    exact = birth.time_accuracy == "exact"
    time_available = birth.time_accuracy != "unknown"

    if birth.time_accuracy == "unknown":
        start = local_to_utc(datetime.combine(birth.birth_date, datetime.min.time()), place["timezone"], birth.fold)
        end = local_to_utc(datetime.combine(birth.birth_date + timedelta(days=1), datetime.min.time()), place["timezone"], birth.fold)
        reference = start
    else:
        center = local_to_utc(datetime.combine(birth.birth_date, birth.birth_time), place["timezone"], birth.fold)
        spread = timedelta(minutes=birth.uncertainty_minutes if not exact else 0)
        start, end = center - spread, center + spread
        reference = center

    jd = julian(reference)
    ps = positions(jd, system)
    hs = houses(jd, place["lat"], place["lon"], system) if exact else None
    warnings = []

    if hs:
        for p in ps.values():
            p["house"] = assign_house(p["longitude"], hs["cusps"])
        if hs["fallback"]:
            warnings.append("Whole Sign houses used because Placidus is unavailable at this latitude.")

    if not exact:
        count = max(1, int((end - start).total_seconds() / 900))
        samples = [positions(julian(start + (end - start) * i / count), system) for i in range(count + 1)]
        for name, p in ps.items():
            signs = sorted({row[name]["sign"] for row in samples}, key=SIGNS.index)
            for row in samples:
                q = row[name]
                margin = abs(q["speed"]) / 96 + 0.0001
                if q["degree_in_sign"] < margin:
                    signs.append(SIGNS[(SIGNS.index(q["sign"]) - 1) % 12])
                if q["degree_in_sign"] > 30 - margin:
                    signs.append(SIGNS[(SIGNS.index(q["sign"]) + 1) % 12])
            signs = list(dict.fromkeys(signs))
            retro = {bool(row[name]["retrograde"]) for row in samples if row[name]["retrograde"] is not None}
            retro_val = bool(next(iter(retro))) if len(retro) == 1 else None
            if time_available:
                uncertainty = max(angular_diff(row[name]["longitude"], p["longitude"]) for row in samples)
                p.update(
                    possible_signs=signs,
                    longitude_uncertainty_degrees=round(float(uncertainty), 6),
                    estimated=True,
                    retrograde=retro_val,
                )
            else:
                p.update(
                    longitude=None,
                    latitude=None,
                    speed=None,
                    degree_in_sign=None,
                    sign=signs[0] if len(signs) == 1 else None,
                    possible_signs=signs,
                    retrograde=retro_val,
                    estimated=True,
                )
        if time_available:
            warnings.append(
                "Birth time is approximate: planet positions and transit orbs use the entered time with the stated uncertainty. Houses, Ascendant, natal aspects, divisions and dasha dates are withheld."
            )
        else:
            warnings.append(
                "Birth time is unknown: exact degrees, houses, Ascendant, aspects and dasha dates are withheld."
            )

    chart = {
        "system": system,
        "zodiac": "Lahiri sidereal" if system == "vedic" else "Tropical",
        "node": "True",
        "engine_version": ENGINE_VERSION,
        "swe_version": swe.version,
        "ephemeris_engine": "Skyfield",
        "kernel": "JPL DE440",
        "time_known": exact,
        "time_available": time_available,
        "time_accuracy": birth.time_accuracy,
        "jd": jd if time_available else None,
        "utc": reference.isoformat() if time_available else None,
        "uncertainty_interval": None if exact else [start.isoformat(), end.isoformat()],
        "planets": ps,
        "houses": hs,
        "aspects": aspects(ps, ps, True) if exact else [],
        "warnings": warnings,
    }

    def _json_serial(val):
        if hasattr(val, "item"):
            return val.item()
        if isinstance(val, (np.bool_, np.generic)):
            return val.item()
        raise TypeError(f"Type {type(val)} not serializable")

    chart["signature"] = hashlib.sha256(json.dumps(chart, sort_keys=True, default=_json_serial).encode()).hexdigest()
    return chart
