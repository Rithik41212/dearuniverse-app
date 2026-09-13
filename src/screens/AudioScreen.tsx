import { useState, useRef, useEffect } from "react"
import { IMG } from "../data/images"
import {
  PlayIcon,
  ArrowRight,
  ChatIcon,
  SendIcon,
} from "../components/icons"

const AFFIRMATIONS = [
  {
    title: "Affirmation of the week",
    len: "40 min",
    range: "January – March",
    img: IMG.meditation,
    tone: "#c74a2c",
  },
  {
    title: "Evening wind-down",
    len: "22 min",
    range: "For restful sleep",
    img: IMG.sunset,
    tone: "#e8a13e",
  },
  {
    title: "Morning intention",
    len: "15 min",
    range: "Set your day",
    img: IMG.meditation2,
    tone: "#7bb661",
  },
]

const COURSES = [
  {
    title: "Become the transit reader",
    sub: "Astrology is the study of influence",
    img: IMG.nebulaBlue,
  },
  {
    title: "Intro to rising signs",
    sub: "What the ascendant really reveals",
    img: IMG.nebulaColor,
  },
  {
    title: "Kundalini & the chakras",
    sub: "Energy centres of the subtle body",
    img: IMG.nebulaRed,
  },
]

const SEED = [
  {
    from: "ai",
    text: "Namaste Sahil 🙏 I've read your chart — Leo Sun, Cancer Moon, Scorpio rising. What's on your mind today?",
  },
]
const REPLIES = [
  "With Venus trine your Moon this week, matters of the heart soften. Speak plainly — you'll be heard more kindly than you expect.",
  "Your Scorpio rising makes you read rooms deeply. Trust that instinct today, but don't mistake intensity for certainty.",
  "Saturn is asking for patience in work. The slow path you resent now becomes the reputation you'll thank later.",
  "Cancer Moon means home is your battery. A quiet evening will do more for you than any bold move right now.",
]

function AstrologerChat() {
  const [msgs, setMsgs] = useState(SEED)
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs, typing])

  const send = () => {
    const q = input.trim()
    if (!q) return
    setMsgs((m) => [...m, { from: "me", text: q }])
    setInput("")
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [
        ...m,
        {
          from: "ai",
          text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        },
      ])
    }, 1100)
  }

  return (
    <div className="rounded-3xl glass-strong p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-ember-soft to-ember text-[#12100c]">
          <ChatIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-serif text-cream">Jyotish Guide</p>
          <p className="text-[10px] text-emerald-400">
            ● grounded in your chart
          </p>
        </div>
      </div>

      <div className="no-scrollbar max-h-64 space-y-2.5 overflow-y-auto pr-1">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.from === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.from === "me"
                  ? "rounded-br-sm bg-gradient-to-b from-ember-soft to-ember text-[#12100c]"
                  : "rounded-bl-sm bg-white/6 text-cream/90"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white/6 px-4 py-3">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-ember"
                  style={{ animation: `twinkle 1s ${d * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-full bg-white/5 p-1.5 pl-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about love, career, timing…"
          className="flex-1 bg-transparent text-sm text-cream placeholder:text-ash focus:outline-none"
        />
        <button
          onClick={send}
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-ember-soft to-ember text-[#12100c]"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function AudioScreen() {
  return (
    <div className="space-y-7 pb-4">
      <div className="mx-auto max-w-sm text-center">
        <h1 className="font-display text-2xl font-semibold text-cream">
          Listen & learn
        </h1>
        <p className="text-sm text-ash">
          Guidance for passive hours and curious minds.
        </p>
      </div>

      {/* Affirmations media carousel */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg text-cream">
            Affirmation of the week
          </h2>
          <button className="text-xs text-ember">See all</button>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-1">
          {AFFIRMATIONS.map((a) => (
            <article
              key={a.title}
              className="relative h-48 w-72 shrink-0 overflow-hidden rounded-3xl"
            >
              <img
                src={a.img}
                alt={a.title}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${a.tone}cc, transparent 70%)`,
                }}
              />
              <span className="absolute left-3 top-3 rounded-full glass px-2.5 py-1 text-[10px] text-cream">
                {a.len}
              </span>
              <button className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full glass-strong text-cream">
                <PlayIcon className="ml-0.5 h-5 w-5" />
              </button>
              <p className="absolute bottom-3 left-4 font-serif text-cream drop-shadow">
                {a.range}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Astrologer chat */}
      <section>
        <h2 className="mb-3 font-serif text-lg text-cream">
          Talk to an astrologer
        </h2>
        <AstrologerChat />
      </section>

      {/* Courses */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg text-cream">Courses for you</h2>
          <button className="text-xs text-ember">See all</button>
        </div>
        <div className="space-y-3">
          {COURSES.map((c) => (
            <button
              key={c.title}
              className="flex w-full items-center gap-3 rounded-2xl glass p-3 text-left transition-colors hover:bg-white/[0.06]"
            >
              <img
                src={c.img}
                alt={c.title}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-serif text-sm text-cream">{c.title}</p>
                <p className="text-xs text-ash">{c.sub}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-ember" />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
