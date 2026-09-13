# Generated universe and guide art

Generated with the built-in image generation tool on 13 September 2026.
The reference screenshot guided the layout; `src/engagementvideo.mp4` was
inspected for presenter style. The two people are original fictional adults.

## Asset prompts and destinations

- `emerald-universe.png`: Photoreal cinematic landscape cosmos, 1536 × 1024.
  Deep emerald green nebulae, gold stars, dark quiet center for typography,
  a glowing golden horizontal galaxy pool in the lower quarter, premium
  Indian astrology aesthetic. No text, cards, UI, people, blue or purple.
- `guide-female.png`: Original Indian woman around 30, long black hair,
  front-facing symmetrical composition, warm expression, emerald jacket
  with restrained gold embroidery, jewelry and bindi. Lips slightly parted
  with a glimpse of teeth, open eyes looking at the viewer. Vertical
  1024 × 1536, dark emerald background, realistic skin and warm lighting.
  No hands, text or logos. Requested calibration: hair 8%, eyes 35%, mouth
  48%, shoulders 65%; actual image landmarks were calibrated in the mesh.
- `guide-male.png`: Original Indian male guide around 33, frontal and
  symmetrical, short dark hair, neat short beard leaving lips visible,
  calm welcoming expression, lips slightly parted, dark emerald kurta
  with fine gold embroidery and small pendant. Vertical 1024 × 1536,
  emerald studio background, warm gold light, realistic skin and eyes.
  No hands, text or logos. Same requested landmark calibration as above.

## Original output files

Generated originals are retained in
`C:/Users/Sahil Sahu/.codex/generated_images/01a09607-21c2-7460-b354-5fa97154a9ee/`:

- Universe: `exec-878e4b15-c193-4f29-a4a4-f7050531437b.png`
- Aarya: `exec-8c9e5aa0-13b1-4c85-a73c-5c06a1a00583.png`
- Aarav: `exec-e53433eb-7a63-4e52-bfa5-c0d23e3b69f0.png`

The active landing and funnel use the universe copy in this directory.
The portrait assets are retained as earlier design work but are no longer
loaded by the funnel. The current speaking visual is the code-rendered
particle planet in `src/astro/ParticlePlanet.tsx`. Flow and speech-provider
configuration are documented in `backend/JOURNEY.md`.
