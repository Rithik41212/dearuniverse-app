import { useState } from "react"

import { useAstro, useForecast } from "../astro/AstroContext"

import { CosmicTeasers } from "./CosmicScreen"

import { SegTabs } from "../components/SegTabs"

import { IMG } from "../data/images"

import { ArrowRight, SparkleIcon } from "../components/icons"

const SectionHead = ({ title, action }: { title: string; action?: string }) => (
  <div className="mb-3 flex items-center justify-between">
    <h2 className="font-serif text-lg text-cream">{title}</h2>
    {action && (
      <button className="text-xs text-ember hover:text-ember-soft">
        {action}
      </button>
    )}
  </div>
)

export function HomeScreen({ onOpenCosmic, onOpenGuide }: {
  onOpenCosmic?: (mode: "cards" | "match") => void

  onOpenGuide?: () => void
} = {}) {
  const [tab, setTab] = useState("Today")

  const astro = useAstro()

  const forecast = useForecast(
    tab === "Today" ? "day" : tab === "This week" ? "week" : "year",
  )

  const data = forecast.data

  const cards = [
    {
      title: `A little clarity for your ${
        tab === "Today" ? "day" : tab === "This week" ? "week" : "year"
      }`,
      body:
        data?.reflections[0] ??
        (forecast.loading
          ? "Preparing your personal reading..."
          : astro.profile
            ? forecast.error || "Your reading is not ready yet."
            : "Add your birth details for a reflection on what matters to you."),
      lessons: data?.date ?? "Your birth profile",
      img: IMG.tarot,
    },

    {
      title: "A step you can try",
      body:
        data?.reflections[1] ??
        "Choose one conversation, habit, or small task that could make today feel easier.",
      lessons: "Make room for progress",
      img: IMG.tarot2,
    },
  ]

  return (
    <div className="space-y-7 pb-4">
      {onOpenGuide && (
        <button
          onClick={onOpenGuide}
          className="group relative w-full text-left cursor-pointer overflow-hidden rounded-3xl border border-ember/40 bg-gradient-to-r from-ember/20 via-gold/15 to-ember/20 p-4 shadow-[0_0_30px_rgba(224,140,58,0.18)] transition-all hover:border-ember hover:shadow-[0_0_40px_rgba(224,140,58,0.35)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-ember to-amber-600 text-lg text-[#14100c] shadow-lg shadow-ember/30 transition-transform group-hover:scale-105">
                🎙️
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ember">
                    A moment for you
                  </span>
                  <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[9px] text-gold">
                    Audio guide
                  </span>
                </div>
                <h3 className="font-serif text-base font-medium text-cream transition-colors group-hover:text-gold">
                  What’s on your heart?
                </h3>
                <p className="text-[11px] text-ash">
                  Love, marriage, work, or your next chapter.
                </p>
              </div>
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full glass text-cream transition-all group-hover:bg-ember group-hover:text-[#12100c]">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </button>
      )}
      {onOpenCosmic && <CosmicTeasers onOpen={onOpenCosmic} />}
      <div className="flex justify-center">
        <SegTabs
          tabs={["Today", "This week", "This year"]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {/* Your nice day — tarot card carousel */}
      <section>
        <SectionHead title="A little perspective" />
        <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-1">
          {cards.map((c, i) => (
            <article
              key={c.title + tab}
              className="animate-float-in w-[280px] shrink-0 overflow-hidden rounded-3xl glass-strong"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative h-44">
                <img
                  src={c.img}
                  alt={c.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b09] via-transparent to-transparent" />
                <div className="absolute right-3 top-3 rounded-full glass px-2.5 py-1 text-[10px] text-cream/90">
                  ✦ {tab}
                </div>
              </div>
              <div className="p-4">
                <p className="mb-1 text-xs text-ember">{c.title}</p>
                <h3 className="font-serif text-lg leading-snug text-cream">
                  {c.body}
                </h3>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-white/10">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-ember-soft to-ember" />
                  </div>
                  <span className="text-[10px] text-ash">{c.lessons}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl glass-strong p-5">
        <div className="mb-4 flex items-center gap-2">
          <SparkleIcon className="h-4 w-4 text-gold" />
          <h2 className="font-serif text-lg">Make today a little lighter</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              title: "What could help",
              text:
                data?.reflections[2] ??
                "One clear priority leaves more room for meaningful progress.",
              color: "text-emerald-300",
            },

            {
              title: "What to watch for",
              text: "Saying yes to everything can leave too little energy for the things you care about.",
              color: "text-amber-200",
            },

            {
              title: "Try this today",
              text: "Choose one manageable task. Give it twenty focused minutes, then decide what deserves your attention next.",
              color: "text-gold",
            },
          ].map((item) => (
            <div key={item.title} className="border-t border-white/10 pt-4">
              <p className={`mb-2 text-xs font-medium ${item.color}`}>
                {item.title}
              </p>
              <p className="text-xs leading-relaxed text-cream/75">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <button
        onClick={() =>
          astro.profile
            ? astro.openReport("Daily forecast")
            : astro.openProfile()
        }
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-ember-soft to-ember py-4 font-serif text-base text-[#12100c] shadow-[0_10px_30px_rgba(240,145,62,0.35)] transition-transform active:scale-[0.98]"
      >
        What can I do today?
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  )
}
