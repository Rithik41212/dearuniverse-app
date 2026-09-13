import { useEffect, useState } from "react"
import { useAstro } from "./astro/AstroContext"
import ProfilePanel from "./astro/ProfilePanel"
import ReportPanel from "./astro/ReportPanel"
import StartupFunnel, { emptyJourney, type JourneyState } from "./astro/StartupFunnel"
import NumerologyPanel from "./astro/NumerologyPanel"
import { api, type Profile } from "./astro/api"
import { Starfield } from "./components/Starfield"
import { HomeScreen } from "./screens/HomeScreen"
import { ExploreScreen } from "./screens/ExploreScreen"
import { TransitsScreen } from "./screens/TransitsScreen"
import { AudioScreen } from "./screens/AudioScreen"
import { AstrologersScreen } from "./screens/AstrologersScreen"
import PalmScreen from "./screens/PalmScreen"
import UniverseBackground from "./components/UniverseBackground"
import { PalmIcon } from "./components/PalmArt"
import CosmicScreen from "./screens/CosmicScreen"
import CelestialArt from "./components/CelestialArt"
import WelcomeGate from "./WelcomeGate"
import ReadingOnboarding from "./astro/ReadingOnboarding"
import {
  HomeIcon,
  ZodiacIcon,
  ClockIcon,
  HeadphonesIcon,
  MenuIcon,
  FlameIcon,
  SparkleIcon,
  ArrowRight,
} from "./components/icons"


import { LANGUAGES, t } from "./astro/i18n"

const TABS = [
  { id: "home", navKey: "nav_home", label: "Home", icon: HomeIcon, Screen: HomeScreen },
  { id: "explore", navKey: "nav_signs", label: "Signs", icon: ZodiacIcon, Screen: ExploreScreen },
  { id: "transits", navKey: "nav_chart", label: "Chart", icon: ClockIcon, Screen: TransitsScreen },
  { id: "audio", navKey: "nav_listen", label: "Listen", icon: HeadphonesIcon, Screen: AudioScreen },
  { id: "palm", navKey: "nav_palm", label: "Palm", icon: PalmIcon, Screen: PalmScreen },
] as const

const MENU = [
  {
    group: "Charts",
    items: [
      { key: "item_birth_chart", fallback: "My birth chart" },
      { key: "item_add_profile", fallback: "Add a profile" },
      { key: "item_synastry", fallback: "Synastry & compatibility" },
      { key: "item_group_comp", fallback: "Group compatibility" },
    ],
  },
  {
    group: "Discover",
    items: [
      { key: "item_prashna", fallback: "Prashna Kundali" },
      { key: "item_tarot", fallback: "Tarot & oracle pull" },
      { key: "item_numerology", fallback: "Numerology" },
      { key: "item_guided", fallback: "My guided discovery" },
      { key: "item_dosha", fallback: "Dosha check (Mangal · Kaal Sarp)" },
    ],
  },
  {
    group: "Practice",
    items: [
      { key: "item_daily_rituals", fallback: "Daily rituals" },
      { key: "item_transit_calendar", fallback: "Transit calendar" },
      { key: "item_mantra_timer", fallback: "Mantra timer" },
      { key: "item_panchang_deep", fallback: "Panchang deep dive" },
    ],
  },
  {
    group: "Marketplace",
    items: [
      { key: "item_wallet", fallback: "Wallet & credits" },
    ],
  },
] as const

export default function App() {
  const astro = useAstro()
  const [reportMode, setReportMode] = useState("Birth chart")
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("home")
  const [menu, setMenu] = useState(false)
  const [journey, setJourney] = useState<JourneyState | null>(null)
  const [journeyProfile, setJourneyProfile] = useState<Profile | null>(null)
  const [entry, setEntry] = useState<"welcome" | "app">("welcome")
  const [readingOnboarding, setReadingOnboarding] = useState(false)

  const [overlay, setOverlay] =
    useState<null | "astrologers" | "cards" | "match" | "profile" | "report" | "numerology">(null)
  useEffect(() => {
    astro.setOpeners({ profile: () => setOverlay("profile"), report: (mode = "Birth chart") => { setReportMode(mode); setOverlay("report"); } })
  }, [astro.setOpeners])
  const Active = TABS.find((t) => t.id === tab)!.Screen
  const immersive = overlay === "cards" || overlay === "match"
  const OPENS_ASTROLOGERS = new Set(["Live consultations", "Book a pandit"])

  if (entry === "welcome") {
    if (readingOnboarding) {
      return (
        <ReadingOnboarding
          language={astro.voiceLanguage}
          onBackToLanding={() => setReadingOnboarding(false)}
          onComplete={(savedProfile, chosenFocus) => {
            setReadingOnboarding(false);
            setEntry("app");
            setJourneyProfile(savedProfile);
            setJourney({
              ...emptyJourney,
              profile_id: savedProfile.id,
              language: astro.language,
              focus: chosenFocus,
              step: 2,
            });
          }}
        />
      );
    }
    return (
      <WelcomeGate
        onLogin={async () => {
          await api("/session", { method: "POST" }).catch(() => {});
          setEntry("app");
        }}
        onStartReading={() => {
          setReadingOnboarding(true);
        }}
      />
    );
  }
  if (journey) return <StartupFunnel initial={journey} initialProfile={journeyProfile} onExit={() => { setJourney(null); setJourneyProfile(null); }} />

  return (
    <div className="relative flex h-full w-full justify-center overflow-hidden bg-[#040e0c]">
      {/* ambient desktop backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <Starfield />

        <div className="ambient-zodiac" aria-hidden="true">
          <CelestialArt wheel />
        </div>
      </div>

      {/* App column */}
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-[#071c17] shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:my-0">
        <UniverseBackground />

        {/* Header */}
        <header className={`${immersive ? "hidden" : "flex"} relative z-20 items-center justify-between px-5 pb-3 pt-6`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="grid h-11 w-11 place-items-center rounded-full border border-ember/40 bg-[#15392c] font-serif text-sm text-gold" aria-hidden="true">
                {(astro.profile?.birth.name ?? "Sahil Sahu").split(/\s+/).slice(0, 2).map(part => part[0]).join("")}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-ember text-[8px] text-[#12100c]">
                <SparkleIcon className="h-2.5 w-2.5" />
              </span>
            </div>
            <div>
              <p className="text-[11px] text-ash">{t("greeting", astro.language)}</p>
              <p className="font-serif text-lg leading-tight text-cream">
                {astro.profile?.birth.name ?? "Sahil Sahu"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setJourney({ ...emptyJourney, profile_id: astro.profile?.id ?? null })}
              className="flex items-center gap-1.5 rounded-full border border-ember/40 bg-ember/15 px-2.5 py-1.5 text-xs text-ember hover:bg-ember/25 transition-all shadow-[0_0_12px_rgba(224,140,58,0.2)]"
              aria-label="Open Cosmic Voiceover Guide"
              title="Open Cosmic Voiceover Guide"
            >
              <span className="text-sm">🎙️</span>
              <span className="font-medium text-[11px] hidden sm:inline">Guide</span>
            </button>
            <span className="flex items-center gap-1 rounded-full glass px-2.5 py-1.5 text-xs text-ember-soft">
              <FlameIcon className="h-3.5 w-3.5" /> 12
            </span>
            <button
              onClick={() => setMenu(true)}
              className="grid h-10 w-10 place-items-center rounded-full glass text-cream transition-colors hover:text-ember"
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Screen */}
        <main
          key={`${tab}-${overlay ?? ""}`}
          className={`no-scrollbar relative z-10 flex-1 overflow-y-auto px-5 ${immersive ? "pb-8 pt-6 bg-[#0c0908]/70" : "pb-28 pt-2"}`}
        >
          {overlay === "astrologers" ? (
            <AstrologersScreen onBack={() => setOverlay(null)} />
          ) : overlay === "profile" ? (
            <ProfilePanel onBack={() => setOverlay(null)} />
          ) : overlay === "report" ? (
            <ReportPanel initialMode={reportMode} onBack={() => setOverlay(null)} />
          ) : overlay === "numerology" ? (
            <NumerologyPanel onBack={() => setOverlay(null)} />
          ) : overlay === "cards" || overlay === "match" ? (
            <CosmicScreen mode={overlay} onBack={() => setOverlay(null)} />
          ) : tab === "home" ? (
            <HomeScreen
              onOpenCosmic={setOverlay}
              onOpenGuide={() => setJourney({ ...emptyJourney, profile_id: astro.profile?.id ?? null })}
            />
          ) : (
            <Active />
          )}
        </main>

        {/* Floating pill navbar */}
        <nav className={`${immersive ? "hidden" : "flex"} pointer-events-none absolute inset-x-0 bottom-5 z-30 justify-center`}>
          <div className="cosmic-navbar pointer-events-auto flex items-center gap-1 rounded-full glass-strong p-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            {TABS.map((tTab) => {
              const on = tTab.id === tab
              const translatedLabel = t(tTab.navKey, astro.language)
              return (
                <button
                  key={tTab.id}
                  onClick={() => {
                    setTab(tTab.id)
                    setOverlay(null)
                  }}
                  aria-label={translatedLabel}
                  aria-current={on ? "page" : undefined}
                  className={`nav-option flex h-14 w-12 flex-col items-center justify-center gap-0.5 rounded-full min-[360px]:w-14 ${
                    on
                      ? "nav-option-active bg-gradient-to-b from-ember-soft to-ember text-[#12100c] shadow-[0_8px_22px_rgba(240,145,62,0.42)]"
                      : "text-ash hover:text-cream"
                  }`}
                >
                  <tTab.icon className="nav-option-icon h-6 w-6" />
                  <span className="text-[9px] font-medium">{translatedLabel}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Slide-out menu */}
        {menu && (
          <>
            <div
              className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMenu(false)}
            />
            <aside className="animate-float-in absolute right-0 top-0 z-50 flex h-full w-[82%] max-w-xs flex-col overflow-y-auto bg-gradient-to-b from-[#102f24] to-[#061812] px-5 py-6 shadow-2xl no-scrollbar">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold tracking-wider">
                  <span className="bg-gradient-to-r from-amber-200 via-gold to-ember bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(232,198,127,0.35)]">
                    Dear<span className="font-light italic text-cream">Universe</span>
                  </span>
                </h2>
                <button
                  onClick={() => setMenu(false)}
                  className="text-ash hover:text-cream"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 rounded-2xl glass-strong p-4 border border-white/5">
                <p className="text-xs text-ash">{t("member_tier", astro.language)}</p>
                <p className="font-serif text-cream">
                  {t("member_benefits", astro.language)}
                </p>
                <button className="mt-2 flex items-center gap-1 text-xs text-ember hover:underline">
                  {t("manage_sub", astro.language)} <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {MENU.map((sec) => (
                <div key={sec.group} className="mb-5">
                  <p className="mb-2 text-[11px] uppercase tracking-widest text-ember/80 font-medium">
                    {t(`group_${sec.group.toLowerCase()}`, astro.language)}
                  </p>
                  <div className="space-y-1">
                    {sec.items.map((it) => {
                      const itemLabel = t(it.key, astro.language);
                      const action = it.fallback;
                      return (
                        <button
                          key={it.key}
                          onClick={() => {
                            setMenu(false)
                            if (OPENS_ASTROLOGERS.has(action))
                              setOverlay("astrologers")
                            if (action === "Tarot & oracle pull") setOverlay("cards")
                            if (action === "Add a profile") setOverlay("profile")
                            if (action === "Numerology") setOverlay("numerology")
                            if (action === "My guided discovery")
                              setJourney({
                                ...emptyJourney,
                                language: astro.language === "hi" ? "hi" : "en",
                                profile_id: astro.profile?.id ?? null,
                              })
                            if (action === "My birth chart") {
                              setReportMode("Birth chart")
                              setOverlay("report")
                            }
                            if (action === "Prashna Kundali") {
                              setReportMode("Prashna Kundali")
                              setOverlay("report")
                            }
                            if (action.startsWith("Dosha check")) {
                              setReportMode("Doshas")
                              setOverlay("report")
                            }
                            if (
                              action === "Synastry & compatibility" ||
                              action === "Group compatibility"
                            ) {
                              setReportMode(
                                action === "Group compatibility"
                                  ? "Group compatibility"
                                  : "Compatibility"
                              )
                              setOverlay("report")
                            }
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-cream/85 transition-colors hover:bg-white/5"
                        >
                          <span>{itemLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-ash" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Voice Language & Overall App Language Selectors */}
              <div className="mt-auto border-t border-white/10 pt-4 pb-2">
                <div className="mb-3.5">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-gold font-medium flex items-center gap-1.5">
                    <span>🎙️</span>
                    <span>{astro.language === "hi" ? "आवाज़ की भाषा (Voice Language)" : "Voice Language"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { code: "en" as const, label: "English Voice" },
                      { code: "hi" as const, label: "हिन्दी आवाज़" },
                    ].map((v) => {
                      const isActive = astro.voiceLanguage === v.code;
                      return (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => astro.setVoiceLanguage(v.code)}
                          aria-pressed={isActive}
                          className={`rounded-full px-3 py-1.5 text-xs font-serif transition-all cursor-pointer ${
                            isActive
                              ? "bg-gradient-to-r from-amber-400 via-gold to-amber-500 text-[#091b14] font-semibold shadow-md shadow-gold/30 scale-105"
                              : "border border-white/10 text-ash hover:text-cream hover:border-gold/40 bg-white/5"
                          }`}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="mb-2 text-[10px] uppercase tracking-widest text-ember/80 font-medium flex items-center gap-1.5">
                  <span>🌐</span>
                  <span>{t("select_language", astro.language)}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => {
                    const isActive = astro.language === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => astro.setLanguage(l.code)}
                        aria-pressed={isActive}
                        className={`rounded-full px-3 py-1.5 text-xs font-serif transition-all cursor-pointer ${
                          isActive
                            ? "bg-gradient-to-r from-ember to-amber-600 text-[#12100c] font-semibold shadow-md shadow-ember/30 scale-105"
                            : "border border-white/10 text-ash hover:text-cream hover:border-gold/40 bg-white/5"
                        }`}
                      >
                        {l.label}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-white/10 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setJourney(null);
                      setEntry("welcome");
                    }}
                    className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-serif text-ash hover:text-gold hover:border-gold/30 hover:bg-white/5 transition-all text-center cursor-pointer"
                  >
                    {astro.language === "hi" ? "लॉग आउट / मुख्य लॉगिन पृष्ठ" : "Log out / Return to login"}
                  </button>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
