import hashlib
import json
import sqlite3
import time
from contextlib import contextmanager
from . import config

@contextmanager
def connection():
    config.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(config.DB_PATH, timeout=30)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    with connection() as db:
        db.execute("PRAGMA journal_mode=WAL")
        db.executescript("""
          CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, created REAL NOT NULL);
          CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES sessions(id), data TEXT NOT NULL);
          CREATE INDEX IF NOT EXISTS profiles_owner ON profiles(owner);
          CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, data TEXT NOT NULL, expires REAL NOT NULL);
          CREATE TABLE IF NOT EXISTS snapshots (key TEXT PRIMARY KEY, data TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS places (id TEXT PRIMARY KEY, data TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS jobs (name TEXT PRIMARY KEY, lease_until REAL NOT NULL);
        """)

def digest(token):
    return hashlib.sha256(token.encode()).hexdigest()

def cache_get(key):
    with connection() as db:
        row = db.execute("SELECT data FROM cache WHERE key=? AND expires>?", (key, time.time())).fetchone()
    return json.loads(row[0]) if row else None

def cache_set(key, data, ttl=86400):
    with connection() as db:
        db.execute("INSERT OR REPLACE INTO cache VALUES (?,?,?)", (key, json.dumps(data), time.time() + ttl))

def claim_job(name, lease=300):
    with connection() as db:
        db.execute("BEGIN IMMEDIATE")
        row = db.execute("SELECT lease_until FROM jobs WHERE name=?", (name,)).fetchone()
        if row and row[0] > time.time():
            return False
        db.execute("INSERT OR REPLACE INTO jobs VALUES (?,?)", (name, time.time() + lease))
    return True

def release_job(name):
    with connection() as db:
        db.execute("DELETE FROM jobs WHERE name=?", (name,))
