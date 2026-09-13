import { useEffect, useRef, useState } from "react";
import { ASTROLOGERS, type Astrologer } from "../data/astrologers";
import { ArrowRight } from "../components/icons";

const MOON_PHASES = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

/** Muted celestial line-art scattered behind the title, as in the reference. */
function CelestialBackdrop() {
  const c = "rgba(240,220,190,0.18)";
  return (
    <svg viewBox="0 0 400 200" className="pointer-events-none absolute inset-x-0 top-0 h-52 w-full" fill="none" stroke={c} strokeWidth="1">
      {/* radiant sun, top-left */}
      <g>
        <circle cx="55" cy="55" r="13" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={55 + Math.cos(a) * 17} y1={55 + Math.sin(a) * 17} x2={55 + Math.cos(a) * 23} y2={55 + Math.sin(a) * 23} />;
        })}
      </g>
      {/* crescent + stars, top-right */}
      <path d="M352 44a12 12 0 1 0 6 15 9 9 0 0 1-6-15Z" />
      <path d="M330 78l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5Z" fill={c} stroke="none" />
      <path d="M372 92l1.2 2.5 2.5 1.2-2.5 1.2-1.2 2.5-1.2-2.5-2.5-1.2 2.5-1.2Z" fill={c} stroke="none" />
      {/* clouds, upper-right */}
      <path d="M300 30c4-6 14-5 16 1 6-1 10 5 6 9h-26c-4-4-1-9 4-10Z" />
      {/* saturn, mid-left */}
      <g>
        <circle cx="40" cy="130" r="9" />
        <ellipse cx="40" cy="130" rx="16" ry="5" transform="rotate(-20 40 130)" />
      </g>
      {/* planet + orbit, mid-right */}
      <circle cx="368" cy="150" r="7" />
      <circle cx="360" cy="145" r="18" strokeDasharray="2 3" />
      {/* small plus-stars */}
      <path d="M120 40v8M116 44h8" />
      <path d="M270 120v8M266 124h8" />
      {/* scattered dots */}
      {[[90,90],[150,30],[210,45],[250,95],[310,125],[80,160],[190,150]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.2" fill={c} stroke="none" />
      ))}
    </svg>
  );
}

function Flourish() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-[10px] opacity-60" style={{ color: "#f3d9a8" }}>
      <span>☾</span><span>✦</span><span>◦</span><span>✧</span><span>◦</span><span>✦</span><span>☽</span>
    </div>
  );
}

function AstrologerCard({ a, onOpen }: { a: Astrologer; onOpen: () => void }) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-[30px] px-6 py-8"
      style={{
        background: "linear-gradient(165deg, #a9793f 0%, #8a5d2c 45%, #6d461f 100%)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 30px 70px -20px rgba(80,45,15,0.9), inset 0 1px 0 rgba(255,255,255,0.28)",
      }}
    >
      <div className="pointer-events-none absolute inset-3 rounded-[24px] border border-white/22" />
      {/* faint sun-ray mandala behind portrait */}
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 opacity-[0.22]"
        style={{ backgroundImage: "repeating-conic-gradient(from 0deg, rgba(255,240,210,0.9) 0deg 1deg, transparent 1deg 9deg)", borderRadius: "9999px", maskImage: "radial-gradient(circle, #000 40%, transparent 72%)", WebkitMaskImage: "radial-gradient(circle, #000 40%, transparent 72%)" }}
      />

      {/* shield badge + experience */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-black/20 ring-1 ring-white/25">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#f3d9a8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </span>
        <p className="mt-2.5 font-serif text-[15px] tracking-wide text-white/95">{a.years} years of experience</p>
      </div>

      {/* circular photo */}
      <div className="relative z-10 my-5">
        <img
          src={a.photo}
          alt={a.name}
          className="h-36 w-36 rounded-full object-cover"
          style={{ boxShadow: "0 0 0 4px rgba(255,255,255,0.18), 0 14px 34px -8px rgba(50,25,5,0.8)" }}
        />
      </div>

      <h2 className="relative z-10 text-center font-display text-[34px] font-semibold leading-[1.05] text-white drop-shadow">
        {a.name}
      </h2>
      <p className="relative z-10 mt-2 font-serif text-sm tracking-wide text-white/85">{a.specialty}</p>

      <div className="relative z-10 mt-auto w-full pt-5">
        <Flourish />
        <button
          onClick={onOpen}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-black/25 py-2.5 text-sm text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-black/35"
        >
          Consult · ₹{a.rate}/min <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function AstrologersScreen({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const n = ASTROLOGERS.length;
  const drag = useRef({ x: 0, active: false, moved: false });
  const lockRef = useRef(false);
  const go = (dir: number) => setIndex((i) => (i + dir + n) % n);

  const onWheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12 || lockRef.current) return;
    lockRef.current = true;
    go(d > 0 ? 1 : -1);
    setTimeout(() => (lockRef.current = false), 350);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [n]);

  const onDown = (x: number) => (drag.current = { x, active: true, moved: false });
  const onMove = (x: number) => {
    if (drag.current.active && Math.abs(x - drag.current.x) > 8) drag.current.moved = true;
  };
  const onUp = (x: number) => {
    if (!drag.current.active) return;
    const dx = x - drag.current.x;
    if (dx < -50) go(1);
    else if (dx > 50) go(-1);
    drag.current.active = false;
  };

  return (
    <div className="relative select-none pb-4">
      <CelestialBackdrop />

      <div className="relative z-10 mb-2 flex items-center justify-between pt-1">
        <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-full glass text-cream hover:text-ember">
          <ArrowRight className="h-4 w-4 rotate-180" />
        </button>
        <h1 className="font-display text-2xl font-semibold text-cream">Astrologers</h1>
        <span className="h-9 w-9" />
      </div>

      <div
        className="relative mt-6 h-[440px] w-full touch-pan-y"
        onWheel={onWheel}
        onMouseDown={(e) => onDown(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={(e) => onUp(e.clientX)}
        onMouseLeave={() => (drag.current.active = false)}
        onTouchStart={(e) => onDown(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={(e) => onUp(e.changedTouches[0].clientX)}
      >
        {ASTROLOGERS.map((a, i) => {
          let offset = i - index;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;
          const abs = Math.abs(offset);
          if (abs > 2) return null;
          const isCenter = offset === 0;
          const style: React.CSSProperties = {
            transform: `translateX(${offset * 44}px) translateY(${abs * 16}px) scale(${1 - abs * 0.08}) rotate(${offset * 2.5}deg)`,
            opacity: 1 - abs * 0.1,
            zIndex: 20 - abs,
            filter: isCenter ? "none" : "brightness(0.72)",
            transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.45s, filter 0.45s",
            pointerEvents: isCenter ? "auto" : "none",
          };
          return (
            <div key={a.name} className="absolute inset-x-0 mx-auto h-full w-[78%] max-w-[290px]" style={style}>
              <AstrologerCard a={a} onOpen={() => { if (!drag.current.moved) go(0); }} />
            </div>
          );
        })}
        <button aria-label="Previous" onClick={() => go(-1)} className="absolute inset-y-0 left-0 z-30 w-[11%]" />
        <button aria-label="Next" onClick={() => go(1)} className="absolute inset-y-0 right-0 z-30 w-[11%]" />
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {ASTROLOGERS.map((a, i) => (
          <button
            key={a.name}
            onClick={() => setIndex(i)}
            aria-label={a.name}
            className="text-base transition-all duration-300"
            style={{
              opacity: i === index ? 1 : 0.3,
              transform: i === index ? "scale(1.25)" : "scale(1)",
              filter: i === index ? "drop-shadow(0 0 6px rgba(240,145,62,0.8))" : "none",
            }}
          >
            {MOON_PHASES[i % MOON_PHASES.length]}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-ash">{ASTROLOGERS[index].languages} · online now</p>
    </div>
  );
}
