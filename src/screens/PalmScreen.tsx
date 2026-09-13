import { useEffect, useRef, useState } from "react";
import PalmArt, { PalmIcon } from "../components/PalmArt";
import type { createPalmReader, PalmResult } from "../lib/palmReader";

const LINES = [
  { name: "Heart line", color: "#ef8b9b", theme: "Connection", text: "In traditional palmistry, this crease represents affection and connection. Reflect on how you express care to the people close to you." },
  { name: "Head line", color: "#89b1ef", theme: "Perspective", text: "Traditionally associated with thinking and imagination. Where could a fresh perspective help you make a thoughtful choice today?" },
  { name: "Life line", color: "#e8be6f", theme: "Vitality", text: "A traditional symbol of grounding and life experiences. Consider what helps you feel replenished. Its length does not predict lifespan or health." },
];
type Reader = Awaited<ReturnType<typeof createPalmReader>>;

export default function PalmScreen() {
  const [mode, setMode] = useState<"intro" | "camera" | "result">("intro");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<PalmResult | null>(null);
  const [showLines, setShowLines] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const reader = useRef<Reader | null>(null);
  const mounted = useRef(true);
  const processing = useRef(false);
  const cameraRequest = useRef(0);
  const stopCamera = () => {
    cameraRequest.current++;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  };
  useEffect(() => {
    mounted.current = true;
    const hide = () => {
      if (document.hidden) { stopCamera(); setReady(false); if (!processing.current) setBusy(""); setMode((current) => current === "camera" ? "intro" : current); }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      mounted.current = false; stopCamera();
      document.removeEventListener("visibilitychange", hide);
      if (!processing.current) { reader.current?.dispose(); reader.current = null; }
    };
  }, []);

  async function startCamera() {
    setError(""); setReady(false); setBusy("Opening camera…"); setMode("camera");
    const request = ++cameraRequest.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access needs HTTPS or localhost. You can also choose a palm photo below.");
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      if (!mounted.current || request !== cameraRequest.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      if (video.current) { video.current.srcObject = media; await video.current.play(); }
      if (mounted.current && request === cameraRequest.current) setReady(true);
    } catch (err) {
      if (!mounted.current || request !== cameraRequest.current) return;
      stopCamera(); setMode("intro"); setBusy("");
      setError(err instanceof DOMException ? (err.name === "NotAllowedError" ? "Camera permission was blocked. Allow camera access in your browser, or choose a palm photo." : "The camera is unavailable. Close other camera apps or choose a palm photo.") : (err as Error).message);
    } finally { if (mounted.current && request === cameraRequest.current) setBusy(""); }
  }

  async function analyze(source: HTMLCanvasElement) {
    if (processing.current) return;
    processing.current = true; setError(""); setBusy("Preparing your private scan…");
    stopCamera(); setReady(false);
    try {
      if (!reader.current) {
        try { reader.current = await (await import("../lib/palmReader")).createPalmReader(); }
        catch { throw new Error("The scanner could not load. Check your connection and try again in a recent browser."); }
      }
      if (!mounted.current) return;
      setBusy("Tracing your palm lines…");
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const reading = await reader.current.analyze(source);
      if (mounted.current) { setResult(reading); setShowLines(true); setMode("result"); }
    } catch (err) {
      if (mounted.current) { setError((err as Error).message || "The scan could not finish. Please try another photo."); setMode("intro"); }
    } finally {
      processing.current = false;
      if (mounted.current) setBusy("");
      else { reader.current?.dispose(); reader.current = null; }
    }
  }

  function capture() {
    if (!video.current?.videoWidth || !ready || processing.current) return;
    const source = document.createElement("canvas");
    const scale = Math.min(1, 1280 / Math.max(video.current.videoWidth, video.current.videoHeight));
    source.width = Math.round(video.current.videoWidth * scale); source.height = Math.round(video.current.videoHeight * scale);
    source.getContext("2d")!.drawImage(video.current, 0, 0, source.width, source.height);
    void analyze(source);
  }

  async function upload(photo: File) {
    setError("");
    if (!photo.type.startsWith("image/")) { setError("Choose an image file of your palm."); return; }
    if (photo.size > 20 * 1024 * 1024) { setError("Choose an image smaller than 20 MB."); return; }
    setBusy("Opening your photo…");
    const url = URL.createObjectURL(photo);
    try {
      const img = new Image(); img.src = url; await img.decode();
      if (!mounted.current) return;
      const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
      const source = document.createElement("canvas");
      source.width = Math.round(img.naturalWidth * scale); source.height = Math.round(img.naturalHeight * scale);
      source.getContext("2d")!.drawImage(img, 0, 0, source.width, source.height);
      await analyze(source);
    } catch { if (mounted.current) { setError("This image could not be opened. Try a JPG, PNG or WebP photo."); setBusy(""); } }
    finally { URL.revokeObjectURL(url); }
  }

  return <div className="space-y-4 pb-2">
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[.3em] text-ember-soft">The wisdom in your hands</p>
      <h1 className="mt-1 font-display text-[29px] text-cream">Your palm, your story</h1>
    </div>
    {mode === "intro" && <section className="overflow-hidden rounded-[28px] border border-gold/15 bg-[#17130f]/90 px-5 pb-5 text-center shadow-xl">
      <PalmArt className="palm-art mx-auto" />
      <h2 className="font-serif text-xl text-cream">A little closer to yourself</h2>
      <p className="mx-auto mt-2 max-w-[260px] text-xs leading-relaxed text-ash">Explore the lines of your palm through the lens of an ancient tradition.</p>
      <button disabled={!!busy} onClick={startCamera} className="palm-button mt-5 flex items-center justify-center gap-2"><PalmIcon className="h-5 w-5" /> Scan my palm <span aria-hidden="true">↗</span></button>
      <button disabled={!!busy} onClick={() => file.current?.click()} className="mt-3 min-h-8 text-xs text-cream/80 underline decoration-ember/40 underline-offset-4">Choose a palm photo</button>
      <p className="mt-2 text-[10px] text-ash">Private by design · Photos stay on your device</p>
    </section>}
    {mode === "camera" && <section className="rounded-[28px] border border-gold/15 bg-[#17130f]/95 p-4">
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <video ref={video} muted playsInline autoPlay className="aspect-[4/5] max-h-[40svh] w-full object-contain" />
        {!busy && <div className="pointer-events-none absolute inset-5 rounded-[40%] border border-dashed border-gold/65" />}
      </div>
      <p className="my-3 text-center text-xs leading-relaxed text-ash">Face your palm toward the camera. Include your wrist and fingertips; use even daylight.</p>
      <button onClick={capture} disabled={!ready || !!busy} className="palm-button">Capture & read palm</button>
      <button disabled={processing.current} onClick={() => { stopCamera(); setBusy(""); setMode("intro"); }} className="mt-3 w-full py-2 text-xs text-ash">Cancel</button>
    </section>}
    {busy && <p role="status" className="rounded-2xl border border-gold/20 bg-[#17130f] p-4 text-center text-sm text-gold">{busy}<span className="mt-1 block text-xs text-ash">The first scan loads the scanner and may take a moment.</span></p>}
    {error && <p role="alert" className="rounded-2xl border border-ember/30 bg-[#241910] p-4 text-sm leading-relaxed text-cream">{error}</p>}
    {mode === "result" && result && <section className="space-y-4 rounded-[28px] border border-gold/15 bg-[#17130f]/95 p-4">
      <div className="flex items-center justify-between"><h2 className="font-serif text-xl">Your palm map</h2><span className="text-[10px] text-gold">{result.detected.filter(Boolean).length} of 3 lines traced</span></div>
      <div className="relative mx-auto max-w-[290px] overflow-hidden rounded-2xl">
        <img src={result.photo} alt="Your captured palm, cropped for analysis" className="w-full" />
        {showLines && <img src={result.overlay} alt="Detected palm creases" className="absolute inset-0 w-full" />}
      </div>
      <button aria-pressed={showLines} onClick={() => setShowLines(!showLines)} className="w-full text-xs text-ember-soft">{showLines ? "Hide" : "Show"} detected lines</button>
      <p className="text-xs leading-relaxed text-ash">Experimental line tracing can miss or mislabel creases. The reflections below describe traditional meanings, not predictions about you.</p>
      {LINES.map((line, i) => <div key={line.name} className="border-t border-white/10 pt-3"><div className="flex justify-between gap-2"><h3 className="font-serif" style={{ color: line.color }}>{line.name}</h3><span className="text-[10px] text-ash">{result.detected[i] ? line.theme : "Not clearly detected"}</span></div><p className="mt-1 text-xs leading-relaxed text-cream/80">{result.detected[i] ? line.text : "Try another photo with softer light and your palm facing the camera."}</p></div>)}
      <button className="palm-button" onClick={() => { setResult(null); setMode("intro"); setError(""); }}>Scan again</button>
    </section>}
    {mode === "intro" && <div className="grid grid-cols-3 gap-2 text-center">{LINES.map((line, i) => <div key={line.name} className="rounded-2xl border border-white/8 bg-[#17130f]/80 py-3"><span style={{ color: line.color }} className="text-lg" aria-hidden="true">{["♡", "✧", "☀"][i]}</span><p className="mt-1 text-[11px] text-cream">{line.name}</p><p className="mt-0.5 text-[9px] text-ash">{line.theme}</p></div>)}</div>}
    <p className="px-3 text-center text-[10px] leading-relaxed text-ash">For reflection and entertainment. Palmistry is not a scientifically validated way to predict your future.</p>
    <input ref={file} type="file" accept="image/*" className="hidden" aria-label="Choose a palm photo" onChange={(event) => { const photo = event.target.files?.[0]; event.target.value = ""; if (photo) void upload(photo); }} />
  </div>;
}
