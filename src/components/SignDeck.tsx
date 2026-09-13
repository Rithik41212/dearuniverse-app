import { useEffect, useRef, useState } from "react"
import { SIGNS, type Sign } from "../data/zodiac"
import { ArrowRight } from "./icons"

const MOON_PHASES = ["●", "◔", "◑", "◕", "○", "◕", "◑", "◔"]

function CardOrnament() {
  return (
    <svg
      viewBox="0 0 280 420"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full text-[#f1d2a0]"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.7"
    >
      <defs>
        <radialGradient id="cardGlow">
          <stop stopColor="#f7d08e" stopOpacity=".25" />
          <stop offset="1" stopColor="#f7d08e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="140" cy="212" r="116" fill="url(#cardGlow)" stroke="none" />
      <path
        d="M39 42h74m54 0h74M113 42l9-2 6 2-6 2-9-2Zm54 0-9-2-6 2 6 2 9-2Z"
        opacity=".42"
      />
      <circle cx="140" cy="42" r="7" opacity=".35" />
      <path d="M140 31v22M129 42h22m-18-9 14 18m0-18-14 18" opacity=".28" />
      <path
        d="M39 378h74m54 0h74M113 378l9-2 6 2-6 2-9-2Zm54 0-9-2-6 2 6 2 9-2Z"
        opacity=".42"
      />
      <circle cx="140" cy="378" r="7" opacity=".35" />
      <path d="M140 367v22M129 378h22m-18-9 14 18m0-18-14 18" opacity=".28" />
      <path d="M29 65v290M251 65v290" strokeDasharray="1 7" opacity=".48" />
      {[78, 112, 145, 178, 242, 275, 308, 342].map((y) => (
        <g key={y} opacity=".55">
          <circle cx="29" cy={y} r="2" />
          <circle cx="251" cy={y} r="2" />
          <path d={`M24 ${y}h10M29 ${y - 5}v10M246 ${y}h10M251 ${y - 5}v10`} />
        </g>
      ))}
      <path
        d="M29 52c-7 5-8 13-3 20-1-7 3-12 10-14-3-3-5-5-7-6ZM251 52c7 5 8 13 3 20 1-7-3-12-10-14 3-3 5-5 7-6ZM29 368c-7-5-8-13-3-20-1 7 3 12 10 14-3 3-5 5-7 6ZM251 368c7-5 8-13 3-20 1 7-3 12-10 14 3 3 5 5 7 6Z"
        opacity=".75"
      />
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2
        return (
          <line
            key={i}
            x1={140 + Math.cos(a) * 65}
            y1={212 + Math.sin(a) * 65}
            x2={140 + Math.cos(a) * (i % 2 ? 100 : 111)}
            y2={212 + Math.sin(a) * (i % 2 ? 100 : 111)}
            opacity={i % 2 ? ".12" : ".2"}
          />
        )
      })}
      <circle cx="140" cy="212" r="84" opacity=".13" />
      <circle cx="140" cy="212" r="97" strokeDasharray="1 6" opacity=".2" />
    </svg>
  )
}

function VerifiedCrest() {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-[#ead4af]/90 text-[#835624] shadow-[0_4px_12px_rgba(45,24,7,.2)]">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3 19 6v5c0 4.4-2.9 7.4-7 9-4.1-1.6-7-4.6-7-9V6l7-3Z" />
        <path d="m9.5 11.8 1.7 1.7 3.6-4" />
      </svg>
    </span>
  )
}

function DeckCard({ s, onOpen }: { s: Sign; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label={`Open ${s.name} reading`}
      className="group relative flex h-full w-full flex-col items-center overflow-hidden rounded-[30px] px-7 py-7 text-center outline-none transition-transform active:scale-[0.99]"
      style={{
        background:
          "linear-gradient(155deg, #b67a3f 0%, #98602f 46%, #75441f 100%)",
        border: "1px solid rgba(255,235,205,0.25)",
        boxShadow:
          "0 28px 70px -20px rgba(61,31,9,.95), inset 0 1px 0 rgba(255,255,255,.25)",
      }}
    >
      <div className="pointer-events-none absolute inset-[11px] rounded-[23px] border border-[#f0d3a4]/25 shadow-[inset_0_0_42px_rgba(47,22,6,.22)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_4%,rgba(255,236,203,.14),transparent_37%),linear-gradient(to_bottom,transparent_65%,rgba(48,22,7,.15))]" />
      <CardOrnament />
      <div className="relative z-10 flex flex-col items-center">
        <VerifiedCrest />
        <p className="mt-2.5 text-[13px] font-medium tracking-[-0.01em] text-[#fff4e6]">
          {s.dates}
        </p>
      </div>
      <div className="relative z-10 mt-5 grid h-[128px] w-[128px] place-items-center rounded-full border border-[#ffdf9c]/55 bg-[radial-gradient(circle_at_35%_25%,#f7cf80_0%,#e4a948_55%,#b66a28_100%)] shadow-[0_12px_30px_-8px_rgba(45,22,4,.75),0_0_0_5px_rgba(255,225,174,.08)]">
        <span className="font-serif text-[62px] leading-none text-[#7a431d] drop-shadow-[0_2px_1px_rgba(255,239,203,.35)]">
          {s.glyph}
        </span>
        <span className="absolute inset-2 rounded-full border border-[#fff0cc]/20" />
      </div>
      <h2 className="relative z-10 mt-5 font-display text-[36px] font-medium leading-none tracking-[-0.02em] text-[#fff9f0] drop-shadow-[0_2px_8px_rgba(42,20,5,.3)]">
        {s.name}
      </h2>
      <p className="relative z-10 mt-2 font-serif text-[14px] tracking-wide text-[#f5d9b8]">
        {s.sanskrit} · {s.element}
      </p>
      <p className="relative z-10 mt-1 text-[11px] text-[#efd7b8]/75">
        Ruled by {s.ruler}
      </p>
      <div className="relative z-10 mt-auto flex items-center gap-2 text-xs font-medium text-[#fff4e6]/90 transition-colors group-hover:text-white">
        Explore your reading{" "}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  )
}

export function SignDeck({ onOpen }: { onOpen: (s: Sign) => void }) {
  const [index, setIndex] = useState(0)
  const n = SIGNS.length
  const drag = useRef({ x: 0, active: false, moved: false })
  const go = (dir: number) => setIndex((i) => (i + dir + n) % n)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [n])
  const onDown = (x: number) =>
    (drag.current = { x, active: true, moved: false })
  const onMove = (x: number) => {
    if (drag.current.active && Math.abs(x - drag.current.x) > 8)
      drag.current.moved = true
  }
  const onUp = (x: number) => {
    if (!drag.current.active) return
    const dx = x - drag.current.x
    if (dx < -50) go(1)
    else if (dx > 50) go(-1)
    drag.current.active = false
  }
  return (
    <div className="select-none">
      <div
        className="relative h-[430px] w-full touch-pan-y"
        onMouseDown={(e) => onDown(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={(e) => onUp(e.clientX)}
        onMouseLeave={() => (drag.current.active = false)}
        onTouchStart={(e) => onDown(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={(e) => onUp(e.changedTouches[0].clientX)}
        onTouchCancel={() => (drag.current.active = false)}
      >
        {SIGNS.map((s, i) => {
          let offset = i - index
          if (offset > n / 2) offset -= n
          if (offset < -n / 2) offset += n
          const abs = Math.abs(offset)
          if (abs > 2) return null
          const isCenter = offset === 0
          const style: React.CSSProperties = {
            transform: `translateX(${offset * 38}px) translateY(${abs * 12}px) scale(${1 - abs * 0.065})`,
            opacity: 1,
            zIndex: 20 - abs,
            transition:
              "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
            pointerEvents: isCenter ? "auto" : "none",
          }
          return (
            <div
              key={s.name}
              className="absolute inset-x-0 mx-auto h-full w-[78%] max-w-[290px]"
              style={style}
              inert={!isCenter}
            >
              <DeckCard
                s={s}
                onOpen={() => {
                  if (!drag.current.moved) onOpen(s)
                }}
              />
            </div>
          )
        })}
        <button
          aria-label="Previous sign"
          onClick={() => go(-1)}
          className="absolute inset-y-0 left-0 z-30 w-[11%]"
        />
        <button
          aria-label="Next sign"
          onClick={() => go(1)}
          className="absolute inset-y-0 right-0 z-30 w-[11%]"
        />
      </div>
      <div className="mt-5 flex items-center justify-center gap-2.5">
        {SIGNS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setIndex(i)}
            aria-label={s.name}
            className="text-[11px] text-[#d7af7d] transition-all duration-300"
            style={{
              opacity: i === index ? 1 : 0.26,
              transform: i === index ? "scale(1.35)" : "scale(1)",
              filter:
                i === index
                  ? "drop-shadow(0 0 6px rgba(240,145,62,0.8))"
                  : "none",
            }}
          >
            {MOON_PHASES[i % MOON_PHASES.length]}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] tracking-wide text-ash">
        Swipe or tap the edges to explore
      </p>
    </div>
  )
}
