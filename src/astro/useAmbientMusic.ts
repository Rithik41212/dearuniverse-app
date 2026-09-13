import { useEffect, useRef, useState } from "react";

// Original, quiet synthesized ambient pad. No external music or download.
export default function useAmbientMusic(speaking:boolean, active:boolean) {
  const context=useRef<AudioContext|null>(null),gain=useRef<GainNode|null>(null);
  const [enabled,setEnabled]=useState(true);
  const start=()=>{
    try {
      if(!context.current){
        const ctx=new AudioContext();context.current=ctx;
        const master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);gain.current=master;
        [130.81,196,261.63,293.66,392].forEach((hz,i)=>{
          const tone=ctx.createOscillator(),amp=ctx.createGain();tone.type="sine";tone.frequency.value=hz;tone.detune.value=i%2?3:-3;
          amp.gain.value=.12;tone.connect(amp);amp.connect(master);
          const lfo=ctx.createOscillator(),depth=ctx.createGain();lfo.frequency.value=.035+i*.009;depth.gain.value=.055;lfo.connect(depth);depth.connect(amp.gain);lfo.start();tone.start();
        });
      }
      void context.current.resume();
      gain.current?.gain.setTargetAtTime(enabled?.035:0,context.current.currentTime,.8);
    }catch { /* Narration remains independent if ambient audio is unsupported. */ }
  };
  useEffect(()=>{
    const update=()=>{if(context.current&&gain.current)gain.current.gain.setTargetAtTime(enabled&&active&&!document.hidden?(speaking?.012:.035):0,context.current.currentTime,.45);};
    update();document.addEventListener("visibilitychange",update);return()=>document.removeEventListener("visibilitychange",update);
  },[enabled,speaking,active]);
  useEffect(()=>()=>{void context.current?.close();context.current=null;gain.current=null;},[]);
  return {start,enabled,toggle:()=>{start();setEnabled(v=>!v);}};
}
