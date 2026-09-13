import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import CelestialArt, { SIGNS, SYMBOLS } from "../components/CelestialArt"
import { useAstro } from "../astro/AstroContext"

const qualities = [
  "Passion & charisma",
  "Emotional stability",
  "Sense of humor",
  "Shared ambition",
  "Open communication",
  "Adventure & freedom",
]
const thoughts = [
  "Take the first small step. Courage grows each time you choose to begin.",
  "Make room for what restores you. A slower pace can still take you somewhere beautiful.",
  "Ask the question you have been holding back. Connection begins with curiosity.",
  "Let yourself receive the care you so freely give to others.",
  "Your warmth is a gift. Share it without needing to earn the spotlight.",
  "Allow something to be unfinished today. Your worth is not measured by perfection.",
  "Choose the peace that includes your own needs, too.",
  "Release one thing you have outgrown. There is room for a gentler beginning.",
  "Follow a small spark of wonder. A new perspective may be closer than you think.",
  "Honor how far you have come. Rest is part of building a meaningful life.",
  "Give your unusual idea a little space. You do not need everyone to understand it yet.",
  "Listen to your intuition, then give your dream one practical next step.",
]
const titles = [
  "The Sun",
  "The Moon",
  "The Star",
  "Wheel of Fortune",
  "The World",
  "Strength",
  "Temperance",
  "The Magician",
  "The Empress",
  "The Hermit",
  "Justice",
  "The Chariot",
]

export function CosmicTeasers({
  onOpen,
}: {
  onOpen: (mode: "cards" | "match") => void
}) {
  return (
    <section className="cosmic-teasers">
      <p className="ritual-eyebrow">A little closer to the cosmos</p>
      <h2>Your daily rituals</h2>
      <div className="ritual-links">
        <button onClick={() => onOpen("cards")} className="ritual-preview">
          <div className="mini-deck">
            {[0, 1, 2].map((i) => (
              <CelestialArt
                key={i}
                variant={i}
                className={`mini-card mini-card-${i}`}
              />
            ))}
          </div>
          <span className="ritual-eyebrow">A moment for you</span>
          <h3>Card of the day</h3>
          <p>Let your intuition choose.</p>
          <span className="ritual-link">Draw your card ↗</span>
        </button>
        <button onClick={() => onOpen("match")} className="ritual-preview">
          <CelestialArt wheel className="preview-wheel" />
          <span className="ritual-eyebrow">Written in the stars</span>
          <h3>Zodiac match</h3>
          <p>Discover your kind of connection.</p>
          <span className="ritual-link">Find your match ↗</span>
        </button>
      </div>
    </section>
  )
}

export default function CosmicScreen({
  mode,
  onBack,
}: {
  mode: "cards" | "match"
  onBack: () => void
}) {
  const astro = useAstro()
  const calculatedSign = astro.profile?.charts[astro.system].planets.Sun.sign
  const [sign, setSign] = useState(() => {
    try {
      return localStorage.getItem("cosmic-sign") || "Capricorn"
    } catch {
      return "Capricorn"
    }
  })
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [offset, setOffset] = useState(5)
  const [drawn, setDrawn] = useState<number | null>(null)
  const [flipped, setFlipped] = useState(false)
  useEffect(() => { if (calculatedSign && drawn === null) setSign(calculatedSign); }, [calculatedSign, drawn])
  const [motion, setMotion] = useState<"idle" | "rising" | "ready" | "unflipping" | "returning">("idle")
  const [liftY, setLiftY] = useState(-380)
  const stageRef = useRef<HTMLDivElement>(null)
  const fanRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (mode !== "cards") return
    const measure = () => {
      const stage = stageRef.current?.getBoundingClientRect()
      const fan = fanRef.current?.getBoundingClientRect()
      if (stage && fan) setLiftY(stage.top + stage.height / 2 - fan.top)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (stageRef.current) observer.observe(stageRef.current)
    if (fanRef.current?.parentElement) observer.observe(fanRef.current.parentElement)
    return () => observer.disconnect()
  }, [mode])
  function drawCard(index: number) {
    if (drawn !== null) return
    clearHold()
    setDrawn(index)
    setFlipped(false)
    setMotion("rising")
  }
  function returnCard() {
    if (motion !== "ready") return
    setMotion(flipped ? "unflipping" : "returning")
    setFlipped(false)
  }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gesture = useRef({ x: 0, offset: 0, moved: false })
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  function updateSign(value: string) {
    setSign(value)
    try {
      localStorage.setItem("cosmic-sign", value)
    } catch {
      /* Storage is optional. */
    }
  }
  function clearHold() {
    if (timer.current) clearTimeout(timer.current)
  }
  const signIndex = Math.max(0, SIGNS.indexOf(sign))
  const matchIndex =
    (signIndex + (selected.includes(qualities[1]) ? 4 : 8)) % 12
  return (
    <section className="cosmic-screen animate-float-in">
      <div className="ritual-topline">
        <button onClick={onBack} aria-label="Back to home">
          ←
        </button>
        <span>
          DEARUNIVERSE / {mode === "cards" ? "DAILY RITUAL" : "CONNECTIONS"}
        </span>
        <button onClick={onBack} aria-label="Close experience">
          ×
        </button>
      </div>
      {mode === "cards" ? (
        <>
          <p className="ritual-eyebrow">A quiet moment. A little clarity.</p>
          <h1>
            Find your card
            <br />
            of the day
          </h1>
          <p className="ritual-description">
            Breathe deeply. Let a card call to you.
          </p>
          <label className="sign-pill">
            <span>{SYMBOLS[signIndex]}</span>
            <select
              aria-label="Your zodiac sign"
              value={sign}
              disabled={drawn !== null}
              onChange={(e) => {
                updateSign(e.target.value)
                setDrawn(null)
                setFlipped(false)
              }}
            >
              {SIGNS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <div ref={stageRef} className={`card-stage ${drawn !== null ? "has-drawn" : ""}`}>
            <CelestialArt wheel className="stage-orbit" />
            <span className="stage-star star-left">✧</span>
            <span className="stage-star star-right">✦</span>
            <div className="waiting-message" style={{ visibility: drawn === null ? "visible" : "hidden" }}>
              <span>✧</span>
              <p>Your intuition knows the way</p>
              <small>Choose from the deck below</small>
            </div>
          </div>
          <p className="card-instruction" aria-live="polite">
            {drawn === null
              ? "Hold a card to bring it into the light"
              : flipped
                ? "A little reflection, chosen for you"
                : "Tap your card to reveal its message"}
          </p>
          <div
            className="deck-window"
            onPointerDown={(e) => {
              if (drawn !== null) return
              gesture.current = { x: e.clientX, offset, moved: false }
            }}
            onPointerMove={(e) => {
              if (!e.buttons || drawn !== null) return
              const dx = e.clientX - gesture.current.x
              if (Math.abs(dx) > 8) {
                clearHold()
                gesture.current.moved = true
                setOffset(
                  Math.max(0, Math.min(11, gesture.current.offset - dx / 40)),
                )
              }
            }}
            onPointerUp={clearHold}
            onPointerCancel={clearHold}
          >
            <div ref={fanRef} className="card-fan">
              {titles.map((title, i) => {
                const distance = i - offset
                const active = drawn === i
                const lifted = active && motion !== "returning"
                return (
                  <button
                    key={title}
                    disabled={drawn !== null && !active}
                    className={`fan-card ${active ? "selected-deck-card" : ""}`}
                    data-card-index={i}
                    data-motion={active ? motion : "idle"}
                    onTransitionEnd={(e) => {
                      if (e.target !== e.currentTarget || e.propertyName !== "transform" || !active) return
                      if (motion === "rising") setMotion("ready")
                      if (motion === "returning") {
                        setDrawn(null)
                        setMotion("idle")
                      }
                    }}
                    style={
                      {
                        "--x": lifted ? "0px" : `${distance * 43}px`,
                        "--y": lifted ? `${liftY}px` : `${Math.abs(distance) ** 2 * 5}px`,
                        "--r": lifted ? "0deg" : `${distance * 10}deg`,
                        "--scale": lifted ? 1 : 85 / 198,
                        zIndex: active ? 40 : 20 - Math.round(Math.abs(distance)),
                      } as CSSProperties
                    }
                    aria-label={active ? (flipped ? "Turn card back over" : "Reveal your thought of the day") : `Choose card ${i + 1}`}
                    onPointerDown={(e) => {
                      if (drawn !== null) return
                      e.currentTarget.setPointerCapture(e.pointerId)
                      clearHold()
                      timer.current = setTimeout(() => {
                        drawCard(i)
                      }, 550)
                    }}
                    onClick={(e) => {
                      if (active) {
                        if (motion === "ready") setFlipped(!flipped)
                      } else if (e.detail === 0 || !gesture.current.moved) drawCard(i)
                    }}
                  >
                    <div className={`card-turn ${active && flipped ? "is-flipped" : ""}`}
                      onTransitionEnd={(e) => {
                        if (e.target === e.currentTarget && e.propertyName === "transform" && motion === "unflipping" && active) setMotion("returning")
                      }}>
                      <div className="card-face card-back"><CelestialArt variant={i} /></div>
                      <div className="card-face card-front" aria-hidden={!active || !flipped}>
                        <span className="ritual-eyebrow">{String(i + 1).padStart(2, "0")} · {sign}</span>
                        <CelestialArt wheel variant={i} />
                        <h2>{titles[i]}</h2>
                        <span className="tiny-divider">── ✧ ──</span>
                        <p>{thoughts[(signIndex + i) % 12]}</p>
                        <small>Carry this with you today</small>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          {drawn === null ? (
            <div className="deck-controls">
              <button
                aria-label="Previous cards"
                onClick={() => setOffset(Math.max(0, offset - 1))}
              >
                ←
              </button>
              <span>Drag slowly to explore</span>
              <button
                aria-label="Next cards"
                onClick={() => setOffset(Math.min(11, offset + 1))}
              >
                →
              </button>
            </div>
          ) : (
            <button
              className="ritual-text-button"
              disabled={motion !== "ready"}
              onClick={returnCard}
            >
              Return card to the deck ↺
            </button>
          )}
          <p className="ritual-footnote">
            A daily ritual for reflection, inspired by the stars.
          </p>
        </>
      ) : (
        <>
          <p className="ritual-eyebrow">The art of finding each other</p>
          <h1>
            {step === 0 ? (
              <>
                Zodiac
                <br />
                match
              </>
            ) : step === 1 ? (
              <>
                Your cosmic
                <br />
                signature
              </>
            ) : step === 2 ? (
              <>
                What draws
                <br />
                you closer?
              </>
            ) : (
              <>
                A connection
                <br />
                written in the stars
              </>
            )}
          </h1>
          {step < 3 && (
            <div className="ritual-progress">
              {[0, 1, 2].map((i) => (
                <span key={i} className={step >= i ? "active" : ""} />
              ))}
            </div>
          )}
          {step === 0 && (
            <>
              <div className="match-hero">
                <CelestialArt />
                <span className="stage-star star-right">✧</span>
              </div>
              <p className="ritual-description">
                Uncover the love meant for you.
                <br />A connection as unique as your constellation.
              </p>
              <button className="ritual-primary" onClick={() => setStep(1)}>
                Start your story <span>↗</span>
              </button>
            </>
          )}
          {step === 1 && (
            <>
              <CelestialArt wheel className="match-wheel" />
              <p className="ritual-description">
                Enter your zodiac sign to begin.
              </p>
              <form
                className="match-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  setStep(2)
                }}
              >
                <label>
                  Your zodiac sign
                  <select
                    value={sign}
                    onChange={(e) => updateSign(e.target.value)}
                  >
                    {SIGNS.map((s, i) => (
                      <option key={s} value={s}>
                        {SYMBOLS[i]} {s}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="ritual-footnote">
                  Your sun sign is all you need for this reading.
                </p>
                <button className="ritual-primary">
                  Explore compatibility <span>↗</span>
                </button>
              </form>
              <button className="ritual-text-button" onClick={() => setStep(0)}>
                ← Back
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <p className="ritual-description">
                Choose the qualities you value
                <br />
                most in a partner.
              </p>
              <div className="quality-grid">
                {qualities.map((q, i) => (
                  <button
                    key={q}
                    aria-pressed={selected.includes(q)}
                    className={`quality-card ${
                      selected.includes(q) ? "selected" : ""
                    }`}
                    onClick={() =>
                      setSelected(
                        selected.includes(q)
                          ? selected.filter((v) => v !== q)
                          : [...selected, q],
                      )
                    }
                  >
                    <span className="quality-check">
                      {selected.includes(q) ? "✓" : "✧"}
                    </span>
                    <CelestialArt wheel variant={i} />
                    <span>{q}</span>
                    <span className="quality-ornament">· ✧ ·</span>
                  </button>
                ))}
              </div>
              <button
                disabled={!selected.length}
                className="ritual-primary"
                onClick={() => setStep(3)}
              >
                Find my match <span>↗</span>
              </button>
              <button className="ritual-text-button" onClick={() => setStep(1)}>
                ← Your sign
              </button>
            </>
          )}
          {step === 3 && (
            <div className="match-result animate-float-in">
              <div className="paired-signs">
                <span>{SYMBOLS[signIndex]}</span>
                <i>✧</i>
                <span>{SYMBOLS[matchIndex]}</span>
              </div>
              <p className="ritual-eyebrow">Your celestial pairing</p>
              <h2>
                {sign} & {SIGNS[matchIndex]}
              </h2>
              <p>A shared rhythm, with room to grow.</p>
              <div className="result-note">
                <span>THE BEAUTY OF THIS CONNECTION</span>
                <p>
                  {selected.includes(qualities[1])
                    ? "Steadiness meets understanding. This pairing invites you to build trust through small, thoughtful moments."
                    : "Curiosity meets possibility. This pairing invites you to share new experiences while celebrating what makes each of you different."}
                </p>
                <div className="result-tags">
                  {selected.map((q) => (
                    <span key={q}>{q}</span>
                  ))}
                </div>
              </div>
              <p className="ritual-footnote">
                An imaginative sun-sign pairing for reflection. Real
                compatibility grows through knowing each other.
              </p>
              <button className="ritual-primary" onClick={() => setStep(1)}>
                Explore another connection ↗
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
