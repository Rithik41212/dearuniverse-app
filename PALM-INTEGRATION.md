# Palm camera integration

The final navigation item opens `src/screens/PalmScreen.tsx`. Camera capture and image upload use the same local pipeline in `src/lib/palmReader.ts`: detect one open hand, rotate and crop its palm, run crease segmentation, and display the predicted heart/head/life masks. No photos are uploaded or persisted. Images and results are discarded on leaving the tab; streams stop on cancel, capture, navigation, and document hiding.

## Research and selection

- [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js), Apache-2.0: provides 21 hand landmarks and handedness. Used for framing and cropping, not palm creases or fortune predictions.
- [Sam Barber's Palm Line Reader](https://github.com/samuelwbarber/palm-line-reader), MIT: a browser-compatible ONNX crease-segmentation model. Selected for local inference without a paid API or server. The repository reports 0.81 foreground Dice on its held-out set; this is an upstream claim, not independent validation or fortune-telling accuracy. Its training pipeline uses pseudo-labelled palm photos; evaluate generalization on consented, representative images before treating it as production-validated.
- [Fortune On Your Hand](https://github.com/yeonsumia/palmistry): research on extracting principal palm lines. Not selected because it does not provide the same drop-in browser deployment.

No scientifically validated future-prediction API was established by this research. The app explicitly separates experimental crease detection from fixed traditional reflection prompts; it does not infer health, lifespan, character, or future events. The minimum 40 foreground pixels is a visibility heuristic, not a confidence score. Hand detection cannot reliably distinguish the palm from the back of a hand, so capture instructions remain necessary.

## Assets and deployment

All inference assets are hosted under `public/models` and load only when a scan begins. MediaPipe 0.10.22-rc.20250304 and ONNX Runtime Web 1.22.0 are pinned in package.json. WASM runs with one thread so cross-origin isolation is not required. The first scan downloads roughly 40 MB of models and runtime assets; later scans reuse the reader and normal browser caching. Serve this folder unchanged, with WASM as `application/wasm` and `.mjs` as JavaScript. HTTPS or localhost is required for camera access; an embedded preview must also allow camera permissions. Photo upload is available as a fallback.

Runtime assets were copied from the pinned npm distributions. If updating those dependencies, refresh `public/models/ort` from `onnxruntime-web/dist/ort-wasm-simd-threaded.{mjs,wasm}` (the JS module is also imported as a Vite URL asset to support development and production) and `public/models/mediapipe` from `@mediapipe/tasks-vision/wasm`. Licenses are preserved beside the models. The model and test fixture originate from the MIT-licensed Palm Line Reader repository; see `public/models/PALM-LINES-LICENSE.txt`.

## Validation

Run `npm run build`, `node node_modules/typescript/bin/tsc --noEmit`, and `npx playwright test`. The test runner reuses Vite on port 8443 or starts it when unavailable. The browser suite uses installed Microsoft Edge, checks compact mobile navigation, wheel behavior, camera-denial fallback, and runs the actual models on the upstream sample. Physical camera quality and performance across mobile devices still require device testing.
