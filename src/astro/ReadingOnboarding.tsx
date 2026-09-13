import { useState, useEffect } from "react";
import { api, type Profile } from "./api";
import { useAstro } from "./AstroContext";
import CategoryArt, { guideCategories } from "./guideCategories";
import UniverseBackground from "../components/UniverseBackground";
import type { JourneyState } from "./StartupFunnel";
import useGuideVoice from "./useGuideVoice";

export default function ReadingOnboarding({
  language,
  initialCategory,
  onComplete,
  onBackToLanding,
}: {
  language: "en" | "hi";
  initialCategory?: JourneyState["focus"];
  onComplete: (profile: Profile, focus: JourneyState["focus"]) => void;
  onBackToLanding: () => void;
}) {
  const astro = useAstro();
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<"en" | "hi">(astro.voiceLanguage === "hi" ? "hi" : "en");
  const hi = astro.language === "hi";

  type SubStep = "language" | "name" | "dob" | "time" | "category";
  const [subStep, setSubStep] = useState<SubStep>("language");

  const [name, setName] = useState(astro.profile?.birth.name ?? "");
  const [birthDate, setBirthDate] = useState(astro.profile?.birth.birth_date ?? "");
  const [birthTime, setBirthTime] = useState(astro.profile?.birth.birth_time ?? "");
  const [timeAccuracy, setTimeAccuracy] = useState<"exact" | "unknown">(
    astro.profile?.birth.time_accuracy === "unknown" ? "unknown" : "exact"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const voice = useGuideVoice(selectedVoiceLang, "female");

  const LANG_VOICEOVER = "Continue in English, ya Hindi me baat karna pasand karenge?";

  // Initial mount: Play voiceover ONLY for selecting language
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await api("/session", { method: "POST" }).catch(() => {});
      if (cancelled) return;
      voice.unlock();
      await voice.speak(LANG_VOICEOVER);
    })();

    return () => {
      cancelled = true;
      voice.stop();
    };
  }, []);

  const handleLanguageSubmit = () => {
    voice.stop();
    astro.setVoiceLanguage(selectedVoiceLang);
    setSubStep("name");
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      setSubStep("dob");
    }
  };

  const handleDobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthDate) {
      setSubStep("time");
    }
  };

  const handleTimeSubmit = (withTime: boolean) => {
    if (withTime && birthTime) {
      setTimeAccuracy("exact");
    } else {
      setTimeAccuracy("unknown");
    }
    setSubStep("category");
  };

  const handleCategorySelect = async (focus: JourneyState["focus"]) => {
    setBusy(true);
    setError("");

    try {
      await api("/session", { method: "POST" }).catch(() => {});
      const payload = {
        name: name.trim() || "Seeker",
        birth_date: birthDate || "1996-01-01",
        birth_time: timeAccuracy === "unknown" || !birthTime ? null : birthTime,
        time_accuracy: timeAccuracy,
        uncertainty_minutes: 30,
        place_id: astro.profile?.place?.id || "city:delhi",
        gender: "unspecified",
        preferred_system: astro.system || "vedic",
      };

      const saved = await api<Profile>("/profiles", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      astro.selectProfile(saved.id);
      void astro.refresh();
      onComplete(saved, focus);
    } catch (e) {
      setError((e as Error).message || "Could not save profile. Please retry.");
      setBusy(false);
    }
  };

  return (
    <div className="journey-shell universe-landing relative min-h-screen text-[#f7eedd] overflow-y-auto">
      <UniverseBackground immersive />

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 border-b border-white/10 backdrop-blur-md bg-black/40">
        <button
          type="button"
          onClick={() => {
            voice.stop();
            if (subStep === "language") {
              onBackToLanding();
            } else if (subStep === "name") {
              setSubStep("language");
            } else if (subStep === "dob") {
              setSubStep("name");
            } else if (subStep === "time") {
              setSubStep("dob");
            } else if (subStep === "category") {
              setSubStep("time");
            }
          }}
          className="flex items-center gap-2 text-xs font-serif text-[#d8c3a1] hover:text-[#f8d998] transition-colors cursor-pointer"
        >
          <span>←</span>
          <span>{hi ? "पीछे" : "Back"}</span>
        </button>

        {/* Step Indicator Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 bg-gold/15 text-xs text-[#f4d48d] font-serif shadow-sm">
          <span className="text-amber-300">✦</span>
          <span>
            {subStep === "language" && (hi ? "भाषा चुनें" : "Select Language")}
            {subStep === "name" && (hi ? "चरण 1 / 3 · आपका नाम" : "Step 1 of 3 · Your Name")}
            {subStep === "dob" && (hi ? "चरण 2 / 3 · जन्म तिथि" : "Step 2 of 3 · Birth Date")}
            {subStep === "time" && (hi ? "चरण 3 / 3 · जन्म समय" : "Step 3 of 3 · Birth Time")}
            {subStep === "category" && (hi ? "रीडिंग श्रेणी चुनें" : "Select Category")}
          </span>
        </div>

        {/* Creative Brand Logo */}
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-sm">✧</span>
          <span className="font-display text-base tracking-wider font-bold bg-gradient-to-r from-amber-200 via-gold to-amber-500 bg-clip-text text-transparent">
            Dear<span className="font-light italic text-[#fff3db]">Universe</span>
          </span>
        </div>
      </header>

      {/* Main Container with Direct Popup Modals */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-5 py-8 max-w-4xl mx-auto text-center">
        <div className="w-full flex justify-center animate-float-in">

          {/* POPUP 0: LANGUAGE SELECTION (WITH ONLY VOICEOVER) */}
          {subStep === "language" && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="popup-lang-title"
              style={{
                background: "linear-gradient(180deg, #0e2d23 0%, #051812 100%)",
                borderColor: "#e8c67f",
                boxShadow: "0 0 80px rgba(0,0,0,0.95), 0 0 35px rgba(232,198,127,0.3)",
              }}
              className="w-full max-w-md rounded-3xl border-2 p-7 sm:p-9 text-center space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs text-[#edd5a4] font-serif font-medium">✦ {hi ? "भाषा का चयन करें" : "Select Language"}</span>
                <button
                  type="button"
                  onClick={() => {
                    voice.unlock();
                    void voice.speak(LANG_VOICEOVER);
                  }}
                  className="text-xs text-[#d5be9b] hover:text-gold flex items-center gap-1 font-serif cursor-pointer"
                >
                  <span>🔊</span>
                  <span>{hi ? "फिर से सुनें" : "Replay voice"}</span>
                </button>
              </div>

              <div className="space-y-2">
                <h2 id="popup-lang-title" className="font-display text-2xl sm:text-3xl text-[#fff5e0] font-medium drop-shadow">
                  {hi ? "बातचीत की भाषा चुनें" : "Choose Your Language"}
                </h2>
                <p className="font-serif text-xs sm:text-sm text-[#d4c3a7]">
                  {hi
                    ? "आप अंग्रेजी में जारी रखना चाहेंगे या हिंदी में बात करना पसंद करेंगे?"
                    : "Continue in English ya Hindi me baat karna pasand karenge?"}
                </p>
              </div>

              {/* Sound wave pulsing indicator while guide speaks */}
              {voice.playing && (
                <div className="flex items-center justify-center gap-1.5 py-1 text-xs text-[#f5d89f] font-serif">
                  <span className="w-1 h-3.5 rounded-full bg-gold animate-pulse" />
                  <span className="w-1 h-5 rounded-full bg-amber-300 animate-pulse" />
                  <span className="w-1 h-3.5 rounded-full bg-gold animate-pulse" />
                  <span className="ml-1 text-[11px]">{hi ? "मार्गदर्शिका बोल रही है..." : "Guide speaking..."}</span>
                </div>
              )}

              {/* Language Selection Buttons */}
              <div className="grid grid-cols-1 gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVoiceLang("en");
                    astro.setVoiceLanguage("en");
                  }}
                  className={`rounded-2xl p-4 border-2 transition-all text-left flex items-center justify-between cursor-pointer ${
                    selectedVoiceLang === "en"
                      ? "border-gold bg-gold/20 shadow-[0_0_20px_rgba(232,198,127,0.3)]"
                      : "border-white/10 bg-[#03150e]/80 hover:border-gold/40"
                  }`}
                >
                  <div>
                    <div className="font-serif font-bold text-base text-[#fff5e0]">English Voice</div>
                    <p className="text-xs text-[#d3c2a6] mt-0.5 font-sans">Continue in English</p>
                  </div>
                  {selectedVoiceLang === "en" && (
                    <span className="w-6 h-6 rounded-full bg-gold text-[#0a2018] flex items-center justify-center font-bold text-xs">✓</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedVoiceLang("hi");
                    astro.setVoiceLanguage("hi");
                  }}
                  className={`rounded-2xl p-4 border-2 transition-all text-left flex items-center justify-between cursor-pointer ${
                    selectedVoiceLang === "hi"
                      ? "border-gold bg-gold/20 shadow-[0_0_20px_rgba(232,198,127,0.3)]"
                      : "border-white/10 bg-[#03150e]/80 hover:border-gold/40"
                  }`}
                >
                  <div>
                    <div className="font-serif font-bold text-base text-[#fff5e0]">हिन्दी आवाज़ (Hindi Voice)</div>
                    <p className="text-xs text-[#d3c2a6] mt-0.5 font-sans">हिंदी में बात करना पसंद करेंगे</p>
                  </div>
                  {selectedVoiceLang === "hi" && (
                    <span className="w-6 h-6 rounded-full bg-gold text-[#0a2018] flex items-center justify-center font-bold text-xs">✓</span>
                  )}
                </button>
              </div>

              {/* Continue to Name Button */}
              <button
                type="button"
                onClick={handleLanguageSubmit}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-amber-400 via-gold to-amber-500 text-[#091b14] font-serif font-bold text-sm shadow-[0_0_25px_rgba(240,145,62,0.4)] hover:brightness-110 transition-all cursor-pointer"
              >
                <span>{hi ? "नाम दर्ज करने के लिए आगे बढ़ें →" : "Continue to Enter Name →"}</span>
              </button>
            </div>
          )}

          {/* POPUP 1: NAME (DIRECT POPUP, NO VOICEOVER) */}
          {subStep === "name" && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="popup-name-title"
              style={{
                background: "linear-gradient(180deg, #0e2d23 0%, #051812 100%)",
                borderColor: "#e8c67f",
                boxShadow: "0 0 80px rgba(0,0,0,0.95), 0 0 35px rgba(232,198,127,0.3)",
              }}
              className="w-full max-w-md rounded-3xl border-2 p-7 sm:p-9 text-center space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs text-[#edd5a4] font-serif font-medium">✦ {hi ? "चरण 1: नाम" : "Step 1: Your Name"}</span>
              </div>

              <div className="space-y-2">
                <h2 id="popup-name-title" className="font-display text-2xl sm:text-3xl text-[#fff5e0] font-medium drop-shadow">
                  {hi ? "ब्रह्मांड आपको किस नाम से पुकारे?" : "What may the Universe call you?"}
                </h2>
                <p className="font-serif text-xs sm:text-sm text-[#d4c3a7]">
                  {hi
                    ? "अपना पूरा या पसंदीदा नाम यहाँ दर्ज करें:"
                    : "Enter your full or preferred name below:"}
                </p>
              </div>

              <form onSubmit={handleNameSubmit} className="space-y-5">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={hi ? "अपना नाम लिखें..." : "Enter your full name..."}
                  className="w-full text-center text-xl font-serif py-4 px-5 rounded-2xl border-2 border-gold/50 bg-[#03150e] text-[#fff6e6] placeholder-[#c4b59c]/50 shadow-inner focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/40 transition-all"
                />

                <div className="flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={name.trim().length < 2}
                    className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-amber-400 via-gold to-amber-500 text-[#091b14] font-serif font-bold text-sm shadow-[0_0_25px_rgba(240,145,62,0.4)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span>{hi ? "जन्म तिथि दर्ज करें →" : "Continue to Date of Birth →"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubStep("language")}
                    className="text-xs text-[#d4c3a7] hover:text-white py-1 font-serif cursor-pointer"
                  >
                    ← {hi ? "भाषा बदलें" : "Change language"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* POPUP 2: DATE OF BIRTH (DIRECT POPUP, NO VOICEOVER) */}
          {subStep === "dob" && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="popup-dob-title"
              style={{
                background: "linear-gradient(180deg, #0e2d23 0%, #051812 100%)",
                borderColor: "#e8c67f",
                boxShadow: "0 0 80px rgba(0,0,0,0.95), 0 0 35px rgba(232,198,127,0.3)",
              }}
              className="w-full max-w-md rounded-3xl border-2 p-7 sm:p-9 text-center space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs text-[#edd5a4] font-serif font-medium">✦ {hi ? "चरण 2: जन्म तिथि" : "Step 2: Birth Date"}</span>
              </div>

              <div className="space-y-2">
                <h2 id="popup-dob-title" className="font-display text-2xl sm:text-3xl text-[#fff5e0] font-medium drop-shadow">
                  {hi ? "आपकी जीवन यात्रा किस दिन शुरू हुई?" : "When did your journey begin?"}
                </h2>
                <p className="font-serif text-xs sm:text-sm text-[#d4c3a7]">
                  {hi
                    ? "कैलेंडर से अपनी जन्म तिथि चुनें:"
                    : "Select your date of birth from the calendar:"}
                </p>
              </div>

              <form onSubmit={handleDobSubmit} className="space-y-5">
                <input
                  type="date"
                  required
                  autoFocus
                  max={new Date().toISOString().split("T")[0]}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full text-center text-lg font-serif py-4 px-5 rounded-2xl border-2 border-gold/50 bg-[#03150e] text-[#fff6e6] shadow-inner focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/40 transition-all cursor-pointer"
                />

                <div className="flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={!birthDate}
                    className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-amber-400 via-gold to-amber-500 text-[#091b14] font-serif font-bold text-sm shadow-[0_0_25px_rgba(240,145,62,0.4)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span>{hi ? "जन्म समय दर्ज करें →" : "Continue to Birth Time →"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubStep("name")}
                    className="text-xs text-[#d4c3a7] hover:text-white py-1 font-serif cursor-pointer"
                  >
                    ← {hi ? "नाम बदलें" : "Change name"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* POPUP 3: TIME OF BIRTH (DIRECT POPUP, NO VOICEOVER) */}
          {subStep === "time" && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="popup-time-title"
              style={{
                background: "linear-gradient(180deg, #0e2d23 0%, #051812 100%)",
                borderColor: "#e8c67f",
                boxShadow: "0 0 80px rgba(0,0,0,0.95), 0 0 35px rgba(232,198,127,0.3)",
              }}
              className="w-full max-w-md rounded-3xl border-2 p-7 sm:p-9 text-center space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs text-[#edd5a4] font-serif font-medium">✦ {hi ? "चरण 3: जन्म समय (वैकल्पिक)" : "Step 3: Birth Time (Optional)"}</span>
              </div>

              <div className="space-y-2">
                <h2 id="popup-time-title" className="font-display text-2xl sm:text-3xl text-[#fff5e0] font-medium drop-shadow">
                  {hi ? "क्या आपको अपना जन्म समय याद है?" : "Do you know your time of birth?"}
                </h2>
                <p className="font-serif text-xs sm:text-sm text-[#d4c3a7]">
                  {hi
                    ? "समय ज्ञात है तो दर्ज करें, अथवा इसके बिना भी जारी रख सकते हैं:"
                    : "Enter it if known, or seamlessly proceed without it:"}
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="time"
                  autoFocus
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full text-center text-xl font-serif py-4 px-5 rounded-2xl border-2 border-gold/50 bg-[#03150e] text-[#fff6e6] shadow-inner focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/40 transition-all cursor-pointer"
                />

                <div className="space-y-3 pt-1">
                  {/* Continue with Time Button */}
                  <button
                    type="button"
                    disabled={!birthTime}
                    onClick={() => handleTimeSubmit(true)}
                    className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-amber-400 via-gold to-amber-500 text-[#091b14] font-serif font-bold text-sm shadow-[0_0_25px_rgba(240,145,62,0.4)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span>{hi ? "जन्म समय के साथ आगे बढ़ें →" : "Continue with Birth Time →"}</span>
                  </button>

                  {/* Prominent Continue Without Time Button */}
                  <button
                    type="button"
                    onClick={() => handleTimeSubmit(false)}
                    className="w-full py-3.5 px-6 rounded-full border-2 border-gold/50 bg-gold/20 hover:bg-gold/30 text-[#fff7e6] font-serif text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {hi
                        ? "समय के बिना आगे बढ़ें (समय याद नहीं है)"
                        : "Continue without birth time (Time unknown)"}
                    </span>
                    <span className="text-gold">✦</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubStep("dob")}
                    className="text-xs text-[#d4c3a7] hover:text-white py-1 font-serif cursor-pointer block mx-auto"
                  >
                    ← {hi ? "जन्म तिथि बदलें" : "Change birth date"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* POPUP 4: CATEGORY SELECTION (DIRECT SCREEN, NO VOICEOVER, THEN FUNNEL STARTS) */}
          {subStep === "category" && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="popup-category-title"
              style={{
                background: "linear-gradient(180deg, #0e2d23 0%, #051812 100%)",
                borderColor: "#e8c67f",
                boxShadow: "0 0 80px rgba(0,0,0,0.95), 0 0 35px rgba(232,198,127,0.3)",
              }}
              className="w-full max-w-3xl rounded-3xl border-2 p-6 sm:p-8 text-center space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs text-[#edd5a4] font-serif font-medium">✦ {hi ? "अंतिम चरण: श्रेणी" : "Final Step: Choose Area"}</span>
                <button
                  type="button"
                  onClick={() => setSubStep("time")}
                  className="text-xs text-[#d4c3a7] hover:text-white font-serif cursor-pointer"
                >
                  ← {hi ? "समय बदलें" : "Change time"}
                </button>
              </div>

              <div className="space-y-2 text-center">
                <h2 id="popup-category-title" className="font-display text-2xl sm:text-3xl text-[#fff5e0] font-medium drop-shadow">
                  {hi
                    ? `स्वागत है, ${name || "यात्री"} ✦ अपनी श्रेणी चुनें`
                    : `Welcome, ${name || "Seeker"} ✦ Choose your reading category`}
                </h2>
                <p className="font-serif text-xs sm:text-sm text-[#d4c3a7] max-w-lg mx-auto">
                  {hi
                    ? "वह क्षेत्र चुनें जहाँ आपको स्पष्टता, समाधान और मार्गदर्शन की आवश्यकता है:"
                    : "Select the area of life where you seek clarity, direction, and practical wisdom:"}
                </p>
              </div>

              {error && (
                <p className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs">
                  {error}
                </p>
              )}

              {/* Grid of Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 text-left">
                {guideCategories.map((cat) => (
                  <button
                    key={cat.id}
                    disabled={busy}
                    type="button"
                    onClick={() => void handleCategorySelect(cat.id)}
                    className="group relative rounded-2xl border-2 border-gold/30 bg-gradient-to-br from-[#12382e]/95 to-[#071f16]/98 p-5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-gold hover:shadow-[0_10px_30px_rgba(232,198,127,0.35)] flex flex-col justify-between min-h-[155px] cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 text-gold shrink-0 drop-shadow-[0_2px_8px_rgba(232,198,127,0.4)]">
                        <CategoryArt kind={cat.glyph} />
                      </div>
                      <span className="text-xs text-gold/80 group-hover:text-gold group-hover:translate-x-0.5 transition-all">
                        ↗
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <h3 className="font-serif text-base font-semibold text-[#fff5e0] group-hover:text-gold transition-colors">
                        {hi ? cat.hi : cat.label}
                      </h3>
                      <p className="text-xs text-[#c9bba6] mt-1 leading-snug line-clamp-2">
                        {cat.landingHint}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {busy && (
                <div className="flex items-center justify-center gap-2 text-sm text-[#f6db9b] font-serif py-2">
                  <span className="animate-spin text-lg">✦</span>
                  <span>
                    {hi
                      ? "आपकी कुंडली और रीडिंग तैयार हो रही है..."
                      : "Aligning your birth chart and reading..."}
                  </span>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
