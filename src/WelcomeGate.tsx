import { useState } from "react";
import CelestialArt from "./components/CelestialArt";
import UniverseBackground from "./components/UniverseBackground";
import { useAstro } from "./astro/AstroContext";
import "./welcome-gate.css";

type WelcomeGateProps = {
  onLogin: () => Promise<void>;
  onStartReading: () => void;
};

export default function WelcomeGate({ onLogin, onStartReading }: WelcomeGateProps) {
  const astro = useAstro();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [tempVoiceLang, setTempVoiceLang] = useState<"en" | "hi">(astro.voiceLanguage === "hi" ? "hi" : "en");

  const login = async () => {
    setBusy(true);
    setError("");
    try {
      await onLogin();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to open your space.");
    } finally {
      setBusy(false);
    }
  };

  const applyVoiceLanguage = (selected: "en" | "hi") => {
    astro.setVoiceLanguage(selected);
    setLangModalOpen(false);
  };

  return (
    <div className="welcome-gate">
      <UniverseBackground immersive />
      <div className="welcome-orbit welcome-orbit-one" aria-hidden="true"><CelestialArt wheel /></div>
      <div className="welcome-orbit welcome-orbit-two" aria-hidden="true"><CelestialArt wheel /></div>
      <div className="welcome-gate-content">
        {/* Header with DearUniverse Brand and Top-Right Voice Language Popup */}
        <header className="welcome-header">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">&#10023;</span>
            <b className="font-display tracking-wider bg-gradient-to-r from-amber-200 via-gold to-amber-500 bg-clip-text text-transparent text-base">
              Dear<span className="font-light italic text-cream">Universe</span>
            </b>
          </div>

          <button
            type="button"
            onClick={() => {
              setTempVoiceLang(astro.voiceLanguage === "hi" ? "hi" : "en");
              setLangModalOpen(true);
            }}
            aria-label="Select voice language popup"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gold/40 bg-gold/10 hover:bg-gold/20 text-cream font-serif text-xs transition-all shadow-sm cursor-pointer"
          >
            <span className="text-gold">🎙️</span>
            <span>{astro.voiceLanguage === "hi" ? "हिन्दी Voice" : "English Voice"}</span>
            <span className="text-[9px] text-gold">▼</span>
          </button>
        </header>

        {/* Center-Aligned Main Section */}
        <main>
          <p className="welcome-kicker">
            A SPACE FOR YOUR INNER WORLD
          </p>
          <h1>
            Some answers begin<br />
            <em>with being heard.</em>
          </h1>
          <p className="welcome-copy">
            A personal journey through the questions that matter to you—guided by your story, your birth details, and practical reflection.
          </p>

          <div className="welcome-actions">
            <button
              type="button"
              className="welcome-reading"
              aria-label="Start my reading"
              onClick={onStartReading}
            >
              <span>Start my reading</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
            <button
              type="button"
              className="welcome-login"
              disabled={busy}
              onClick={() => void login()}
            >
              {busy ? "Opening your space..." : "Log in"}
            </button>
          </div>

          <small>
            Log in returns to the profile saved in this browser.
          </small>

          {error && <p className="welcome-error" role="alert">{error}</p>}
        </main>

        <footer>
          <span>PRIVATE BY DESIGN</span>
          <span>ENGLISH · हिन्दी VOICE</span>
        </footer>
      </div>

      {/* Voice Language Selection Popup Modal */}
      {langModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-voice-lang-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-sm rounded-3xl border border-gold/40 bg-gradient-to-b from-[#113127] to-[#081b15] p-6 shadow-[0_0_50px_rgba(232,198,127,0.25)] text-center text-cream">
            <button
              type="button"
              onClick={() => setLangModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-ash hover:text-cream hover:border-gold/50 transition-all cursor-pointer"
              aria-label="Close voice language modal"
            >
              ✕
            </button>

            <div className="mb-4">
              <span className="text-3xl text-gold inline-block mb-1">🎙️</span>
              <h2 id="welcome-voice-lang-title" className="font-display text-2xl text-cream font-medium">
                Voice Language
              </h2>
              <p className="text-xs text-ash mt-1 font-serif">
                Select your preferred voiceover language for reading narration
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 my-5">
              <button
                type="button"
                onClick={() => setTempVoiceLang("en")}
                className={`rounded-2xl p-4 border transition-all text-left relative cursor-pointer ${
                  tempVoiceLang === "en"
                    ? "border-gold bg-gold/20 shadow-[0_0_15px_rgba(232,198,127,0.3)]"
                    : "border-white/10 bg-white/5 hover:border-gold/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-semibold text-base text-cream">English Voice</span>
                  {tempVoiceLang === "en" && <span className="text-gold font-bold">✓</span>}
                </div>
                <p className="text-[11px] text-ash mt-0.5 font-sans">Listen to reading in English</p>
              </button>

              <button
                type="button"
                onClick={() => setTempVoiceLang("hi")}
                className={`rounded-2xl p-4 border transition-all text-left relative cursor-pointer ${
                  tempVoiceLang === "hi"
                    ? "border-gold bg-gold/20 shadow-[0_0_15px_rgba(232,198,127,0.3)]"
                    : "border-white/10 bg-white/5 hover:border-gold/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-semibold text-base text-cream">हिन्दी आवाज़ (Hindi Voice)</span>
                  {tempVoiceLang === "hi" && <span className="text-gold font-bold">✓</span>}
                </div>
                <p className="text-[11px] text-ash mt-0.5 font-sans">रीडिंग हिंदी आवाज़ में सुनें</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => applyVoiceLanguage(tempVoiceLang)}
              className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-gold to-ember text-[#0b1c15] font-serif font-semibold text-sm shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              Continue with {tempVoiceLang === "hi" ? "Hindi Voice" : "English Voice"} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
