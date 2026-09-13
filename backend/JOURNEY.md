# Guided discovery

The entry page presents Marriage, Career Report, Naam Sanket, Business Guidance, Love and Life Direction over an emerald galaxy, gold orbit lines and moving celestial artwork. Category selection unlocks audio and opens a short AI conversation automatically. The user chooses an intention and adds optional context before entering birth details. A saved profile skips that form. A rotating particle planet responds gently to the actual speech envelope. Questions appear in native modal popups after narration completes. Birth details use four short screens. The flow reveals a calculated chart and full numerology breakdown, previews three reading chapters with a category-specific midpoint question, and then offers a demo unlock screen.

The category keys are `marriage`, `relationships`, `career`, `numerology`, `business` and `growth`. Previously saved `wellbeing` journeys still load and use Life Direction guidance. The menu and home audio-guide card reopen discovery. The step IDs remain compatible with saved journeys; their new display order is 2 (intention), 3 (context), 1 (birth wizard), 7 (chart), 8 (numbers), 4 (overview), 5 (first two chapters), 9 (midpoint reflection), 5 (third chapter), 10 (unlock preview). Step 6 remains compatible with legacy chat journeys.

## Content and AI

`guide_service.py` supplies short opening and context turns without requiring a birth profile. It passes the category, chosen intention, language and guide gender through the existing AI provider pool. `journey_guidance.py` defines six conversation directions, reference-inspired hooks and complete English/Hindi fallback readings. Chapters cover needs, strengths, potential benefits, tradeoffs, a conversation starter and a small next step. AI receives the chosen topic, supplied context and calculated facts; planetary calculations stay in expandable references. The API validates chapter counts, text lengths and supporting fact IDs, with provider failover and labelled template readings.

Configured API keys stay in `backend/.env` and server environment variables. The existing provider routing handles authentication failures, rate limits and circuit breaking. The frontend never receives provider credentials. A reading uses the established server astronomy engine; AI writes the interpretation and does not calculate the chart.

## Persistence

SQLite stores session-owned progress, draft birth fields, selected category, language, context and chapter. Reading caches include the chart signature, category, language, user inputs, date, provider configuration and content revision. Chat is isolated by session, chart signature and category. Both successful AI replies and fallback messages are saved with their source. Existing chat tables receive a backward-compatible `source` column at startup.

Limits remain 15 uncached readings and 25 chat requests per session per India calendar day. Tests use isolated sessions and fictional profiles. The place picker must be selected again if an unfinished birth form is reloaded.

## Voice and accessibility

`POST /api/journey/utterance` supplies natural speech through Edge TTS with word boundaries. Voices are Neerja/Prabhat for Indian English and Swara/Madhur for Hindi. Gemini TTS is a secondary route; device speech and readable text remain available if online speech fails. Online narration sends the displayed spoken text to the speech provider. No microphone access is used. `ASTRO_GUIDE_NEURAL_VOICE=0` disables online speech; `GEMINI_TTS_MODEL` configures the optional Gemini model. Existing Groq Orpheus speech is independent and may require provider terms acceptance; this implementation does not accept terms on anyone's behalf.

The funnel no longer renders or loads the image presenters. `ParticlePlanet.tsx` draws a rotating sphere of emerald/gold particles, an orbiting dust ring and drifting stars using canvas. Rotation is independent of speech; a smoothed real audio envelope supplies only a subtle pulse. Reduced-motion preferences disable rotation, and hidden tabs suspend rendering.

`useAmbientMusic.ts` creates an original soft synthesized ambient pad. Audio starts only after a user gesture, lowers during narration, fades when the tab is hidden, and stops on exit. Voice and music have independent controls. Click/tap the planet to open options, pause/resume, change language or voice, replay, or return to a pending question. No fixed-duration timer opens a question: natural/device speech completion or an explicit unavailable-speech fallback advances the conversation.

The birth wizard collects name/gender, date, time accuracy, and birthplace separately. The chart uses actual saved profile positions and respects uncertain time. Numerology uses the server's existing letter mapping and reductions; the spoken name and numbers are sourced from that same response. The complete letter/number breakdown appears on screen. The optional midpoint answer is saved as `reflection`, included in the AI prompt and cache key, and used when refreshing the final preview chapter.

## OTP and payment preview

`UnlockPreview.tsx` is presentation only. It shows full-reading benefits, a phone field, the explicitly displayed demo OTP `123456`, and a payment-service placeholder. No SMS, identity verification, charge, paid entitlement or real checkout occurs. Phone/code values stay in component memory and are not sent to the backend. The free app-entry option is always visible. Saved details are retained; the UI does not falsely claim that a reading will be deleted or that astrology guarantees accurate outcomes.

Production billing, authentication and restricted/free entitlements are intentionally **not implemented**: the user requested only the preview UI for now. The browser receives the complete existing reading response, so the three-chapter preview is not a security boundary. Future paid access must be authorized server-side after verified payment; never use the demo OTP or client state as authorization.

Changing language after a reading returns to the context step so a new reading can be generated in that language. It does not relabel an English reading as Hindi.

## Running and validation

`npm run dev` starts and monitors the backend automatically; `npm run backend` reuses a healthy service or starts it independently. See `README.md` for environment setup. The health endpoint is `/api/health`, accessible directly on port 8000 and through Vite on port 8443.

Run `npm run build`, `npx tsc --noEmit`, `npm run backend:test` and `npx playwright test tests/journey.spec.ts`. Browser tests cover six category triggers, audio controls, gender switching, unavailable speech, responsive layouts, reduced motion and the complete save/resume/birth/chart/numerology/reflection/demo-unlock flow. Speech fixtures make UI tests deterministic; live service checks verify actual voice output separately. Backend tests disable real provider keys and cover both languages, four natural voice selections, cache/ownership boundaries, provider outages and isolated chat history.
