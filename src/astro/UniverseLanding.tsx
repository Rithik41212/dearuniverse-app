import { useState } from "react";
import CategoryArt, { guideCategories } from "./guideCategories";
import CelestialArt from "../components/CelestialArt";
import UniverseBackground from "../components/UniverseBackground";
import type { JourneyState } from "./StartupFunnel";
import "./universe-landing.css";

export default function UniverseLanding({
  language,
  onLanguage,
  onSelectLanguage,
  onStartReading,
  onCategory,
  onExplore,
}: {
  language: "en" | "hi";
  onLanguage: () => void;
  onSelectLanguage?: (lang: "en" | "hi") => void;
  onStartReading: (category?: JourneyState["focus"]) => void;
  onCategory: (focus: JourneyState["focus"]) => void;
  onExplore: () => void;
}) {
  const hi = language === "hi";
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [tempLang, setTempLang] = useState<"en" | "hi">(language);

  const featured = ["marriage", "career", "numerology"].map(
    (id) => guideCategories.find((c) => c.id === id)!
  );
  const secondary = ["business", "relationships", "growth"].map(
    (id) => guideCategories.find((c) => c.id === id)!
  );

  const applyLanguage = () => {
    if (onSelectLanguage) {
      onSelectLanguage(tempLang);
    } else if ((tempLang === "hi" && !hi) || (tempLang === "en" && hi)) {
      onLanguage();
    }
    setLangModalOpen(false);
  };

  return (
    <div className="journey-shell universe-landing">
      <UniverseBackground immersive />
      <div className="landing-zodiac landing-zodiac-left" aria-hidden="true">
        <CelestialArt wheel />
      </div>
      <div className="landing-zodiac landing-zodiac-right" aria-hidden="true">
        <CelestialArt wheel />
      </div>
      <svg
        className="landing-orbits"
        viewBox="0 0 1500 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path d="M-50 205Q750 700 1510 195M-30 840Q600 250 1550 655" />
        {[
          [250, 358],
          [650, 453],
          [1030, 405],
          [1310, 299],
          [128, 709],
          [1185, 508],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 2 ? 3 : 5} />
        ))}
      </svg>
      <div className="landing-content">
        <header className="landing-header">
          {/* Creative Typography Brand */}
          <button
            className="landing-brand group flex items-center gap-2 hover:opacity-90 transition-opacity"
            onClick={onExplore}
            aria-label="DearUniverse"
          >
            <span className="text-amber-400 text-2xl" aria-hidden="true">
              ✧
            </span>
            <span className="font-display text-xl sm:text-2xl tracking-wider font-bold bg-gradient-to-r from-amber-200 via-gold to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(232,198,127,0.35)]">
              Dear<span className="font-light italic text-cream">Universe</span>
            </span>
          </button>

          <nav aria-label="Universe navigation" className="flex items-center gap-4">
            <a href="#readings" className="hidden sm:inline hover:text-gold transition-colors">
              {hi ? "रीडिंग" : "Our readings"}
            </a>
            <button onClick={onExplore} className="hover:text-gold transition-colors">
              {hi ? "मेरा स्पेस" : "My space"}
            </button>

            {/* Top-Right Language Popup Trigger */}
            <button
              onClick={() => setLangModalOpen(true)}
              aria-label="Select language popup"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/40 bg-gold/10 hover:bg-gold/20 text-cream font-serif text-xs transition-all shadow-sm"
            >
              <span className="text-gold">🌐</span>
              <span>{hi ? "हिन्दी" : "English"}</span>
              <span className="text-[9px] text-gold">▼</span>
            </button>
          </nav>
        </header>

        <main className="landing-main">
          <div className="landing-heading">
            <p className="landing-eyebrow">A LITTLE CLARITY. A DEEPER CONNECTION.</p>
            <h1>
              {hi ? "सुनो ब्रह्मांड," : "Dear Universe,"}
              <br />
              <em>{hi ? "क्या तुम सुन रहे हो?" : "are you listening?"}</em>
            </h1>
            <p className="landing-subtitle">
              {hi
                ? "जो दिल में है, यहाँ कह दीजिए। ब्रह्मांड आपके साथ है।"
                : "Jo dil mein hai, yahan keh dijiye."}
            </p>

            {/* Prominent "Start My Reading" Call To Action */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => onStartReading()}
                className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full bg-gradient-to-r from-amber-400 via-gold to-ember text-[#0b1c15] font-serif font-bold text-base shadow-[0_0_35px_rgba(240,145,62,0.45)] hover:shadow-[0_0_55px_rgba(240,145,62,0.7)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span className="text-lg animate-pulse">✧</span>
                <span>{hi ? "मेरी रीडिंग शुरू करें" : "Start My Reading"}</span>
                <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>

          <div
            className="landing-readings"
            id="readings"
            aria-label="Choose your guided reading"
          >
            {featured.map((category, i) => (
              <button
                key={category.id}
                className={`reading-portal reading-portal-${i}`}
                onClick={() => onStartReading(category.id)}
                aria-label={hi ? category.hi : category.label}
              >
                <div className="reading-portal-art">
                  <CategoryArt kind={category.glyph} />
                </div>
                <h2>{hi ? category.hi : category.label}</h2>
                <p>{category.landingHint}</p>
                <span className="reading-portal-link">
                  {hi ? "बात शुरू करें" : "Explore reading"} <b>↗</b>
                </span>
              </button>
            ))}
          </div>

          <div className="landing-secondary">
            {secondary.map((category) => (
              <button
                key={category.id}
                onClick={() => onStartReading(category.id)}
                aria-label={hi ? category.hi : category.label}
              >
                <CategoryArt kind={category.glyph} />
                <span>{hi ? category.hi : category.label}</span>
                <b>↗</b>
              </button>
            ))}
          </div>

          <p className="landing-whisper">
            <span aria-hidden="true">✦</span>
            {hi
              ? "एक विषय चुनें। आपकी अपनी बातचीत शुरू होती है।"
              : "Choose what’s on your mind. Your conversation begins there."}
          </p>
        </main>

        <footer className="landing-footer">
          <span>YOUR SPACE TO BE HEARD · DEARUNIVERSE</span>
          <span>English · हिन्दी</span>
        </footer>
      </div>

      {/* ================= LANGUAGE SELECTION MODAL POPUP ================= */}
      {langModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl glass-strong border border-gold/40 p-6 shadow-[0_15px_50px_rgba(0,0,0,0.8)] text-center space-y-5">
            <button
              onClick={() => setLangModalOpen(false)}
              className="absolute top-4 right-4 text-ash hover:text-cream text-lg transition-colors"
              aria-label="Close language popup"
            >
              ✕
            </button>

            <div>
              <span className="inline-block p-2.5 rounded-full bg-gold/15 text-gold text-2xl border border-gold/30 mb-2">
                🌐
              </span>
              <h3 className="font-serif text-xl text-cream font-semibold">
                {hi ? "भाषा का चयन करें" : "Select Language"}
              </h3>
              <p className="text-xs text-ash mt-1">
                {hi
                  ? "अपनी आकाशीय यात्रा जारी रखने के लिए पसंदीदा भाषा चुनें"
                  : "Choose your preferred language to continue in DearUniverse"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: English */}
              <button
                type="button"
                onClick={() => setTempLang("en")}
                className={`rounded-2xl p-4 border transition-all text-left relative ${
                  tempLang === "en"
                    ? "border-gold bg-gold/20 shadow-[0_0_15px_rgba(232,198,127,0.3)]"
                    : "border-white/10 bg-white/5 hover:border-gold/30 text-ash"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-cream text-base">English</span>
                  {tempLang === "en" && <span className="text-gold font-bold text-xs">✓</span>}
                </div>
                <p className="text-[11px] text-ash mt-1">Continue in English</p>
              </button>

              {/* Option 2: Hindi */}
              <button
                type="button"
                onClick={() => setTempLang("hi")}
                className={`rounded-2xl p-4 border transition-all text-left relative ${
                  tempLang === "hi"
                    ? "border-gold bg-gold/20 shadow-[0_0_15px_rgba(232,198,127,0.3)]"
                    : "border-white/10 bg-white/5 hover:border-gold/30 text-ash"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-cream text-base">हिन्दी</span>
                  {tempLang === "hi" && <span className="text-gold font-bold text-xs">✓</span>}
                </div>
                <p className="text-[11px] text-ash mt-1">हिंदी में जारी रखें</p>
              </button>
            </div>

            <button
              type="button"
              onClick={applyLanguage}
              className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-gold to-ember text-[#0b1c15] font-serif font-semibold text-sm shadow-md hover:brightness-110 transition-all"
            >
              {tempLang === "hi" ? "जारी रखें" : "Continue"} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
