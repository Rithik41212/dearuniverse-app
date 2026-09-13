import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import * as ort from "onnxruntime-web/wasm";
import ortModuleUrl from "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs?url";

// Model/preprocessing adapted from Sam Barber's MIT-licensed Palm Line Reader.
// License: public/models/PALM-LINES-LICENSE.txt. This detects creases, not fortunes.
const SIZE = 512;
const COLORS = [[0, 0, 0], [239, 139, 155], [137, 177, 239], [232, 190, 111]];
const base = import.meta.env.BASE_URL;
export type PalmResult = { photo: string; overlay: string; detected: boolean[] };

function canvas(width: number, height = width) {
  const element = document.createElement("canvas");
  element.width = width; element.height = height;
  const context = element.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Your browser could not open the image reader.");
  return { element, context };
}

export async function createPalmReader() {
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.wasmPaths = {
    mjs: new URL(ortModuleUrl, window.location.href).href,
    wasm: new URL(`${base}models/ort/ort-wasm-simd-threaded.wasm`, window.location.href).href,
  };
  const vision = await FilesetResolver.forVisionTasks(`${base}models/mediapipe`);
  const hand = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: `${base}models/hand_landmarker.task` },
    runningMode: "IMAGE", numHands: 2, minHandDetectionConfidence: .5, minHandPresenceConfidence: .5,
  });
  let session: ort.InferenceSession;
  try {
    session = await ort.InferenceSession.create(`${base}models/palm-lines.onnx`, { executionProviders: ["wasm"] });
  } catch (error) { hand.close(); throw error; }
  return {
    dispose: () => { hand.close(); void session.release(); },
    async analyze(source: HTMLCanvasElement): Promise<PalmResult> {
      const result = hand.detect(source);
      if (result.landmarks.length !== 1) throw new Error(result.landmarks.length ? "Show just one open palm, then try again." : "No hand found. Show your whole open palm in brighter light and try again.");
      const points = result.landmarks[0].map((p) => ({ x: p.x * source.width, y: p.y * source.height }));
      const dist = (a: number, b: number) => Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y);
      if ([8, 12, 16, 20].filter((tip) => dist(tip, 0) > dist(tip - 2, 0) * 1.12).length < 3)
        throw new Error("Open your hand and spread your fingers slightly. Face your palm toward the camera.");
      if (result.landmarks[0].some((p) => p.x < .015 || p.x > .985 || p.y < .015 || p.y > .985))
        throw new Error("Move your hand back a little so your wrist and fingertips fit inside the photo.");

      // Rotate wrist-to-middle-finger upright, then crop the palm rather than the whole scene.
      const angle = -Math.PI / 2 - Math.atan2(points[9].y - points[0].y, points[9].x - points[0].x);
      const side = Math.ceil(Math.hypot(source.width, source.height));
      const rotated = canvas(side);
      rotated.context.translate(side / 2, side / 2);
      rotated.context.rotate(angle);
      rotated.context.drawImage(source, -points[0].x, -points[0].y);
      const palm = [0, 1, 2, 5, 9, 13, 17].map((i) => {
        const x = points[i].x - points[0].x, y = points[i].y - points[0].y;
        return { x: side / 2 + x * Math.cos(angle) - y * Math.sin(angle), y: side / 2 + x * Math.sin(angle) + y * Math.cos(angle) };
      });
      const minX = Math.min(...palm.map((p) => p.x)), maxX = Math.max(...palm.map((p) => p.x));
      const minY = Math.min(...palm.map((p) => p.y)), maxY = Math.max(...palm.map((p) => p.y));
      const cropSize = Math.max(maxX - minX, maxY - minY) * 1.22;
      if (cropSize < 100) throw new Error("Bring your palm closer so the lines are easier to see.");
      const crop = canvas(SIZE);
      if (result.handedness[0][0].categoryName === "Right") {
        crop.context.translate(SIZE, 0); crop.context.scale(-1, 1);
      }
      crop.context.drawImage(rotated.element, (minX + maxX - cropSize) / 2, (minY + maxY - cropSize) / 2, cropSize, cropSize, 0, 0, SIZE, SIZE);
      const pixels = crop.context.getImageData(0, 0, SIZE, SIZE).data;
      const plane = SIZE * SIZE;
      const input = new Float32Array(plane * 3);
      const mean = [.485, .456, .406], std = [.229, .224, .225];
      for (let i = 0; i < plane; i++) for (let c = 0; c < 3; c++) input[c * plane + i] = (pixels[i * 4 + c] / 255 - mean[c]) / std[c];
      const tensor = new ort.Tensor("float32", input, [1, 3, SIZE, SIZE]);
      let outputs: ort.InferenceSession.ReturnType | undefined;
      try {
        outputs = await session.run({ [session.inputNames[0]]: tensor });
        const logits = outputs[session.outputNames[0]].data;
        const mask = new ImageData(SIZE, SIZE), counts = [0, 0, 0, 0];
        for (let i = 0; i < plane; i++) {
          let best = 0;
          for (let c = 1; c < 4; c++) if (Number(logits[c * plane + i]) > Number(logits[best * plane + i])) best = c;
          counts[best]++;
          if (best) { mask.data.set(COLORS[best], i * 4); mask.data[i * 4 + 3] = 215; }
        }
        const detected = counts.slice(1).map((count) => count >= 40);
        if (!detected.some(Boolean)) throw new Error("The palm lines are not clear enough. Try softer daylight and hold still.");
        const overlay = canvas(SIZE);
        overlay.context.putImageData(mask, 0, 0);
        return { photo: crop.element.toDataURL("image/jpeg", .9), overlay: overlay.element.toDataURL(), detected };
      } finally {
        tensor.dispose();
        if (outputs) Object.values(outputs).forEach((output) => output.dispose());
      }
    },
  };
}
