import { useEffect, useRef, useState } from "react"
import { api, type Profile } from "./api"
import { useAstro } from "./AstroContext"
import ProfilePanel from "./ProfilePanel"
import UniverseBackground from "../components/UniverseBackground"
import { categoryFor } from "./guideCategories"
import UniverseLanding from "./UniverseLanding"
import ReadingOnboarding from "./ReadingOnboarding"
import ParticlePlanet from "./ParticlePlanet"
import useAmbientMusic from "./useAmbientMusic"
import UnlockPreview from "./UnlockPreview"
import { NumberReveal, type Numbers } from "./NumerologyPanel"
import { VedicKundaliChart } from "../components/VedicKundaliChart"
import { discoveryNarration, followupFor } from "./discoveryStory"
import {
  getCategoryInsight,
  HOOKING_ENGAGEMENT_LINES_EN,
  HOOKING_ENGAGEMENT_LINES_HI,
} from "./categoryInsights"
import useGuideVoice from "./useGuideVoice"
import GuideDialog from "./GuideDialog"
import "./journey.css"
import "./immersive-guide.css"
import "./particle-funnel.css"

export type JourneyState = {
  step: number
  completed: boolean
  profile_id: string | null
  language: "en" | "hi"
  focus: "growth" | "career" | "relationships" | "wellbeing" | "marriage" | "business" | "numerology"
  guide_gender?: "female" | "male" | null
  question: string
  context: string
  numerology_name: string
  reflection?: string
  chapter: number
  draft: Record<string, string>
}
export const emptyJourney: JourneyState = {
  step: 0,
  completed: false,
  profile_id: null,
  language: "en",
  focus: "growth",
  question: "",
  context: "",
  numerology_name: "",
  chapter: 0,
  draft: {},
}
type Reading = {
  sections: { id: string; title: string; text: string; fact_ids: string[] }[]
  facts: { id: string; text: string }[]
  source: string
  warnings: string[]
  numbers: Numbers
}
type Message = { role: string; text: string; source?: string }

export default function StartupFunnel({
  initial,
  initialProfile = null,
  onExit,
}: {
  initial: JourneyState
  initialProfile?: Profile | null
  onExit: () => void
}) {
  const astro = useAstro()
  const [state, setState] = useState(() => ({
    ...initial,
    step: Math.min(initial.step, 10),
  }))
  const [reading, setReading] = useState<Reading | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [sound, setSound] = useState(true)
  const [promptOpen, setPromptOpen] = useState(false)
  const [promptReady, setPromptReady] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [onboardingActive, setOnboardingActive] = useState(false)
  const [onboardingCategory, setOnboardingCategory] = useState<JourneyState["focus"] | undefined>(undefined)
  const [justSaved, setJustSaved] = useState<Profile | null>(initialProfile)
  const profile = astro.profiles.find((p) => p.id === state.profile_id) ?? justSaved ?? astro.profile
  const guideGender = state.guide_gender ?? (profile?.birth.gender === "male" ? "male" : "female")
  const categoryInsight = getCategoryInsight(state.focus)
  const voiceLanguage: "en" | "hi" = astro.voiceLanguage === "hi" ? "hi" : "en"
  const voiceHi = voiceLanguage === "hi"
  const uiHi = astro.language === "hi"
  const hi = uiHi
  const promptKey = `${state.step}:${state.chapter}:${state.language}:${guideGender}`
  const [promptOwner, setPromptOwner] = useState("")
  const showPrompt = promptOpen && promptOwner === promptKey
  const voice = useGuideVoice(voiceHi ? "hi" : "en", guideGender)
  const music = useAmbientMusic(voice.playing && !voice.paused, state.step > 0)
  const [extraReflection, setExtraReflection] = useState("")
  const [guideTurn, setGuideTurn] = useState({ key: "", text: "", source: "" })
  const [guideThinking, setGuideThinking] = useState(false)
  const [engagementLineIndex, setEngagementLineIndex] = useState(0)
  useEffect(() => {
    const pool = voiceHi ? HOOKING_ENGAGEMENT_LINES_HI : HOOKING_ENGAGEMENT_LINES_EN
    const interval = setInterval(() => {
      setEngagementLineIndex((prev) => (prev + 1) % pool.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [voiceHi])
  const currentEngagementLine = (voiceHi ? HOOKING_ENGAGEMENT_LINES_HI : HOOKING_ENGAGEMENT_LINES_EN)[
    engagementLineIndex % (voiceHi ? HOOKING_ENGAGEMENT_LINES_HI.length : HOOKING_ENGAGEMENT_LINES_EN.length)
  ]

  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState<number | null>(null)
  const [speechCompleted, setSpeechCompleted] = useState(false)
  const busyVoiceDone = useRef<(() => void) | null>(null)

  useEffect(() => {
    setAutoAdvanceSeconds(null)
    setSpeechCompleted(false)
  }, [state.step])

  useEffect(() => {
    if (state.step !== 7 && state.step !== 8) return
    if (sound && (!speechCompleted || voice.playing)) {
      setAutoAdvanceSeconds(null)
      return
    }

    if (autoAdvanceSeconds === null) {
      setAutoAdvanceSeconds(3)
    }
    const interval = setInterval(() => {
      setAutoAdvanceSeconds((prev) => {
        if (prev === null) return 3
        if (prev <= 1) {
          clearInterval(interval)
          if (state.step === 7) {
            go(8)
          } else if (state.step === 8) {
            go(4)
          }
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [state.step, voice.playing, speechCompleted, sound, autoAdvanceSeconds])

  const turnKey = `${state.step}:${state.focus}:${voiceLanguage}:${guideGender}`
  const heading = useRef<HTMLHeadingElement>(null)
  const scroll = useRef<HTMLElement>(null)
  const saveChain = useRef(Promise.resolve())
  const closing = useRef(false)
  const active = useRef(true)
  const requestId = useRef(0)
  const category = categoryFor(state.focus)
  const chapter = reading?.sections[state.chapter]
  const followup = followupFor(state.focus)
  const hook = voiceHi ? category.hindi : category.english
  const titles = [
    "",
    uiHi ? category.hindi : category.hook,
    uiHi ? "आपके लिए सबसे ज़रूरी क्या है?" : category.question,
    uiHi ? "अपनी बात, अपने शब्दों में।" : "A little more about you.",
    uiHi ? "आपके लिए एक नई दिशा।" : "A little clarity. A next step.",
    chapter?.title ?? (uiHi ? "आपकी रीडिंग" : "Your personal reading"),
    uiHi ? "आइए इसे आपके जीवन से जोड़ें।" : "Let’s make this work for you.",
    uiHi ? "आपका चार्ट तैयार है।" : "Your chart, brought to life.",
    uiHi ? "आपके नाम के अंक।" : "Your name. Your numbers.",
    uiHi ? followup.hi : followup.question,
    uiHi ? "आपका अगला अध्याय" : "Your next chapter",
  ]
  const standardNarration =
    busy && !reading
      ? voiceHi
        ? "आपकी जानकारी और विचारों को जोड़ रहे हैं। आपकी जन्म कुंडली और शुभ अंकों के आधार पर आपकी ताकत और सही दिशा तैयार हो रही है।"
        : "I’m bringing your story and birth details together. We are preparing your Vedic Kundli and sacred numbers to reveal your greatest strengths."
      : state.step === 1
        ? `${hook} ${
            voiceHi
              ? "अपनी जन्म जानकारी जोड़िए। समय याद नहीं है तो अज्ञात चुन सकते हैं।"
              : `${category.promise} Add your birth details when you’re ready. If you don’t know the time, choose unknown.`
          }`
        : state.step === 2
          ? voiceHi
            ? `${category.hindi} इस समय कौन सी बात आपके सबसे करीब है? एक विकल्प चुनें, या अपनी बात आगे लिखें।`
            : `${category.hook} ${category.question} Pick what feels closest. There is no right answer, and you can tell me more in your own words next.`
          : state.step === 3
            ? voiceHi
              ? "क्या चल रहा है, और आप क्या बदलना चाहेंगे? जितना सहज लगे उतना बताइए। चाहें तो बिना कुछ लिखे भी आगे बढ़ सकते हैं।"
              : "What’s happening, and what would you like to feel different? Share as much or as little as you like. You can also continue with the intention you chose."
            : state.step === 7
              ? voiceHi
                ? `${profile?.birth.name ? `${profile.birth.name}, ` : ""}${categoryInsight.kundliSpeechHi}`
                : `${profile?.birth.name ? `${profile.birth.name}, ` : ""}${categoryInsight.kundliSpeechEn}`
            : state.step === 8
              ? voiceHi
                ? `${profile?.birth.name ? `${profile.birth.name}, ` : ""}${categoryInsight.numerologySpeechHi}`
                : `${profile?.birth.name ? `${profile.birth.name}, ` : ""}${categoryInsight.numerologySpeechEn}`
            : state.step === 4
              ? voiceHi
                ? categoryInsight.issuesSpeechHi
                : categoryInsight.issuesSpeechEn
              : state.step === 5
                ? (chapter?.text ?? "")
                : state.step === 6
                  ? voiceHi
                    ? "किस बात पर और स्पष्टता चाहिए? अपनी परिस्थिति के बारे में पूछिए, या एक छोटा कदम बनाने में मदद लीजिए।"
                    : "Which part would you like to explore? We can think through a conversation, weigh two options, or turn an insight into a small plan."
                  : ""
  const discovery = !busy ? discoveryNarration(state.step, profile, reading?.numbers, voiceHi, state.focus) : null
  const narration = busy
    ? standardNarration
    : discovery ?? ((state.step === 2 || state.step === 3) && guideTurn.key === turnKey && guideTurn.text ? guideTurn.text : standardNarration)
  const ordinal = ({ 1: 3, 2: 1, 3: 2, 7: 4, 8: 5, 4: 6, 5: 7, 9: 8, 10: 9, 6: 9 } as Record<number, number>)[state.step] ?? 0
  const requestBody = {
    profile_id: profile?.id,
    birth: profile?.birth,
    language: voiceLanguage,
    focus: state.focus,
    question: state.question,
    context: state.context,
    numerology_name: state.numerology_name,
    reflection: state.reflection ?? "",
  }

  function persist(next: JourneyState) {
    saveChain.current = saveChain.current
      .catch(() => {})
      .then(async () => {
        await api("/journey", { method: "PUT", body: JSON.stringify(next) })
        if (active.current) setSaveError("")
      })
    return saveChain.current
  }
  useEffect(() => {
    active.current = true
    voice.unlock()
    music.start()
    return () => {
      active.current = false
      requestId.current++
    }
  }, [])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!closing.current)
        void persist(state).catch(() => {
          if (active.current)
            setSaveError(
              "Your progress hasn’t saved yet. Check the connection and retry.",
            )
        })
    }, 600)
    return () => clearTimeout(timer)
  }, [state])
  function revealPrompt() {
    if (!active.current || closing.current) return
    setPromptReady(true)
    setPromptOwner(promptKey)
    setPromptOpen(true)
  }
  useEffect(() => {
    let cancelled = false
    if (state.step === 4) {
      revealPrompt()
    } else {
      setPromptOpen(false)
      setPromptReady(false)
    }
    voice.stop()
    if (state.step === 0) return
    voice.unlock()
    const textToSpeak = narration || standardNarration
    const complete = () => {
      if (!cancelled) {
        if (busy) {
          const resolver = busyVoiceDone.current
          busyVoiceDone.current = null
          resolver?.()
        } else {
          setSpeechCompleted(true)
          revealPrompt()
        }
      }
    }
    if (sound && textToSpeak) void voice.speak(textToSpeak, complete)
    else {
      if (busy) {
        const resolver = busyVoiceDone.current
        busyVoiceDone.current = null
        resolver?.()
      } else if (!busy) {
        setSpeechCompleted(true)
        complete()
      }
    }
    return () => { cancelled = true; voice.stop() }
  }, [state.step, state.chapter, state.language, astro.voiceLanguage, sound, busy && !reading, chapter?.text, guideGender])
  useEffect(() => {
    if (promptOpen && !controlsOpen) {
      heading.current?.focus({ preventScroll: true })
      scroll.current?.scrollTo({ top: 0 })
    }
  }, [promptOpen, controlsOpen])

  useEffect(() => {
    if (state.step !== 2 && state.step !== 3) { setGuideThinking(false); return }
    const controller = new AbortController()
    setGuideThinking(true)
    api<{ text: string; source: string }>("/journey/guide", {
      method: "POST", signal: controller.signal,
      body: JSON.stringify({ focus: state.focus, language: voiceLanguage, gender: guideGender,
        stage: state.step === 2 ? "welcome" : "context", intention: state.question }),
    }).then((turn) => {
      if (!controller.signal.aborted) setGuideTurn({ ...turn, key: turnKey })
    }).catch(() => {
      if (!controller.signal.aborted) setGuideTurn({ key: turnKey, text: standardNarration, source: "template" })
    }).finally(() => { if (!controller.signal.aborted) setGuideThinking(false) })
    return () => controller.abort()
  }, [turnKey])

  async function loadReading(target = 7, selectedProfile: Profile | null = profile, overrides: { reflection?: string } = {}) {
    if (!selectedProfile) {
      go(1)
      return
    }
    const ticket = ++requestId.current
    setBusy(true)
    setPromptOpen(false)
    setReading(null)
    setError("")

    // Allow the transitional speech ("I’m bringing your story and birth details together...") to complete in the funnel
    const speechPromise = new Promise<void>((resolve) => {
      busyVoiceDone.current = resolve
      setTimeout(resolve, sound ? 25000 : 3000)
    })

    try {
      const [result] = await Promise.all([
        api<Reading>("/journey/reading", {
          method: "POST",
          body: JSON.stringify({ ...requestBody, ...overrides, profile_id: selectedProfile.id }),
        }),
        speechPromise,
      ])
      if (!active.current || ticket !== requestId.current) return
      setReading(result)
      setState((s) => ({
        ...s,
        step: target,
        profile_id: selectedProfile.id,
        chapter: Math.min(s.chapter, result.sections.length - 1),
      }))
    } catch (e) {
      if (active.current && ticket === requestId.current) {
        setError((e as Error).message)
        revealPrompt()
      }
    } finally {
      if (active.current && ticket === requestId.current) setBusy(false)
    }
  }
  useEffect(() => {
    if (initial.step >= 4 && profile)
      void loadReading(Math.min(initial.step, 10))
  }, [])
  useEffect(() => {
    if (!profile) return
    let alive = true
    api<Message[]>(
      `/journey/chat?profile_id=${encodeURIComponent(profile.id)}&focus=${state.focus}`,
    )
      .then((rows) => {
        if (alive) setMessages(rows)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [profile?.id, state.focus])
  function go(step: number) {
    if (busy) return
    voice.stop()
    setError("")
    setState((s) => ({ ...s, step }))
  }
  function changeLanguage() {
    voice.stop()
    if (state.step >= 4) setReading(null)
    setState((s) => ({
      ...s,
      language: hi ? "en" : "hi",
      step: s.step >= 4 ? 3 : s.step,
      chapter: 0,
    }))
  }
  function selectCategory(focus: JourneyState["focus"]) {
    voice.stop()
    void voice.unlock()
    music.start()
    setState((s) => ({ ...s, step: 2, focus, question: "", context: "", reflection: "", chapter: 0 }))
    setReading(null)
    setMessages([])
    setSound(true)
  }

  async function finish() {
    if (busy) return
    closing.current = true
    voice.stop()
    setBusy(true)
    setError("")
    try {
      await persist({
        ...state,
        completed: true,
        profile_id: profile?.id ?? null,
      })
      onExit()
    } catch (e) {
      closing.current = false
      setError((e as Error).message)
    } finally {
      if (active.current) setBusy(false)
    }
  }
  async function send(question = message.trim()) {
    if (!question || !profile || busy) return
    voice.stop()
    setBusy(true)
    setError("")
    setMessage("")
    setPromptOpen(false)
    setPromptReady(false)
    setMessages((rows) => [...rows, { role: "user", text: question }])
    try {
      const reply = await api<Message>("/journey/chat", {
        method: "POST",
        body: JSON.stringify({ ...requestBody, message: question }),
      })
      if (!active.current) return
      setMessages((rows) => [...rows, { ...reply, role: "assistant" }])
      if (sound) void voice.speak(reply.text, revealPrompt)
      else revealPrompt()
    } catch (e) {
      setError((e as Error).message)
      setMessage(question)
      revealPrompt()
      setMessages((rows) => rows.slice(0, -1))
    } finally {
      if (active.current) setBusy(false)
    }
  }

  const handleExit = () => {
    closing.current = true
    active.current = false
    requestId.current++
    voice.stop()
    void persist({ ...state, completed: true }).catch(() => {})
    onExit()
  }
  const playback = () => {
    void voice.unlock()
    music.start()
    setControlsOpen(false)
    if (voice.playing) voice.pause()
    else {
      setPromptOpen(false)
      setPromptReady(false)
      if (!sound) setSound(true)
      else void voice.speak(narration, revealPrompt)
    }
  }
  const openControls = () => {
    if (voice.playing && !voice.paused) voice.pause()
    setControlsOpen(true)
  }
  const closeControls = () => {
    setControlsOpen(false)
    if (voice.playing && voice.paused) voice.pause()
  }
  const back = () => {
    setControlsOpen(false)
    if (state.step === 5 && state.chapter > 0) setState(s => ({ ...s, chapter: s.chapter - 1 }))
    else go(({ 1: 3, 2: 0, 3: 2, 7: 1, 8: 7, 4: 8, 5: 4, 9: 5, 10: 5, 6: 5 } as Record<number, number>)[state.step] ?? 0)
  }

  if (state.step === 0) {
    if (onboardingActive) {
      return (
        <ReadingOnboarding
          language={state.language}
          initialCategory={onboardingCategory}
          onBackToLanding={() => setOnboardingActive(false)}
          onComplete={(savedProfile, chosenFocus) => {
            setJustSaved(savedProfile)
            setOnboardingActive(false)
            selectCategory(chosenFocus)
          }}
        />
      )
    }
    return (
      <UniverseLanding
        language={state.language}
        onLanguage={changeLanguage}
        onSelectLanguage={(l) => setState((s) => ({ ...s, language: l }))}
        onStartReading={(cat) => {
          setOnboardingCategory(cat)
          setOnboardingActive(true)
        }}
        onCategory={(cat) => {
          setOnboardingCategory(cat)
          setOnboardingActive(true)
        }}
        onExplore={handleExit}
      />
    )
  }

  return (
    <div className="journey-shell immersive-guide" data-phase={voice.playing ? voice.paused ? "paused" : "speaking" : busy || guideThinking || voice.loading ? "preparing" : promptReady ? "question" : "idle"}>
      <UniverseBackground />
      <ParticlePlanet motion={voice.motion} quiet={state.step === 7 || state.step === 8} />
      {busy && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5 pointer-events-auto max-w-md w-full px-4 text-center">
          <div className="preparing-story !static" role="status">
            <i />
            <span>{hi ? "आपकी जानकारी से रीडिंग तैयार कर रहे हैं…" : "Bringing your birth details and your story together…"}</span>
          </div>
          <p className="text-xs text-amber-200/90 font-serif italic bg-black/65 px-4 py-2 rounded-full border border-gold/30 backdrop-blur-sm shadow-md">
            {voiceHi
              ? "आपकी जन्म कुंडली और शुभ अंकों के आधार पर आपकी ताकत और सही दिशा तैयार हो रही है..."
              : "Preparing your Vedic Kundli and sacred numbers to reveal your greatest strengths..."}
          </p>
          <button
            type="button"
            onClick={() => {
              voice.stop();
              const resolver = busyVoiceDone.current;
              busyVoiceDone.current = null;
              resolver?.();
            }}
            className="px-4 py-1.5 rounded-full border border-gold/40 bg-black/50 text-[11px] text-cream/90 hover:text-white hover:bg-gold/20 transition-all cursor-pointer shadow-sm"
          >
            {hi ? "सीधे कुंडली देखें ⚡" : "View Kundli Now ⚡"}
          </button>
        </div>
      )}
      {!busy && (
        <div className="planet-hint-bar z-20 pointer-events-none px-4 py-1.5 flex items-center justify-center gap-2 text-center max-w-xl mx-auto absolute bottom-[6%] left-0 right-0">
          <span className="text-gold/70 text-[11px] animate-pulse">✧</span>
          <p className="planet-hint !static !m-0 !tracking-wide !text-[11px] sm:!text-xs text-[#ebd8b0] font-serif italic transition-all duration-700">
            {currentEngagementLine}
          </p>
          <span className="text-gold/70 text-[11px] animate-pulse">✧</span>
        </div>
      )}
      <button className="guide-stage-control" aria-label="Guide controls" onClick={openControls} />
      {!showPrompt && !busy && ![7, 8].includes(state.step) && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-auto">
          {voice.playing && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 border border-gold/40 text-xs text-[#f5d89f] font-serif shadow-md backdrop-blur-md">
              <span className="w-1 h-3 rounded-full bg-gold animate-pulse" />
              <span className="w-1 h-4 rounded-full bg-amber-300 animate-pulse" />
              <span className="w-1 h-3 rounded-full bg-gold animate-pulse" />
              <span className="ml-1">{hi ? "मार्गदर्शिका बोल रही है..." : "Guide speaking..."}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              voice.stop();
              revealPrompt();
            }}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-amber-400 via-gold to-amber-500 text-[#091b14] font-serif font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(240,145,62,0.45)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <span>{hi ? "विकल्प देखें ✦" : "Answer Now ✦"}</span>
          </button>
        </div>
      )}
      {(state.step === 7 || state.step === 8) && reading && profile && (
        <article className="discovery-screen max-w-xl mx-auto">
          <p className="journey-eyebrow">
            {hi ? "आपकी जन्म जानकारी से" : "CALCULATED FROM YOUR DETAILS"}
          </p>
          <h2>
            {state.step === 7
              ? `${profile.birth.name} · ${hi ? "जन्म कुंडली" : "Birth Kundli"}`
              : hi
                ? "आपके नाम एवं जन्म के अंक"
                : "Your Sacred Numbers"}
          </h2>

          {state.step === 7 ? (
            <>
              <VedicKundaliChart chart={profile.charts.vedic} compact />
              <div className="my-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[11px] font-sans">
                <span>✦</span>
                <span>
                  {hi
                    ? "आपके जन्म ग्रह आपकी आंतरिक शक्ति और अवसरों को सक्रिय कर रहे हैं"
                    : "Cosmic planetary alignments actively guiding your unique strengths"}
                </span>
              </div>

              {/* Kundli Category Benefits */}
              <div
                className="mt-2 p-3.5 sm:p-4 rounded-2xl bg-[#092218]/95 border border-gold/40 text-left shadow-lg space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-gold/20 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">✨</span>
                    <h3 className="font-serif text-xs sm:text-sm font-semibold text-gold tracking-wide uppercase">
                      {categoryInsight.kundliTitle}
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Vedic Kundli
                  </span>
                </div>

                <p className="font-sans text-xs text-cream/90 leading-relaxed">
                  {categoryInsight.kundliDescription}
                </p>

                {/* 3 Concrete Benefits Cards */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {categoryInsight.kundliBenefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-gold/30 transition-all text-left space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-xs font-semibold text-amber-200">
                          {b.title}
                        </h4>
                        <span className="text-[9px] font-sans font-medium px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/25">
                          {b.highlight}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-cream/80 leading-normal">
                        {b.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-1.5 border-t border-white/10 flex items-center gap-2 text-[11px] text-amber-200/90 font-serif italic">
                  <span>✦</span>
                  <span>{categoryInsight.kundliHook}</span>
                </div>
              </div>

              {/* Automatic transition countdown with an optional immediate skip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 rounded-xl bg-black/60 border border-gold/30 mt-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs text-amber-200">
                  {voice.playing ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-gold animate-ping shrink-0" />
                      <span>{hi ? "मार्गदर्शिका आपकी कुंडली के लाभ समझा रही है..." : "Guide is explaining your Kundli benefits..."}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span>
                        {hi
                          ? `अंक विज्ञान पर स्वतः जा रहे हैं... (${autoAdvanceSeconds ?? 3}s)`
                          : `Auto-advancing to Numerology in ${autoAdvanceSeconds ?? 3}s...`}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      voice.stop();
                      go(8);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-gold text-[#091b14] font-serif font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    {hi ? "तुरंत अंक देखें ⚡" : "Explore Numbers Now ⚡"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <NumberReveal data={reading.numbers} compact={true} />

              {/* Numerology Category Benefits */}
              <div
                className="mt-2 p-3.5 sm:p-4 rounded-2xl bg-[#092218]/95 border border-gold/40 text-left shadow-lg space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-gold/20 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">🔢</span>
                    <h3 className="font-serif text-xs sm:text-sm font-semibold text-gold tracking-wide uppercase">
                      {categoryInsight.numerologyTitle}
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Sacred Numbers
                  </span>
                </div>

                <p className="font-sans text-xs text-cream/90 leading-relaxed">
                  {categoryInsight.numerologyDescription}
                </p>

                {/* 3 Concrete Benefits Cards */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {categoryInsight.numerologyBenefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-gold/30 transition-all text-left space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-xs font-semibold text-amber-200">
                          {b.title}
                        </h4>
                        <span className="text-[9px] font-sans font-medium px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25">
                          {b.highlight}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-cream/80 leading-normal">
                        {b.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-1.5 border-t border-white/10 flex items-center gap-2 text-[11px] text-amber-200/90 font-serif italic">
                  <span>✦</span>
                  <span>{categoryInsight.numerologyHook}</span>
                </div>
              </div>

              {/* Automatic transition countdown with an optional immediate skip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 rounded-xl bg-black/60 border border-gold/30 mt-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs text-amber-200">
                  {voice.playing ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-gold animate-ping shrink-0" />
                      <span>{hi ? "मार्गदर्शिका आपके अंकों के लाभ समझा रही है..." : "Guide is explaining your Numerology benefits..."}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span>
                        {hi
                          ? `आपकी समाधान रिपोर्ट पर स्वतः जा रहे हैं... (${autoAdvanceSeconds ?? 3}s)`
                          : `Auto-advancing to Full Report in ${autoAdvanceSeconds ?? 3}s...`}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      voice.stop();
                      go(4);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-gold text-[#091b14] font-serif font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    {hi ? "तुरंत रिपोर्ट देखें ⚡" : "View Full Report Now ⚡"}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="discovery-controls mt-4">
            <button onClick={openControls}>Voice & music</button>
            <button
              onClick={() => {
                voice.stop();
                go(state.step === 7 ? 8 : 4);
              }}
            >
              {state.step === 7
                ? hi
                  ? "अंक देखें →"
                  : "Continue to Numerology →"
                : hi
                  ? "समाधान देखें →"
                  : "Continue to Key Solutions →"}
            </button>
          </div>
        </article>
      )}
      <UnlockPreview open={state.step === 10 && showPrompt && !controlsOpen} report={category.report} onEnterApp={() => void finish()} externalError={error || saveError} onBack={() => go(5)} />
      <GuideDialog open={state.step !== 10 && ![7, 8].includes(state.step) && showPrompt && !controlsOpen} onDismiss={() => setPromptOpen(false)} titleId="guide-question-title">
        <div className="guide-dialog-header"><p className="journey-eyebrow">{hi ? "अब आपकी बारी" : "Your turn"} · {ordinal} / 9</p><button aria-label="Return to guide" onClick={() => setPromptOpen(false)}>×</button></div>
        <main ref={scroll}>
          <section
            className="journey-content"
            key={`${state.step}-${state.chapter}`}
          >
            <h1 id="guide-question-title" ref={heading} tabIndex={-1}>
              {titles[state.step]}
            </h1>
            {state.step === 1 && (
              <p className="journey-intro">
                {hi
                  ? "थोड़ी स्पष्टता। अपनी पसंद। एक आसान अगला कदम।"
                  : category.promise}
              </p>
            )}
            {(!sound || voice.status.toLowerCase().includes("unavailable")) && <p className="guide-caption">{voice.caption || narration}</p>}
            <details><summary>{hi ? "पूरी बात पढ़ें" : "Read the full transcript"}</summary><p>{voice.caption || narration}</p></details>
            {state.step === 1 && (
              <>
                {profile && !editingProfile ? (
                  <div className="journey-saved">
                    <p>{profile.birth.name}</p>
                    <small>
                      {profile.birth.birth_date} · {profile.place.name}
                    </small>
                    <button
                      className="journey-primary"
                      onClick={() => void loadReading(7, profile)}
                    >
                      {hi ? "इन विवरणों के साथ आगे बढ़ें" : "Use these birth details"}{" "}
                      →
                    </button>
                    <button
                      className="journey-link"
                      onClick={() => setEditingProfile(true)}
                    >
                      Use different details
                    </button>
                  </div>
                ) : (
                  <ProfilePanel guided language={state.language} onQuestion={text => { setPromptOpen(false); if (sound) void voice.speak(text, revealPrompt); else revealPrompt() }}
                    draft={state.draft}
                    onDraft={(draft) => setState((s) => ({ ...s, draft }))}
                    onSaved={(saved) => {
                      setJustSaved(saved)
                      setEditingProfile(false)
                      setState((s) => ({
                        ...s,
                        profile_id: saved.id,
                        guide_gender: saved.birth.gender === "male" ? "male" : saved.birth.gender === "female" ? "female" : s.guide_gender,
                        draft: {},
                      }))
                      void loadReading(7, saved)
                    }}
                    onBack={() => (profile ? setEditingProfile(false) : go(3))}
                  />
                )}
              </>
            )}
            {state.step === 2 && (
              <>
                <div className="intention-options">
                  {category.choices.map((choice, i) => (
                    <button
                      key={choice}
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          question: hi ? category.hiChoices[i] : choice,
                          step: 3,
                        }))
                      }
                    >
                      <span>{hi ? category.hiChoices[i] : choice}</span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  ))}
                </div>
                <button className="journey-link" onClick={() => go(3)}>
                  {hi ? "अपनी बात खुद लिखूँ" : "I’ll put it in my own words"} →
                </button>
              </>
            )}
            {state.step === 3 && (
              <form
                className="journey-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  void loadReading(7)
                }}
              >
                {state.focus === "numerology" && <label>{hi ? "नाम की सही स्पेलिंग" : "Exact name spelling"}<input maxLength={80} value={state.numerology_name} onChange={e => setState(s => ({ ...s, numerology_name: e.target.value }))} placeholder="The name you use, or are considering" disabled={busy} /></label>}
                <label>
                  {hi ? "अभी आपके मन में क्या है?" : "What is on your mind?"}
                  <input
                    maxLength={500}
                    value={state.question}
                    onChange={(e) =>
                      setState((s) => ({ ...s, question: e.target.value }))
                    }
                    placeholder={hi ? "आप क्या बदलना चाहेंगे?" : category.question}
                    disabled={busy}
                  />
                </label>
                <label>
                  {hi
                    ? "थोड़ा संदर्भ (वैकल्पिक)"
                    : "A little context, in your own words (optional)"}
                  <textarea
                    maxLength={500}
                    value={state.context}
                    onChange={(e) =>
                      setState((s) => ({ ...s, context: e.target.value }))
                    }
                    placeholder={
                      hi
                        ? "क्या चल रहा है, क्या आसान हो सकता है…"
                        : "What’s happening, what you’ve tried, what you’d like to feel…"
                    }
                    disabled={busy}
                  />
                </label>
                <p className="journey-caption">
                  {hi
                    ? "जितना सहज लगे उतना साझा करें।"
                    : "Just what feels comfortable. Your own words make this more personal."}
                </p>
                <button className="journey-primary" disabled={busy}>
                  {busy
                    ? "Bringing your reading together…"
                    : hi
                      ? "मेरी रीडिंग तैयार करें"
                      : "Reveal my reading"}{" "}
                  ✧
                </button>
              </form>
            )}
            {(state.step === 7 || state.step === 8) && reading && <button className="journey-primary" onClick={() => go(state.step === 7 ? 8 : 4)}>{state.step === 7 ? (hi ? "मेरे नाम के अंक देखें" : "Reveal my numbers") : (hi ? "मेरी रीडिंग शुरू करें" : "Connect this to my reading")} →</button>}
            {state.step === 9 && <>
              <label className="journey-form">{hi ? "कुछ और बताना चाहेंगे?" : "Anything else you would like me to understand?"}<textarea className="reflection-extra" maxLength={300} value={extraReflection} onChange={e=>setExtraReflection(e.target.value)} placeholder="A little more, in your own words (optional)" /></label>
              <div className="intention-options">{(hi?followup.hiChoices:followup.choices).map(choice=><button key={choice} onClick={()=>{
                const reflection = `${choice}${extraReflection ? `. ${extraReflection}` : ""}`.slice(0,500)
                setState(s=>({...s,reflection,chapter:2}))
                void loadReading(5,profile,{reflection})
              }}>{choice} ↗</button>)}</div>
              <button className="journey-link" onClick={()=>{
                const reflection=extraReflection.trim()
                setState(s=>({...s,chapter:2,reflection:reflection || s.reflection}))
                if(reflection) void loadReading(5,profile,{reflection}); else go(5)
              }}>{extraReflection.trim() ? "Continue with my words" : "Continue with what I’ve shared"} →</button>
            </>}
            {state.step === 4 && reading && (
              <>
                {/* Celebratory Personalized Report Ready Banner */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-gold/15 to-emerald-500/20 border border-gold/40 text-center shadow-lg space-y-1.5 my-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/30">
                    <span>✧</span>
                    <span>{hi ? "व्यक्तिगत रिपोर्ट तैयार" : "Personalized Report Ready"}</span>
                    <span>✧</span>
                  </div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-cream tracking-wide">
                    {hi
                      ? `आपकी ${categoryInsight.category} ज्योतिषीय रिपोर्ट तैयार है`
                      : `Your Personalized ${categoryInsight.category} Report Is Ready`}
                  </h3>
                  <p className="font-sans text-[11px] text-cream/80 max-w-md mx-auto leading-relaxed">
                    {hi
                      ? "आपकी कुंडली के सकारात्मक ग्रह और मूलांक के शुभ तालमेल के आधार पर तैयार किए गए समाधान।"
                      : "Synthesized from your unique birth chart alignments and sacred numerological vibrations."}
                  </p>

                  <div className="pt-2 flex items-center justify-center gap-2">
                    {voice.playing ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-xs text-[#f5d89f] font-serif shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                        <span>{hi ? "मार्गदर्शिका संक्षेप में समाधान समझा रही है..." : "Guide is briefly explaining your key solutions..."}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          voice.stop();
                          const speech = hi ? categoryInsight.issuesSpeechHi : categoryInsight.issuesSpeechEn;
                          void voice.speak(speech);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-gold/40 bg-black/40 text-[11px] text-amber-200 hover:text-white hover:bg-gold/20 transition-all cursor-pointer shadow-sm"
                      >
                        <span>↻</span>
                        <span>{hi ? "समाधान फिर से सुनें" : "Replay Solutions Voiceover"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3 Key Challenges & Practical Solutions Grounded in Kundli & Numbers */}
                <div className="category-issues-panel my-4 space-y-3 text-left">
                  <div className="flex items-center justify-between px-1 pb-1.5 border-b border-gold/30">
                    <span className="text-xs text-gold font-serif tracking-wider uppercase font-semibold">
                      ✦ Key Challenges &amp; Cosmic Solutions
                    </span>
                    <span className="text-[10px] text-ash font-sans">
                      Grounded in your Kundli &amp; Numbers
                    </span>
                  </div>

                  {categoryInsight.issues.map((item, idx) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#0e2d23]/90 to-[#061812]/95 p-3.5 shadow-md space-y-2 hover:border-gold/40 transition-all text-left cursor-pointer"
                      onClick={() => {
                        if (sound) {
                          voice.stop();
                          const text = hi
                            ? `${item.title}। समस्या: ${item.issue}। समाधान: ${item.solution}`
                            : `${item.title}. Issue: ${item.issue}. Cosmic solution: ${item.solution}`;
                          void voice.speak(text);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold tracking-wide uppercase">
                          Issue {idx + 1}
                        </span>
                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-cream leading-tight">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-ash leading-relaxed font-sans pl-1">
                        {item.issue}
                      </p>
                      <div className="rounded-xl bg-gold/10 border border-gold/30 p-2.5 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-gold font-serif font-medium text-[10px] uppercase tracking-wider">
                          <span>✧</span>
                          <span>Cosmic Solution ({item.cosmicAnchor})</span>
                        </div>
                        <p className="text-cream/95 leading-relaxed font-sans font-normal">
                          {item.solution}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="reading-roadmap">
                  {(hi
                    ? [
                        "आपके लिए क्या ज़रूरी है",
                        "क्या मदद कर सकता है",
                        "कहाँ ध्यान दें",
                        "आपका अगला कदम",
                      ]
                    : [
                        "What matters to you",
                        "What could help",
                        "What to watch for",
                        "Your next small step",
                      ]
                  ).map((text, i) => (
                    <div key={text}>
                      <span>0{i + 1}</span>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
                <button
                  className="journey-primary"
                  onClick={() =>
                    setState((s) => ({ ...s, step: 5, chapter: 0 }))
                  }
                >
                  {hi ? "मेरी रीडिंग सुनें" : "Begin my reading"} →
                </button>
              </>
            )}
            {state.step === 5 && reading && chapter && (
              <>
                <p className="journey-source">
                  Personalized Vedic &amp; Numerology Guidance
                </p>
                <details className="journey-evidence">
                  <summary>
                    {hi ? "रीडिंग का आधार" : "About this reading"}
                  </summary>
                  <p>
                    Astrology is a reflective tradition. Your choices and lived
                    experience come first.
                  </p>
                  {chapter.fact_ids.map((id) => (
                    <p key={id}>
                      {reading.facts.find((f) => f.id === id)?.text}
                    </p>
                  ))}
                  {reading.warnings.map((w) => (
                    <p key={w}>{w}</p>
                  ))}
                </details>
                <button
                  className="journey-primary"
                  onClick={() =>
                    state.chapter === 0 ? setState((s) => ({ ...s, chapter: 1 })) : state.chapter === 1 ? go(9) : go(10)
                  }
                >
                  {state.chapter === 0 ? (hi ? "अगला अध्याय" : "Unfold the next chapter") : state.chapter === 1 ? (hi ? "मेरी बात जोड़ें" : "Make this more personal") : (hi ? "मेरी पूरी रीडिंग देखें" : "Explore my complete reading")} {" "}
                  →
                </button>
              </>
            )}
            {state.step >= 4 && !reading && !busy && (
              <button
                className="journey-primary"
                onClick={() => void loadReading(state.step)}
              >
                Load my reading
              </button>
            )}
            {state.step === 6 && (
              <>
                <div className="chat-suggestions">
                  {(hi
                    ? [
                        "इस हफ्ते का छोटा कदम?",
                        "फायदे और नुकसान समझाएँ",
                        "बात कैसे शुरू करूँ?",
                      ]
                    : [
                        "One step for this week?",
                        "Help me weigh the pros and cons",
                        "How can I start the conversation?",
                      ]
                  ).map((q) => (
                    <button
                      key={q}
                      disabled={busy || !profile}
                      onClick={() => void send(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="journey-chat" aria-live="polite">
                  {messages.map((m, i) => (
                    <article
                      key={i}
                      className={m.role === "user" ? "from-user" : ""}
                    >
                      <small>
                        {m.role === "user" ? "You" : "Your guide"}
                      </small>
                      <p>{m.text}</p>
                    </article>
                  ))}
                </div>
                <form
                  className="journey-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void send()
                  }}
                >
                  <label>
                    {hi ? "आपका सवाल" : "Your question"}
                    <textarea
                      required
                      maxLength={800}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        hi
                          ? "किस बात पर और स्पष्टता चाहिए?"
                          : "What would you like a little more clarity on?"
                      }
                      disabled={busy}
                    />
                  </label>
                  <button
                    className="journey-primary"
                    disabled={busy || !message.trim() || !profile}
                  >
                    {busy
                      ? "Your guide is reflecting…"
                      : hi
                        ? "मेरी मार्गदर्शिका से पूछें"
                        : "Ask my guide"}{" "}
                    ✧
                  </button>
                </form>
                <button
                  className="journey-primary journey-enter"
                  disabled={busy}
                  onClick={() => void finish()}
                >
                  {hi ? "DearUniverse में प्रवेश करें" : "Enter DearUniverse"} →
                </button>
              </>
            )}
            {error && (
              <p role="alert" className="journey-error">
                {error}
              </p>
            )}
            {saveError && (
              <div role="status" className="journey-error">
                {saveError}
                <button
                  className="journey-link"
                  onClick={() => void persist(state).catch(() => {})}
                >
                  Retry save
                </button>
              </div>
            )}
            {busy && (
              <p role="status" className="journey-caption">
                {hi ? "आपकी बातों को जोड़ रहे हैं…" : "Making room for your story…"}
              </p>
            )}
          </section>
        </main>
        <div className="guide-dialog-actions"><button disabled={busy} onClick={back}>← {hi ? "वापस" : "Back"}</button><button disabled={busy} onClick={playback}>{hi ? "फिर सुनें" : "Listen again"}</button><button onClick={openControls}>{hi ? "विकल्प" : "Options"}</button></div>
        {voice.status.toLowerCase().includes("unavailable") && <p role="status" className="journey-caption">{voice.status}</p>}
      </GuideDialog>
      <GuideDialog open={controlsOpen} onDismiss={closeControls} titleId="guide-controls-title" className="guide-options">
        <div className="guide-dialog-header"><h2 id="guide-controls-title">{hi ? "आपकी बातचीत" : "Your conversation"}</h2><button aria-label="Return to conversation" onClick={closeControls}>×</button></div>
        <p>{hi ? "आपकी व्यक्तिगत आवाज़" : "Your personal voice guide"} · {category.report}</p>
        {promptReady && <button className="journey-primary" onClick={() => { setControlsOpen(false); setPromptOpen(true) }}>{hi ? "सवाल पर लौटें" : "Answer the question"} →</button>}
        <div className="guide-options-grid">
          <button onClick={playback} disabled={voice.loading || guideThinking}>{voice.playing ? voice.paused ? "Resume guide" : "Pause guide" : "Listen to guide"}</button>
          <button aria-pressed={sound} onClick={() => { setSound(!sound); setControlsOpen(false) }}>{sound ? "Voice on" : "Voice off"}</button>
          <button onClick={changeLanguage} disabled={busy} aria-label="Change language">{hi ? "English" : "हिन्दी"}</button>
          <button onClick={back} disabled={busy}>← Back</button>
        </div>
        <div className="guide-options-grid">
          <button onClick={() => { voice.stop(); setState(s => ({ ...s, guide_gender: "female" })); setControlsOpen(false) }} aria-pressed={guideGender === "female"}>Warm female voice</button>
          <button onClick={() => { voice.stop(); setState(s => ({ ...s, guide_gender: "male" })); setControlsOpen(false) }} aria-pressed={guideGender === "male"}>Warm male voice</button>
        </div>
        <button className="music-toggle" aria-pressed={music.enabled} onClick={music.toggle}>{music.enabled ? "Ambient music on" : "Ambient music off"}</button>
        <details className="guide-settings"><summary>Voice & listening speed</summary><div>
          <label>Voice style<select aria-label="Voice style" value={voice.mode} onChange={e => voice.setMode(e.target.value as "natural" | "device")}><option value="natural">Natural voice</option><option value="device">Device voice</option></select></label>
          <label>Speed<select aria-label="Listening speed" value={voice.rate} onChange={e => voice.setRate(Number(e.target.value))}>{[0.8,0.96,1,1.15].map(rate => <option key={rate} value={rate}>{rate}×</option>)}</select></label>
          {voice.mode === "device" && <label>Device voice<select aria-label="Guide voice" value={voice.selected} onChange={e => voice.setSelected(e.target.value)}>{!voice.voices.length && <option value="">Unavailable</option>}{voice.voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}</select></label>}
        </div></details>
        <details><summary>Read along</summary><p className="guide-caption">{voice.caption || narration}</p></details>
        <p role="status">{busy ? "Bringing your reading together…" : voice.status}</p>
        <div className="guide-dialog-actions"><button onClick={handleExit} aria-label="Close guide">Close guide</button><button disabled={busy} onClick={() => void finish()}>Enter app ↗</button></div>
      </GuideDialog>
    </div>
  )
}
