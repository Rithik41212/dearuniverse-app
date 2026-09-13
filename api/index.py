"""Vercel serverless function entry point for the FastAPI backend."""
import sys
import os

# Ensure the project root is on the Python path so `backend.*` imports resolve.
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

# On Vercel the filesystem is read-only except /tmp.
# Redirect the SQLite database there so init_db() succeeds.
os.environ.setdefault("ASTRO_DB_PATH", "/tmp/astro.sqlite3")

from backend.app import app  # noqa: E402
