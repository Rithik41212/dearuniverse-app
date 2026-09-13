import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import { mouthShape, restingMotion, type TimedWord } from "./guideMotion";

const femaleNames = /female|swara|heera|aditi|zira|samantha|aria|neerja|priya|hazel|susan/i;
const maleNames = /\bmale\b|madhur|prabhat|david|mark|ravi|rishi|daniel|george|james/i;
type Speech = { audio: string; mime: string; words: TimedWord[]; source: string; voice: string; timing: string };

let sharedAudioContext: AudioContext | null = null;

function unlockGuideAudio() {
  try {
    const Constructor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Constructor && (!sharedAudioContext || sharedAudioContext.state === "closed")) sharedAudioContext = new Constructor();
    if (sharedAudioContext?.state === "suspended") void sharedAudioContext.resume();
  } catch { /* Readable transcript and device speech remain available. */ }
  return sharedAudioContext;
}

if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", unlockGuideAudio, true);
  document.addEventListener("keydown", unlockGuideAudio, true);
}

export default function useGuideVoice(language: "en" | "hi", gender: "female" | "male" = "female") {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected] = useState("");
  const [rate, setRate] = useState(.96);
  const [mode, setMode] = useState<"natural" | "device">("natural");
  const [status, setStatus] = useState("");
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [source, setSource] = useState("");
  const motion = useRef(restingMotion());
  const sequence = useRef(0);
  const audioContext = useRef<AudioContext | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const audioAnalyser = useRef<AnalyserNode | null>(null);
  const request = useRef<AbortController | null>(null);
  const animation = useRef(0);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const alive = useRef(true);
  const matching = voices.filter(v => v.lang.toLowerCase().startsWith(language));
  const preferred = matching.find(v => (gender === "female" ? femaleNames : maleNames).test(v.name));
  const activeVoice = matching.find(v => v.voiceURI === selected) ?? preferred ?? matching[0];

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const update = () => setVoices(synth.getVoices());
    update(); synth.addEventListener("voiceschanged", update);
    return () => synth.removeEventListener("voiceschanged", update);
  }, []);
  function unlock() {
    audioContext.current = unlockGuideAudio();
  }
  function stop() {
    sequence.current++;
    request.current?.abort(); request.current = null;
    if (audioSource.current) { audioSource.current.onended = null; try { audioSource.current.stop(); audioSource.current.disconnect(); } catch {} audioSource.current = null; }
    audioAnalyser.current?.disconnect(); audioAnalyser.current = null;
    window.speechSynthesis?.cancel(); utterance.current = null;
    cancelAnimationFrame(animation.current); motion.current = restingMotion();
    if (alive.current) { setPlaying(false); setPaused(false); setLoading(false); setCaption(""); setProgress(0); setStatus(""); }
  }
  function pause() {
    if (!playing) return;
    if (audioSource.current && audioContext.current) {
      if (paused) void audioContext.current.resume(); else void audioContext.current.suspend();
    } else {
      if (paused) window.speechSynthesis?.resume(); else window.speechSynthesis?.pause();
    }
    motion.current.speaking = paused;
    if (!paused) motion.current.open = 0;
    setPaused(!paused);
  }
  async function deviceSpeech(text: string, ticket: number, onComplete?: () => void) {
    const synth = window.speechSynthesis;
    setLoading(false); setSource("device"); setCaption(text);
    if (!synth) { setStatus("Voice unavailable on this browser. Read along below."); onComplete?.(); return; }
    if (!synth.getVoices().length) await new Promise<void>(resolve => {
      const ready = () => { clearTimeout(timer); synth.removeEventListener("voiceschanged", ready); resolve(); };
      const timer = setTimeout(ready, 1200); synth.addEventListener("voiceschanged", ready);
    });
    if (ticket !== sequence.current || !alive.current) return;
    const available = synth.getVoices().filter(v => v.lang.toLowerCase().startsWith(language));
    const chosen = available.find(v => v.voiceURI === selected) ?? available.find(v => (gender === "female" ? femaleNames : maleNames).test(v.name)) ?? available[0];
    if (!chosen) { setStatus(hiText("इस डिवाइस पर सही आवाज़ उपलब्ध नहीं है। नीचे पढ़ सकते हैं।", "No matching device voice. The complete text is available below.")); onComplete?.(); return; }
    const parts = text.match(/[^.!?।]+[.!?।]+|[^.!?।]+$/g)?.map(s => s.trim()).filter(Boolean) ?? [text];
    setStatus(mode === "device" ? "Device narration" : "Device narration · natural audio unavailable");
    function next(index: number) {
      if (ticket !== sequence.current || !alive.current) return;
      if (index >= parts.length) { setPlaying(false); setProgress(1); motion.current = restingMotion(); setCaption(text); onComplete?.(); return; }
      const line = new SpeechSynthesisUtterance(parts[index]); utterance.current = line;
      line.voice = chosen; line.lang = chosen.lang; line.rate = rate;
      line.onstart = () => {
        if (ticket !== sequence.current) return;
        setPlaying(true); setCaption(parts[index]); setProgress(index / parts.length); motion.current.speaking = true;
        const start = performance.now();
        const tick = () => {
          if (ticket !== sequence.current) return;
          if (!synth.paused) {
            const position = ((performance.now() - start) % 430) / 430;
            Object.assign(motion.current, mouthShape(motion.current.word || parts[index], position, .6), { energy: .45 });
          }
          animation.current = requestAnimationFrame(tick);
        };
        cancelAnimationFrame(animation.current); tick();
      };
      line.onboundary = event => { if (ticket === sequence.current) motion.current.word = parts[index].slice(event.charIndex).split(/\s/)[0]; };
      line.onend = () => { if (ticket !== sequence.current) return; cancelAnimationFrame(animation.current); next(index + 1); };
      line.onerror = () => { if (ticket === sequence.current) { cancelAnimationFrame(animation.current); setPlaying(false); motion.current = restingMotion(); setStatus("Playback interrupted. You can replay or read along."); onComplete?.(); } };
      try { synth.speak(line); } catch { setPlaying(false); setStatus("Playback unavailable. Read along below."); onComplete?.(); }
    }
    next(0);
  }
  function hiText(hi: string, en: string) { return language === "hi" ? hi : en; }
  async function speak(text: string, onComplete?: () => void) {
    stop(); unlock();
    const ticket = sequence.current;
    if (!text.trim()) { onComplete?.(); return; }
    setCaption(text); setLoading(true);
    if (mode === "device") { await deviceSpeech(text, ticket, onComplete); return; }
    setStatus(hiText("आपकी मार्गदर्शिका बोलने की तैयारी कर रही है…", "Your guide is getting ready to speak…"));
    const controller = new AbortController(); request.current = controller;
    try {
      const speech = await api<Speech>("/journey/utterance", { method: "POST", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(35000)]),
        body: JSON.stringify({ text: text.slice(0,1800), language, gender, rate }) });
      if (ticket !== sequence.current || !alive.current) return;
      unlock();
      const context = audioContext.current;
      if (!context) throw new Error("Audio unavailable");
      const bytes = Uint8Array.from(atob(speech.audio), character => character.charCodeAt(0));
      const buffer = await context.decodeAudioData(bytes.buffer);
      if (ticket !== sequence.current || !alive.current) return;
      await context.resume();
      const node = context.createBufferSource(); node.buffer = buffer;
      const analyser = context.createAnalyser(); analyser.fftSize = 256;
      audioAnalyser.current = analyser;
      node.connect(analyser); analyser.connect(context.destination);
      audioSource.current = node;
      setLoading(false); setPlaying(true); setPaused(false); setSource(speech.source); setStatus(hiText("आपके साथ, एक बात एक बार।", "Here with you. One thought at a time."));
      const start = context.currentTime;
      const samples = new Uint8Array(analyser.fftSize);
      const words = speech.words;
      let previousIndex = -1;
      let lastPaint = 0;
      const tick = () => {
        if (ticket !== sequence.current) return;
        const elapsed = context.currentTime - start;
        const speaking = context.state === "running";
        analyser.getByteTimeDomainData(samples);
        const rms = Math.sqrt(samples.reduce((sum,v) => sum + ((v - 128) / 128) ** 2, 0) / samples.length);
        const energy = Math.min(1, rms * 7);
        const index = words.findIndex(w => elapsed >= w.start && elapsed <= w.end);
        const word = index >= 0 ? words[index] : null;
        const phonetic = word ? mouthShape(word.text, (elapsed-word.start)/Math.max(.02,word.end-word.start), energy) : { open:words.length ? 0 : energy*.7, round:0 };
        Object.assign(motion.current, phonetic, { speaking, energy, word:word?.text ?? "" });
        if (!speaking) motion.current.open = 0;
        if (index >= 0 && index !== previousIndex) {
          previousIndex = index;
          const from = Math.floor(index/12)*12;
          setCaption(words.slice(from,from+12).map(w=>w.text).join(" "));
        }
        if (performance.now()-lastPaint > 200) { setProgress(Math.min(1,elapsed/buffer.duration)); lastPaint=performance.now(); }
        animation.current = requestAnimationFrame(tick);
      };
      node.onended = () => {
        if (ticket !== sequence.current || !alive.current) return;
        cancelAnimationFrame(animation.current); node.disconnect(); analyser.disconnect(); audioSource.current=null; audioAnalyser.current=null;
        motion.current=restingMotion(); setPlaying(false); setPaused(false); setProgress(1); setCaption(text); setStatus(hiText("अब आपकी बारी।", "Your turn. Take your time."));
        onComplete?.();
      };
      node.start(); tick();
    } catch {
      if (ticket !== sequence.current || !alive.current || controller.signal.aborted) return;
      await deviceSpeech(text, ticket, onComplete);
    }
  }
  useEffect(() => { alive.current=true; return () => { alive.current=false; stop(); audioContext.current=null; }; }, []);
  return { speak, stop, unlock, pause, playing, paused, loading, status, caption, progress, source, motion,
    voices:matching, selected:activeVoice?.voiceURI ?? "", setSelected, rate, setRate, mode, setMode, hasFemale:!!preferred };
}
