"""Shared scheduled ephemerides. Forecast request handlers only read these rows."""
from datetime import datetime, timedelta, timezone, time
import json
from .ephemeris import positions, julian
from .storage import connection, claim_job, release_job
from .config import ENGINE_VERSION

def snapshot_key(instant, system):
    return f"{ENGINE_VERSION}:{system}:{instant.isoformat()}"

def refresh_snapshots(today=None):
    today = today or datetime.now(timezone.utc).date()
    job = f"ephemeris:{ENGINE_VERSION}:{today}"
    if not claim_job(job, 600):
        return 0
    completed = False
    count = 0
    try:
        moments = {datetime.combine(today + timedelta(days=d), time(12), timezone.utc) for d in range(-1, 368)}
        start = datetime.combine(today - timedelta(days=1), time(), timezone.utc)
        moments.update(start + timedelta(hours=h) for h in range(97))
        with connection() as db:
            existing = {r[0] for r in db.execute("SELECT key FROM snapshots")}
        # Calculate outside the write transaction; unique keys prevent duplicate writes.
        rows = []
        for instant in sorted(moments):
            jd = julian(instant)
            for system in ("western", "vedic"):
                key = snapshot_key(instant, system)
                if key not in existing:
                    rows.append((key, json.dumps({"at": instant.isoformat(), "jd": jd, "system": system,
                                                 "planets": positions(jd, system)})))
        with connection() as db:
            db.executemany("INSERT OR IGNORE INTO snapshots VALUES (?,?)", rows)
            # A successful daily job owns this date permanently; interrupted jobs expire.
            db.execute("UPDATE jobs SET lease_until=? WHERE name=?", (32503680000, job))
            db.execute("DELETE FROM cache WHERE expires < strftime('%s','now')")
        count = len(rows)
        completed = True
    finally:
        if not completed:
            release_job(job)
    return count

def read_snapshot(instant, system):
    with connection() as db:
        row = db.execute("SELECT data FROM snapshots WHERE key=?", (snapshot_key(instant, system),)).fetchone()
    if not row:
        raise LookupError("Transit data is not ready. The local scheduler will retry; please try again shortly.")
    return json.loads(row[0])

if __name__ == "__main__":
    from .storage import init_db
    init_db()
    print(f"Created {refresh_snapshots()} shared snapshots")
