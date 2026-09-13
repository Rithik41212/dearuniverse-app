import { useEffect, useState, useCallback } from "react";
import { useAstro, useResource } from "../astro/AstroContext";
import { signs, type Profile, type Kundali, type Dashas } from "../astro/api";
import "./kundli-preparation.css";

const hindiSigns = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];
const signGlyphs: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};
const signAbbr: Record<string, string> = {
  Aries: "Ari", Taurus: "Tau", Gemini: "Gem", Cancer: "Can", Leo: "Leo", Virgo: "Vir",
  Libra: "Lib", Scorpio: "Sco", Sagittarius: "Sag", Capricorn: "Cap", Aquarius: "Aqu", Pisces: "Pis",
};

const SUBTITLES = [
  "ग्रहों की स्थिति ट्रेस हो रही है...",
  "समय चक्र की समीक्षा हो रही है...",
  "भावनात्मक पैटर्न मैप हो रहे हैं...",
  "नक्षत्र विश्लेषण चल रहा है...",
];

const PLANET_COLORS: Record<string, string> = {
  Sun: "#c9a03d", Moon: "#b0a08a", Mars: "#c0453a", Mercury: "#c9a03d",
  Jupiter: "#c9a03d", Venus: "#c9a03d", Saturn: "#7a7068", Rahu: "#6b5ca0", Ketu: "#6b5040",
};

const MIN_DISPLAY_MS = 3000;

/* ── Ornate Corner SVG ── */
function OrnateCorner({ className }: { className: string }) {
  return (
    <div className={`ornate-corner ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 C0 0, 40 0, 60 8 C80 16, 90 28, 95 45 C100 62, 105 80, 120 100" stroke="url(#gold-grad)" strokeWidth="2" fill="none" />
        <path d="M0 0 C0 0, 25 2, 42 10 C59 18, 68 30, 72 48" stroke="url(#gold-grad)" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M0 0 C5 0, 15 2, 25 6 C35 10, 42 18, 45 28" stroke="url(#gold-grad)" strokeWidth="1" fill="none" opacity="0.5" />
        {/* Decorative flourishes */}
        <circle cx="60" cy="8" r="3" fill="#e8c67f" opacity="0.6" />
        <circle cx="42" cy="10" r="2" fill="#e8c67f" opacity="0.5" />
        <circle cx="95" cy="45" r="2.5" fill="#e8c67f" opacity="0.5" />
        {/* Corner leaf pattern */}
        <path d="M8 0 C8 8, 12 14, 20 18 C12 14, 6 12, 0 10" fill="#e8c67f" opacity="0.3" />
        <path d="M0 8 C8 10, 14 16, 18 24 C14 16, 10 10, 0 8" fill="#e8c67f" opacity="0.25" />
        <path d="M16 0 C18 10, 24 20, 34 26 C24 22, 18 14, 16 0" fill="#e8c67f" opacity="0.2" />
        <defs>
          <linearGradient id="gold-grad" x1="0" y1="0" x2="120" y2="120">
            <stop offset="0%" stopColor="#f7b46b" />
            <stop offset="50%" stopColor="#e8c67f" />
            <stop offset="100%" stopColor="#f0913e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ── North Indian Diamond Kundli Chart ── */
function NorthIndianChart({ profile, kundaliData }: { profile: Profile; kundaliData: Kundali | null }) {
  const chart = profile.charts.vedic;
  const ascSign = chart.houses
    ? signs[Math.floor(((chart.houses.ascendant % 360) + 360) % 360 / 30)]
    : null;
  const ascIndex = ascSign ? signs.indexOf(ascSign) : 0;

  // Map houses 1-12 starting from ascendant sign
  const houseSign = (houseNum: number) => signs[(ascIndex + houseNum - 1) % 12];

  // North Indian chart house positions (center-based coordinates for 300x300 viewBox)
  // Houses arranged in the classic diamond pattern
  const houseCenters: Record<number, { x: number; y: number }> = {
    1:  { x: 150, y: 90 },   // Top center (Asc)
    2:  { x: 75,  y: 55 },   // Top left
    3:  { x: 40,  y: 90 },   // Left upper
    4:  { x: 75,  y: 150 },  // Left center
    5:  { x: 40,  y: 210 },  // Left lower
    6:  { x: 75,  y: 245 },  // Bottom left
    7:  { x: 150, y: 210 },  // Bottom center
    8:  { x: 225, y: 245 },  // Bottom right
    9:  { x: 260, y: 210 },  // Right lower
    10: { x: 225, y: 150 },  // Right center
    11: { x: 260, y: 90 },   // Right upper
    12: { x: 225, y: 55 },   // Top right
  };

  // Place planets from kundali divisions or chart data
  const planetPlacements: Record<number, { name: string; abbr: string; color: string }[]> = {};
  for (let i = 1; i <= 12; i++) planetPlacements[i] = [];

  if (kundaliData?.divisions?.D1?.planets) {
    for (const [name, data] of Object.entries(kundaliData.divisions.D1.planets)) {
      const house = data.house;
      if (house >= 1 && house <= 12) {
        planetPlacements[house].push({
          name,
          abbr: name.substring(0, 2),
          color: PLANET_COLORS[name] ?? "#c9a03d",
        });
      }
    }
  } else {
    // Fallback: calculate house from chart planets
    for (const [name, planet] of Object.entries(chart.planets)) {
      if (!planet.longitude && planet.longitude !== 0) continue;
      if (!["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(name)) continue;
      const planetSign = Math.floor(((planet.longitude % 360) + 360) % 360 / 30);
      const house = (planetSign - ascIndex + 12) % 12 + 1;
      planetPlacements[house].push({
        name,
        abbr: name.substring(0, 2),
        color: PLANET_COLORS[name] ?? "#c9a03d",
      });
    }
  }

  return (
    <div className="kundli-chart-container">
      <div className="kundli-chart-frame">
        <div className="kundli-scan-beam" />
        <svg className="kundli-chart-svg" viewBox="0 0 300 300">
          {/* Outer square */}
          <rect className="chart-outer" x="10" y="10" width="280" height="280" rx="4" />
          {/* Diamond lines — forming the 12 house North Indian pattern */}
          <line x1="150" y1="10" x2="10" y2="150" />
          <line x1="10" y1="150" x2="150" y2="290" />
          <line x1="150" y1="290" x2="290" y2="150" />
          <line x1="290" y1="150" x2="150" y2="10" />
          {/* Inner connecting lines */}
          <line x1="10" y1="10" x2="150" y2="150" />
          <line x1="290" y1="10" x2="150" y2="150" />
          <line x1="10" y1="290" x2="150" y2="150" />
          <line x1="290" y1="290" x2="150" y2="150" />

          {/* Center name */}
          <text className="center-name" x="150" y="148" textAnchor="middle" dominantBaseline="middle">
            {profile.birth.name.split(" ")[0]}
          </text>
          {ascSign && (
            <text className="center-label" x="150" y="165" textAnchor="middle" dominantBaseline="middle">
              Asc
            </text>
          )}

          {/* House labels */}
          {Array.from({ length: 12 }, (_, i) => {
            const houseNum = i + 1;
            const sign = houseSign(houseNum);
            const center = houseCenters[houseNum];
            return (
              <g key={houseNum}>
                <text className="sign-glyph" x={center.x - 12} y={center.y - 8} textAnchor="middle">
                  {signGlyphs[sign]}
                </text>
                <text className="sign-label" x={center.x + 4} y={center.y - 8} textAnchor="middle">
                  {signAbbr[sign]}
                </text>
                {houseNum === 1 && ascSign && (
                  <text className="center-label" x={center.x} y={center.y + 2} textAnchor="middle" style={{ fill: "#c0453a", fontWeight: 600 }}>
                    {signAbbr[ascSign]}
                  </text>
                )}
              </g>
            );
          })}

          {/* Planet dots */}
          {Object.entries(planetPlacements).map(([house, planets]) => {
            const center = houseCenters[Number(house)];
            return planets.map((planet, idx) => {
              const offsetX = (idx % 3 - 1) * 18;
              const offsetY = Math.floor(idx / 3) * 16 + 8;
              return (
                <g key={planet.name} className="planet-dot" transform={`translate(${center.x + offsetX}, ${center.y + offsetY})`}>
                  <circle r="8" fill={planet.color} opacity="0.9" />
                  <text>{planet.abbr}</text>
                </g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
}

/* ── Main Preparation Screen ── */
export default function KundliPreparationScreen({ onComplete }: { onComplete: () => void }) {
  const astro = useAstro();
  const profile = astro.profile;
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [subtitleState, setSubtitleState] = useState<"entering" | "visible" | "exiting">("entering");
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [startTime] = useState(Date.now());

  // Fetch kundali and dasha data
  const kundali = useResource<Kundali>(profile ? `/profiles/${profile.id}/kundali` : null);
  const dashas = useResource<Dashas>(profile ? `/profiles/${profile.id}/dashas` : null);

  // Extract display data
  const chart = profile?.charts.vedic;
  const sunSign = chart?.planets.Sun?.sign;
  const moonSign = chart?.planets.Moon?.sign;
  const ascendant = chart?.houses
    ? signs[Math.floor(((chart.houses.ascendant % 360) + 360) % 360 / 30)]
    : null;
  const currentDasha = dashas.data?.current?.mahadasha;

  const hindiLabel = (sign: string | null | undefined) =>
    sign ? hindiSigns[signs.indexOf(sign)] ?? sign : "—";

  const dashaHindi: Record<string, string> = {
    Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध",
    Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
  };

  // Subtitle cycling
  useEffect(() => {
    const cycle = setInterval(() => {
      setSubtitleState("exiting");
      setTimeout(() => {
        setSubtitleIdx(prev => (prev + 1) % SUBTITLES.length);
        setSubtitleState("entering");
        setTimeout(() => setSubtitleState("visible"), 600);
      }, 600);
    }, 4000);
    return () => clearInterval(cycle);
  }, []);

  // Progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(95, (elapsed / MIN_DISPLAY_MS) * 100);
      setProgress(pct);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime]);

  // Auto-complete when minimum time has passed AND data is loaded
  const tryComplete = useCallback(() => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= MIN_DISPLAY_MS) {
      setProgress(100);
      setExiting(true);
      setTimeout(onComplete, 800);
    }
  }, [startTime, onComplete]);

  // Watch for data readiness
  useEffect(() => {
    if (!kundali.loading && !dashas.loading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      const timer = setTimeout(tryComplete, remaining);
      return () => clearTimeout(timer);
    }
  }, [kundali.loading, dashas.loading, tryComplete, startTime]);

  // Safety timeout — always complete after 12s max
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!exiting) {
        setProgress(100);
        setExiting(true);
        setTimeout(onComplete, 800);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [onComplete, exiting]);

  if (!profile) {
    // No profile — skip immediately
    onComplete();
    return null;
  }

  const badges = [
    { label: "सूर्य राशि", value: hindiLabel(sunSign) },
    { label: "लग्न", value: ascendant ? hindiLabel(ascendant) : "—" },
    { label: "चंद्र राशि", value: hindiLabel(moonSign) },
  ];

  return (
    <div className={`kundli-prep ${exiting ? "kundli-prep-exit" : ""}`}>
      <div className="kundli-prep-inner">
        {/* Gold corner decorations */}
        <OrnateCorner className="ornate-corner--tl" />
        <OrnateCorner className="ornate-corner--tr" />

        {/* Ambient glow */}
        <div className="kundli-glow" />

        {/* Precision badge */}
        <div className="precision-badge">
          ✦ PRECISION CALCULATION ✦
        </div>

        {/* Main title */}
        <h1 className="kundli-title">
          आपकी कुंडली और अंक तैयार हो रहे हैं
        </h1>

        {/* Cycling subtitle */}
        <div className="kundli-subtitle-wrap">
          <p className={`kundli-subtitle ${subtitleState}`}>
            {SUBTITLES[subtitleIdx]}
          </p>
        </div>

        {/* Section header */}
        <div className="kundli-section-header">
          <span className="grid-icon">⠿</span>
          <h2>कुंडली विन्यास बन रहा है</h2>
        </div>

        {/* Description block */}
        <div className="kundli-description">
          सबसे पहले मैं {profile.place.name} और{" "}
          {profile.birth.birth_time ?? "अज्ञात समय"} के आधार पर आपकी कुंडली का विन्यास देख रही
          हूँ। लग्न, चंद्र राशि, दशा और ग्रहों की सघनता मिलकर यह दिखा रहीं हैं कि आपके
          जीवन का ढाँचा कैसे बनता है और आने वाले महीनों में कौन-सा मोड़ उभर सकता है।
        </div>

        {/* Astrological badges */}
        <div className="astro-badges">
          {badges.map((b) => (
            <div key={b.label} className="astro-badge">
              <span className="astro-badge-label">{b.label}</span>
              <span className="astro-badge-value">{b.value}</span>
            </div>
          ))}
        </div>

        {/* Dasha badge — separate row */}
        {currentDasha && (
          <div className="astro-badges" style={{ marginTop: "0.5rem" }}>
            <div className="astro-badge">
              <span className="astro-badge-label">दशा</span>
              <span className="astro-badge-value">{dashaHindi[currentDasha] ?? currentDasha}</span>
            </div>
          </div>
        )}

        {/* North Indian Kundli Chart */}
        <NorthIndianChart profile={profile} kundaliData={kundali.data} />

        {/* Progress indicator */}
        <div className="kundli-progress">
          <div className="kundli-progress-bar">
            <div className="kundli-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="kundli-progress-text">
            {progress < 100 ? "गणना जारी है..." : "तैयार ✓"}
          </span>
        </div>
      </div>
    </div>
  );
}
