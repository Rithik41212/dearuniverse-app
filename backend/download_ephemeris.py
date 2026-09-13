"""Optional official NASA JPL ephemeris download. Run explicitly; never downloads during app startup."""
import hashlib
import json
from pathlib import Path
from skyfield.api import Loader
from .config import ROOT

def main():
    folder = ROOT / "data"
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / "de440s.bsp"
    if not target.exists():
        print("Downloading NASA JPL DE440 ephemeris (de440s.bsp)...")
        load = Loader(str(folder))
        load("de440s.bsp")
    content = target.read_bytes()
    manifest = {
        "de440s.bsp": {
            "source": "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440s.bsp",
            "sha256": hashlib.sha256(content).hexdigest(),
            "bytes": len(content),
            "description": "NASA JPL DE440 high-precision planetary ephemeris (1849-2150)",
        }
    }
    (folder / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"Installed NASA JPL DE440 ephemeris ({len(content)} bytes). Restart the backend to use the new data signature.")

if __name__ == "__main__":
    main()
