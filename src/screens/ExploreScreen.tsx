import { useState } from "react"
import { useAstro, useForecast } from "../astro/AstroContext"
import { type Sign } from "../data/zodiac"
import { SegTabs } from "../components/SegTabs"
import { SignDeck } from "../components/SignDeck"
import { ArrowRight, SparkleIcon } from "../components/icons"

function SignDetail({ s, onBack }: { s: Sign; onBack: () => void }) {
  const [tab, setTab] = useState("Daily")
  const astro = useAstro()
  const forecast = useForecast(tab === "Daily" ? "day" : tab === "Weekly" ? "week" : tab === "Monthly" ? "month" : "year")
  const personal = astro.profile?.charts[astro.system].planets.Sun.sign === s.name
  const general = {
    Daily: s.daily,
    Weekly: s.weekly,
    Monthly: s.monthly,
    Yearly: s.yearly,
  }[tab]
  const text = personal ? forecast.data?.reflections.join(" ") ?? (forecast.loading ? "Preparing your personal reading…" : forecast.error || "Your reading is not ready.") : `General ${s.name} reflection: ${general}`

  return (
    <div className="animate-float-in space-y-5 pb-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-ash hover:text-cream"
      >
        <ArrowRight className="h-3.5 w-3.5 rotate-180" /> All signs
      </button>

      {/* hero crest */}
      <div className="relative overflow-hidden rounded-3xl glass-strong p-7 text-center">
        <div
          className="absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${s.color}55, transparent 70%)`,
          }}
        />
        <div
          className="relative mx-auto grid h-28 w-28 place-items-center rounded-full text-6xl"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${s.gradient[0]}66, ${s.gradient[1]}22)`,
            border: `1px solid ${s.color}66`,
            color: s.color,
            textShadow: `0 0 24px ${s.color}88`,
          }}
        >
          {s.glyph}
        </div>
        <h1 className="relative mt-4 font-display text-3xl font-semibold text-cream">
          {s.name}
        </h1>
        <p className="relative font-serif text-sm text-gold">
          {s.sanskrit} · {s.dates}
        </p>
        <div className="relative mt-3 flex flex-wrap justify-center gap-2">
          <Tag>{s.element}</Tag>
          <Tag>Ruled by {s.ruler}</Tag>
          {s.traits.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <SegTabs
          tabs={["Daily", "Weekly", "Monthly", "Yearly"]}
          active={tab}
          onChange={setTab}
          size="sm"
        />
      </div>

      <div key={tab} className="animate-float-in rounded-3xl glass p-5">
        <p className="font-serif text-[15px] leading-relaxed text-cream/85">
          {text}
        </p>
      </div>

      {/* lucky trio */}
      <div className="rounded-3xl glass-strong p-5">
        <div className="mb-3 flex items-center gap-2">
          <SparkleIcon className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-base text-cream">Lucky today</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Lucky k="Colour" v={s.lucky.color} />
          <Lucky k="Number" v={String(s.lucky.number)} />
          <Lucky k="Time" v={s.lucky.time} />
        </div>
      </div>

      <button onClick={() => astro.profile ? astro.openReport("Daily forecast") : astro.openProfile()} className="w-full rounded-full bg-gradient-to-b from-ember-soft to-ember py-3.5 font-serif text-[#12100c] shadow-[0_8px_24px_rgba(240,145,62,0.3)]">
        Read full {s.name} report
      </button>
    </div>
  )
}

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-cream/80">
    {children}
  </span>
)
const Lucky = ({ k, v }: { k: string; v: string }) => (
  <div>
    <p className="font-serif text-sm text-gradient-gold">{v}</p>
    <p className="text-[10px] text-ash">{k}</p>
  </div>
)

export function ExploreScreen() {
  const [selected, setSelected] = useState<Sign | null>(null)

  if (selected)
    return <SignDetail s={selected} onBack={() => setSelected(null)} />

  return (
    <div className="space-y-4 pb-4">
      <div className="mx-auto max-w-sm text-center">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-ember/80">
          Your celestial guide
        </p>
        <h1 className="font-display text-[28px] font-semibold text-cream">
          Select your sign
        </h1>
        <p className="text-sm text-ash">
          Twelve rāshi, each a doorway. What do you want to know?
        </p>
      </div>
      <SignDeck onOpen={(s) => setSelected(s)} />
    </div>
  )
}
