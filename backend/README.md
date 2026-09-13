# Antariksha local astrology service

The React screens keep their established styling, navigation and card motion. The existing menu now opens saved birth profiles and calculated reports. The service runs locally with SQLite and Swiss Ephemeris. Gemini, Groq, OpenRouter and Ollama-compatible models are optional; grounded templates work without them.

## Run on this Windows workspace

`npm run dev` now starts and monitors the local backend automatically. It launches Python directly so workspace paths with spaces work on Windows, checks health every five seconds, and makes up to three startup attempts. Changes to backend Python files or `backend/.env` restart the backend when Vite owns that process. An existing healthy service is reused; it is never terminated by another launcher. Setting `ASTRO_BACKEND_URL` disables local auto-start and uses that configured service.

`npm run backend` also checks health first and reuses an existing healthy backend, avoiding duplicate port-8000 launches. When used independently it stays attached to the Python process until stopped. To verify both the service and Vite proxy, open `http://127.0.0.1:8000/api/health` and `http://127.0.0.1:8443/api/health`.

The virtual environment and official planet/Moon data files have already been installed in this workspace. In a terminal at the project root:

```powershell
npm run backend
```

The service listens on **127.0.0.1:8000**. Vite forwards `/api` requests to it. Use the existing preview, then **Menu → Add a profile**. You enter a name, birth date, recorded local time (or its uncertainty), and select a birthplace. Both chart systems are calculated automatically; no age, coordinates, timezone or zodiac arithmetic is required from the user.

Access reports through:

- **Menu → My birth chart**: Western/Vedic selector, daily reading, Kundali, Dashas, compatibility, life reading, chart export.
- **Chart**: calculated natal wheel, actual transit aspects, and location-based Panchang.
- **Menu → Synastry & compatibility**: compare two saved profiles.
- **Menu → Group compatibility**: pairwise comparisons for 2–8 profiles.
- **Menu → Prashna Kundali**: cast the current moment at the selected profile's location.
- **Menu → Dosha check**: the explicitly defined traditional indicators.
- The existing Panchang action opens the Abhijit/Rahu Kaal reference and limb transition times.

The card-of-the-day fan and its continuous lift/flip/return animation remain unchanged. With a saved profile, its initial Sun sign comes from the selected calculation system. Tarot is a separate reflection feature, not an ephemeris calculation. The original sign-only match exploration also remains separate from the full two-profile compatibility report.

## Recreate the environment

Requires Python 3.12 and Node. On Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.lock.txt
.\.venv\Scripts\python.exe -m backend.download_ephemeris
npm run backend
```

On Linux/macOS, use `.venv/bin/python` instead of `.venv\Scripts\python.exe`. The direct launch command is `python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000`. The lock file records the tested Windows environment; `requirements.txt` supplies top-level compatible constraints for other environments.

The maintained **pysweph 2.10.3.6** continuation is used because the original `pyswisseph` source distribution requires absent Windows C++ build tools. It imports as `swisseph`. Its three-value `calc_ut` result and 13-entry house cusp array are normalized by the adapter. Do not install both bindings in the same environment.

The ephemeris downloader fetches `sepl_18.se1` and `semo_18.se1` from Astrodienst's official repository. The generated manifest records source URLs, sizes and SHA-256 digests. Calculations record their actual ephemeris source. Without the files, supported planets use Moshier; no startup download happens silently. File fingerprints form part of calculation and cache versions. Restart after changing ephemeris files.

## Activate grounded AI

Copy `backend/.env.example` to `backend/.env`, add one or more server-side keys, and restart `npm run backend`. The application loads this local file itself; it is excluded from Git. Never put a provider key in React code or a `VITE_` environment variable.

```powershell
Copy-Item backend/.env.example backend/.env
# Edit backend/.env and set at least one key, then restart:
npm run backend
```

The active order is:

1. Gemini `gemini-2.5-flash-lite`
2. Groq `openai/gpt-oss-20b`
3. OpenRouter `openrouter/free`
4. Up to three local Ollama-compatible models from `ASTRO_AI_MODELS`
5. Deterministic grounded template

These defaults were checked on 2026-09-10. Gemini 2.0 shut down in June 2026, and Groq's `llama-3.1-8b-instant` shut down on 2026-08-16, so the older model IDs in the supplied plan are deliberately not used. Provider availability and free-tier quotas can still change; models are configurable without code changes.

Each adapter has an eight-second default timeout, one bounded retry for temporary transport/429/5xx failures, and a five-minute circuit breaker after three failed requests. Authentication and other permanent 4xx errors immediately move to the next provider. OpenRouter uses its current free router instead of a rotating hard-coded free model slug.

Daily readings and four-part life readings are generated from anonymous, structured chart facts. Name, birth date, birth time, coordinates, place and profile ID are not sent. The model must return JSON with explicit fact IDs. The server rejects unsupported planet/sign claims, unknown fact IDs, unsafe certainty, concrete health/death/fertility/financial directives, HTML, malformed schemas and oversized text. Rejected output falls back to deterministic prose. The AI never calculates planetary positions, houses, aspects, dashas, yogas or compatibility.

Successful AI readings are cached by the complete chart signature, date, timezone, period, language, transit snapshot and provider/model configuration. This prevents a superficially similar person from receiving another user's natal-transit prose. Template and rejected-output fallbacks expire after one hour so a recovered provider is retried; accepted AI output is cached for two days.

`GET /api/health` reports configured providers without secrets. After starting a browser session, `GET /api/health/ai-providers` reports circuits, failures, 429 counts, rejected responses and cache hit rate. Add `?probe=true` only when you intentionally want to spend one minimal request per configured provider to check reachability.

Gemini's free tier may use submitted prompts to improve Google products. The integration minimizes exposure by sending only anonymous chart facts. Use a paid no-training tier or a local model if that is unsuitable. OpenRouter's free router has low quotas and variable model selection, so it is a last cloud fallback rather than the primary production provider.

## Place lookup and time handling

- Common Indian cities and several international locations work completely offline, using labelled city-centre coordinates.
- An explicit **Find birthplace** request for an unlisted place uses the public Nominatim service, with caching, identification and a shared request-rate lease. Typing does not trigger requests. `ASTRO_GEOCODER_ENABLED=0` disables all online lookup. `ASTRO_GEOCODER_CONTACT` optionally adds the operator's identifying contact address.
- Geocoding submits only the search text, not a saved birth profile. OpenStreetMap attribution is displayed with results. The public service is appropriate only for light use under its policy, not high-volume deployment; replace or self-host it as usage grows.
- `timezonefinder` chooses an IANA zone from coordinates; `zoneinfo`/`tzdata` apply date-specific clock rules. Current geographical timezone boundaries are not a complete historical atlas. Older boundary changes and uncertain records need independent verification. Exact hospital coordinates are not inferred from a city-centre selection.
- Ambiguous clock-change times ask for the first/second occurrence. Nonexistent times are rejected. UTC is converted to UT1 with Swiss Ephemeris's time conversion routines.
- Birth dates supported by the form are 1900 through today. Approximate times are sampled over the stated uncertainty interval; unknown times are sampled over the actual local birth day, including variable DST day length. Sampling is at most 15 minutes, with conservative boundary margins.
- Approximate-time charts calculate geocentric planet positions at the entered time, sample the stated uncertainty window, and attach a longitude uncertainty to every body. They can therefore power clearly labelled estimated transit aspects. Houses, Ascendant, natal aspects, division charts and dasha dates remain withheld because those are more time-sensitive.
- Unknown-time charts return possible signs and withhold precise longitudes, houses, Ascendant, aspects, division charts and dasha dates. They do not silently become noon charts.

## Defined calculation scope

| Feature | Implemented convention |
| --- | --- |
| Western natal | Tropical zodiac; Sun through Pluto plus true North/South nodes; Placidus houses, explicit Whole Sign polar fallback |
| Vedic natal | Lahiri sidereal zodiac; true Rahu/Ketu; Whole Sign houses; classical Navagraha report |
| Natal aspects | Conjunction/opposition/square/trine, 8°; sextile, 6°; duplicate/self-pairs excluded |
| Transit aspects | Same angles, capped at 3° orb; applying/separating evaluated against natal positions; approximate birth times include sampled orb uncertainty |
| House membership | Ecliptic-longitude cusp intervals; no near-next-cusp advancement rule |
| Kundali | D1 Rashi, standard Parashari D9 Navamsa and D10 Dashamsa; all-planet nakshatra/pada/deity/symbol/shakti metadata; sign-level dignities |
| Dashas | Vimshottari; birth balance, Mahadasha and Antardasha timeline covering 120 years after birth; current Pratyantardashas |
| Dasha year | Default 365.25636 days; API can select 365.2425 or 360.0; comparisons must use the same convention |
| Compatibility | Western synastry plus eight base North Indian Ashtakoota factors, total /36; explicit directional roles; no gender inference |
| Mangal | Mars in houses 1, 2, 4, 7, 8, 12 counted separately from Lagna, Moon and Venus |
| Kaal Sarp | Strict enclosure of seven classical planets between true nodes, with a conservative boundary flag |
| Named yogas | Evidence-bearing detection for Gaja Kesari, Pancha Mahapurusha, Budha-Aditya, Chandra-Mangala, Raja and Dhana patterns; no inferred life events or strength |
| Pitri | Popular Sun-node conjunction definition at a 10-degree orb, labelled as school-dependent |
| Panchang | Sunrise-based tithi, nakshatra, yoga, karana and their next transitions; sunrise/sunset and weekday Rahu Kaal |
| Abhijit | Eighth daylight division, excluded on Wednesday; Rahu Kaal overlap disclosed |
| Prashna | Chart of the server's current moment at the explicitly displayed profile location |

There is no single implementation covering every regional astrological school. The compatibility and dosha reports **do not apply cancellation rules or regional exceptions**. D2/D3/etc., other dasha systems, exhaustive yoga catalogues, Shadbala, lunar-month calendar conventions, personalized electional timing and life-event prediction are not implemented. The interface does not claim otherwise. These would need separately specified rules and reference fixtures. Astrological interpretations and traditional matching scores are not scientifically established predictions or health assessments.

The Home rings show counts of selected transit contacts associated with each theme, not fabricated probabilities. Non-personal sign browsing is labelled a general reflection. Existing non-astrological features such as audio, consultations and palm reading keep their existing behavior.

## Scheduling, caching and storage

- The FastAPI lifespan starts a small scheduler that checks every minute. It creates shared daily noon UTC samples over the coming year, plus hourly samples around the current day. No user request computes a fresh transit snapshot.
- SQLite leases prevent multiple workers duplicating the successful daily job. Unique snapshot keys and short-lived failure leases make retries safe. A failed worker is retried; missing snapshots return an explicit service-unavailable result.
- Daily readings use the nearest shared UTC hour to the user's local noon and expose the actual timestamp. Weekly/monthly readings use daily samples; yearly readings use 30-day samples. These are overviews, **not exact transit-event calendars**.
- Cache identity includes chart signature, data/engine version, date, timezone, language, period, narrative version, configured models and sample timestamps. Birth edits recompute both charts and naturally change the signature.
- SQLite runs with foreign keys and WAL. The default file is `backend/data/astro.sqlite3`. `ASTRO_DB_PATH` can move it. A separate Redis or hosted database is not necessary for the local workload.
- Birth charts are stored as complete JSON with original input and calculation metadata. User-facing chart export downloads this complete profile. Keep backups and filesystem access limited to the operator.
- Stored profiles are recalculated automatically when the engine version or ephemeris fingerprint changes, preventing old chart semantics from surviving a backend upgrade.
- Browser sessions use a random HttpOnly SameSite cookie and hashed database session IDs; all profile reads/writes are scoped to that owner. Raw birth data is not stored in browser localStorage, only active-profile/system preferences.
- This is a **local browser-session service**, not a deployed multi-device account/login system. Clearing the session cookie loses access through that browser; export profiles before clearing browser data. There is no email recovery or public signup authentication. Add a proper account system, TLS, rate limits, consent/retention policy and operational monitoring before public deployment. Do not expose Ollama or the backend directly on the internet.

For an external scheduler, the idempotent command is:

```powershell
.\.venv\Scripts\python.exe -m backend.transits
```

If the preview is hosted on another machine, that machine's Vite proxy must reach the backend. A hosted HTTPS preview cannot automatically reach the developer's laptop localhost. Configure a secured reachable backend URL and matching allowed origins for that environment; the current setup is the local workspace integration.

## Validation

```powershell
npm run backend:test
npx tsc --noEmit
npm run build
npx playwright test --config playwright.astro.config.ts
npx playwright test tests/cosmic.spec.ts
```

Tests include a published AA reference chart (Sun/Moon/Ascendant to one arcminute, house cusp checks to two arcminutes), retrograde flags, DST ambiguity/nonexistence, midnight and Date Line rollover, polar fallback, missing-time behavior, dasha continuity, matching bounds, shared scheduler concurrency, cache behavior, provider fallbacks and ownership enforcement. Browser tests create actual local profiles and exercise Western/Vedic charts, readings, Kundali, Dashas, compatibility and unknown-time handling. Card gesture tests verify the same element lifts, flips and returns.

The tests do not constitute universal astronomical or traditional-rule certification. Extensive regional matching fixtures and independently reviewed Vedic references are still needed before claiming parity with a particular astrologer's software.

Swiss Ephemeris is initialized during FastAPI startup with `set_ephe_path(...)` and `set_sid_mode(SIDM_LAHIRI)`. Because the Python binding keeps Swiss Ephemeris state per execution thread, each worker thread repeats that initialization once on its first calculation; it is not repeated for every planet. Vedic planet calls use `FLG_SWIEPH | FLG_SPEED | FLG_SIDEREAL`; Western calls omit only `FLG_SIDEREAL`. Keeping `FLG_SPEED` is necessary for retrograde state and applying/separating calculations. The adapter accepts the installed `pysweph` three-item return while retaining the position array and returned flags.

## Sources and licensing

- Swiss Ephemeris interface and conventions: https://www.astro.com/ftp/swisseph/doc/swephprg.htm
- Official ephemeris downloads: https://www.astro.com/ftp/swisseph/ephe/
- Windows binding and migration notes: https://pypi.org/project/pysweph/
- Reference birth chart: https://www.astro.com/adbvip/adbvip_08_04.htm
- Published house reference: https://www.astrotheme.fr/pdf/Barack_Obama_portrait.pdf
- Traditional matching tables and convention cross-check: https://github.com/naturalstupid/PyJHora/blob/main/src/jhora/horoscope/match/compatibility.py
- Dasha convention reference: https://github.com/naturalstupid/PyJHora/blob/main/src/jhora/horoscope/dhasa/graha/vimsottari.py
- MIT-licensed Graha architecture and nakshatra metadata reference (audited at commit `fd5b9dbbc852cffb907451d6d7c952b51152ca78`): https://github.com/supunsathsara/graha
- `vedic_lagna` cross-check reference for Swiss Ephemeris + Lahiri ascendant structure: https://pypi.org/project/vedic-lagna/
- Jyotish Flutter convention comparison (not imported): https://pub.dev/packages/jyotish
- Nominatim policy: https://operations.osmfoundation.org/policies/nominatim/
- Ollama local operation: https://docs.ollama.com/faq
- Gemini current models, deprecations and pricing/privacy: https://ai.google.dev/gemini-api/docs/models, https://ai.google.dev/gemini-api/docs/deprecations, https://ai.google.dev/gemini-api/docs/pricing
- Gemini REST structured output: https://ai.google.dev/api/generate-content
- Groq current models, deprecations and rate limits: https://console.groq.com/docs/models, https://console.groq.com/docs/deprecations, https://console.groq.com/docs/rate-limits
- OpenRouter free router and free-tier limits: https://openrouter.ai/docs/guides/routing/routers/free-router, https://openrouter.ai/docs/faq

Swiss Ephemeris uses dual AGPL/professional licensing. The wrapper and redistributed ephemeris data also need their applicable terms checked. This integration does not choose an open-source license for the entire existing app, acquire a commercial license, or declare the app cleared for closed-source distribution. Resolve that before public distribution or service activation. Traditional lookup values are implemented with source provenance; PyJHora, `vedic_lagna`, Jyotish Flutter and Graha are not installed or imported. The adapted Graha metadata attribution and MIT text are in `backend/THIRD_PARTY_NOTICES.md`.

Monthly cost estimates are kept in the conversation, not the app UI.
