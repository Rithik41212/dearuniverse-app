"""Offline city seeds + optional explicit, cached Nominatim search. No autocomplete requests."""
import hashlib
import json
import threading
import time
import httpx
from . import config
from .storage import connection, cache_get, cache_set

INDIA = [("Mumbai",19.076,72.8777),("Delhi",28.6139,77.209),("Bengaluru",12.9716,77.5946),
 ("Chennai",13.0827,80.2707),("Kolkata",22.5726,88.3639),("Hyderabad",17.385,78.4867),
 ("Pune",18.5204,73.8567),("Jaipur",26.9124,75.7873),("Ahmedabad",23.0225,72.5714),
 ("Lucknow",26.8467,80.9462),("Patna",25.5941,85.1376),("Bhopal",23.2599,77.4126),
 ("Indore",22.7196,75.8577),("Surat",21.1702,72.8311),("Nagpur",21.1458,79.0882),
 ("Chandigarh",30.7333,76.7794),("Bhubaneswar",20.2961,85.8245),("Raipur",21.2514,81.6296),
 ("Ranchi",23.3441,85.3096),("Guwahati",26.1445,91.7362),("Kochi",9.9312,76.2673),
 ("Thiruvananthapuram",8.5241,76.9366),("Visakhapatnam",17.6868,83.2185),
 ("Varanasi",25.3176,82.9739),("Agra",27.1767,78.0081),("Amritsar",31.634,74.8723),
 ("Dehradun",30.3165,78.0322),("Srinagar",34.0837,74.7973),("Panaji",15.4909,73.8278),
 ("Coimbatore",11.0168,76.9558),("Mysuru",12.2958,76.6394),("Jodhpur",26.2389,73.0243)]
WORLD = [("London, United Kingdom",51.5074,-.1278,"Europe/London"),
 ("New York, USA",40.7128,-74.006,"America/New_York"),
 ("Los Angeles, USA",34.0522,-118.2437,"America/Los_Angeles"),
 ("Sydney, Australia",-33.8688,151.2093,"Australia/Sydney"),
 ("Dubai, UAE",25.2048,55.2708,"Asia/Dubai"),
 ("Singapore",1.3521,103.8198,"Asia/Singapore"),
 ("Kathmandu, Nepal",27.7172,85.324,"Asia/Kathmandu"),
 ("Tromso, Norway",69.6492,18.9553,"Europe/Oslo"),
 ("Kiritimati, Kiribati",1.8721,-157.4278,"Pacific/Kiritimati")]
SEARCH_LOCK = threading.Lock()
last_request = 0.0

def store_place(place):
    with connection() as db:
        db.execute("INSERT OR REPLACE INTO places VALUES (?,?)", (place["id"], json.dumps(place)))
    return place

def seed_places():
    for name, lat, lon, tz in [(n + ", India", a, b, "Asia/Kolkata") for n,a,b in INDIA] + WORLD:
        store_place({"id": "city:" + name.split(",")[0].lower().replace(" ", "-"),
                     "name": name, "lat": lat, "lon": lon, "timezone": tz,
                     "source": "offline city centre", "precision": "city"})

def get_place(place_id):
    with connection() as db:
        row = db.execute("SELECT data FROM places WHERE id=?", (place_id,)).fetchone()
    if not row:
        raise ValueError("Choose a birthplace from the search results.")
    return json.loads(row[0])

def search(query):
    query = query.strip()
    with connection() as db:
        places = [json.loads(r[0]) for r in db.execute("SELECT data FROM places")]
    aliases = {"bangalore": "bengaluru", "bombay": "mumbai", "calcutta": "kolkata", "madras": "chennai"}
    normalized = aliases.get(query.lower(), query.lower())
    local = [p for p in places if normalized in p["name"].lower()][:8]
    if local or not config.GEOCODER_ENABLED:
        return {"results": local, "online_enabled": config.GEOCODER_ENABLED,
                "attribution": "© OpenStreetMap contributors (ODbL)" if any(p["source"] == "OpenStreetMap" for p in local) else "City-centre coordinates"}
    key = "geocode:" + hashlib.sha256(normalized.encode()).hexdigest()
    cached = cache_get(key)
    if cached:
        return cached
    # One process is supported locally; SQLite lease also limits multiple workers.
    from .storage import claim_job
    global last_request
    with SEARCH_LOCK:
        if not claim_job("geocoder-rate", 1.1):
            raise ValueError("Place search is busy. Please retry in a moment.")
        time.sleep(max(0, 1.1 - (time.monotonic() - last_request)))
        last_request = time.monotonic()
        response = httpx.get("https://nominatim.openstreetmap.org/search",
                             params={"q": query, "format": "jsonv2", "limit": 5},
                             headers={"User-Agent": "AntarikshaLocal/1.0 (birthplace search)" + (f" contact: {config.GEOCODER_CONTACT}" if config.GEOCODER_CONTACT else "")}, timeout=12)
        response.raise_for_status()
    from timezonefinder import TimezoneFinder
    finder = TimezoneFinder()
    results = []
    for item in response.json():
        lat, lon = float(item["lat"]), float(item["lon"])
        tz = finder.timezone_at(lat=lat, lng=lon)
        if tz:
            results.append(store_place({"id": f"osm:{item['osm_type']}:{item['osm_id']}",
                       "name": item["display_name"], "lat": lat, "lon": lon, "timezone": tz,
                       "source": "OpenStreetMap", "precision": item.get("type", "place")}))
    data = {"results": results, "online_enabled": True, "attribution": "© OpenStreetMap contributors (ODbL)"}
    cache_set(key, data, 30 * 86400)
    return data
