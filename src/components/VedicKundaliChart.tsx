import { useState } from "react";
import { useAstro } from "../astro/AstroContext";
import { glyphs, signs, type Chart } from "../astro/api";
import { getPlanetInsight, HOUSE_TITLES } from "../astro/benefits";

const PLANET_COLORS: Record<string, string> = {
  Sun: "#f0913e",
  Moon: "#e8c67f",
  Mars: "#e05338",
  Mercury: "#48b082",
  Jupiter: "#f7b46b",
  Venus: "#d97bd4",
  Saturn: "#6e84d4",
  Rahu: "#9b70d4",
  Ketu: "#b08556",
  Uranus: "#4fb3bf",
  Neptune: "#3b82f6",
  Pluto: "#8b5cf6",
};

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

export function VedicKundaliChart({
  chart: supplied,
  onSelectPlanet,
  compact = false,
}: {
  chart?: Chart;
  onSelectPlanet?: (planetName: string) => void;
  compact?: boolean;
} = {}) {
  const astro = useAstro();
  const chart = supplied ?? astro.profile?.charts.vedic ?? astro.profile?.charts[astro.system];
  const [activePlanet, setActivePlanet] = useState<string>("Sun");

  // Ascendant index & sign calculation (100% astronomical accuracy from ephemeris)
  const ascDeg = chart?.houses?.ascendant ?? 0;
  const ascSignIndex = Math.floor(((ascDeg % 360) + 360) % 360 / 30);
  const ascSignName = signs[ascSignIndex] ?? "Taurus";

  // In North Indian Kundali, sign numbers (1-12) are placed in each house:
  // House 1 has (ascSignIndex + 1), House 2 has ((ascSignIndex + 1) % 12) + 1, etc.
  const getHouseSignNum = (houseNum: number) => {
    return ((ascSignIndex + houseNum - 1) % 12) + 1;
  };

  // Center coordinates for houses in a 300x300 North Indian diamond chart
  const houseCoordinates: Record<number, { x: number; y: number; signX: number; signY: number }> = {
    1:  { x: 150, y: 88,  signX: 150, signY: 62 },   // 1st House (Lagna - Top Diamond)
    2:  { x: 80,  y: 46,  signX: 106, signY: 42 },   // 2nd House (Top-Left Triangle)
    3:  { x: 42,  y: 84,  signX: 52,  signY: 62 },   // 3rd House (Left-Upper Triangle)
    4:  { x: 88,  y: 150, signX: 65,  signY: 150 },  // 4th House (Left Diamond)
    5:  { x: 42,  y: 216, signX: 52,  signY: 238 },  // 5th House (Left-Lower Triangle)
    6:  { x: 80,  y: 254, signX: 106, signY: 258 },  // 6th House (Bottom-Left Triangle)
    7:  { x: 150, y: 212, signX: 150, signY: 238 },  // 7th House (Bottom Diamond)
    8:  { x: 220, y: 254, signX: 194, signY: 258 },  // 8th House (Bottom-Right Triangle)
    9:  { x: 258, y: 216, signX: 248, signY: 238 },  // 9th House (Right-Lower Triangle)
    10: { x: 212, y: 150, signX: 235, signY: 150 },  // 10th House (Right Diamond)
    11: { x: 258, y: 84,  signX: 248, signY: 62 },   // 11th House (Right-Upper Triangle)
    12: { x: 220, y: 46,  signX: 194, signY: 42 },   // 12th House (Top-Right Triangle)
  };

  // Group planets into their Vedic houses
  const housePlanets: Record<number, { name: string; abbr: string; color: string; glyph: string; sign: string; isRetro: boolean }[]> = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];

  const mainPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  if (chart?.planets) {
    for (const [name, p] of Object.entries(chart.planets)) {
      if (!mainPlanets.includes(name) || p.longitude === null) continue;
      // Calculate whole-sign Vedic house from ascendant
      const planetSignIdx = Math.floor(((p.longitude % 360) + 360) % 360 / 30);
      const house = p.house ?? ((planetSignIdx - ascSignIndex + 12) % 12 + 1);

      if (house >= 1 && house <= 12) {
        housePlanets[house].push({
          name,
          abbr: PLANET_ABBR[name] ?? name.slice(0, 2),
          color: PLANET_COLORS[name] ?? "#e8c67f",
          glyph: glyphs[name] ?? "✦",
          sign: p.sign ?? signs[planetSignIdx],
          isRetro: !!p.retrograde,
        });
      }
    }
  }

  const selectedPlanet = chart?.planets[activePlanet];
  const selectedInsight = getPlanetInsight(activePlanet, selectedPlanet?.sign ?? "Taurus");
  const selectedHouse = selectedPlanet?.house ?? 1;
  const houseInfo = HOUSE_TITLES[selectedHouse] ?? HOUSE_TITLES[1];

  const handlePlanetClick = (pName: string) => {
    setActivePlanet(pName);
    onSelectPlanet?.(pName);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Lagna & System Banner */}
      <div className="flex items-center justify-between w-full px-2 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
          <span className="font-serif font-medium text-gold">Lagna (Ascendant): {ascSignName}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-ash bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
          Vedic D1 Kundali
        </span>
      </div>

      {/* Classical North Indian Diamond Chart SVG */}
      <div className={`relative w-full ${compact ? "max-w-[230px]" : "max-w-[310px]"} aspect-square rounded-2xl bg-gradient-to-b from-[#18130e] to-[#0f0c09] p-2 border border-gold/30 shadow-2xl shadow-black/60`}>
        <svg viewBox="0 0 300 300" className="w-full h-full" role="img" aria-label="Vedic square Kundli chart">
          {/* Outer Boundary Square */}
          <rect x="10" y="10" width="280" height="280" rx="6" fill="none" stroke="rgba(232, 198, 127, 0.4)" strokeWidth="1.6" />
          <rect x="14" y="14" width="272" height="272" rx="4" fill="none" stroke="rgba(240, 145, 62, 0.15)" strokeWidth="0.8" />

          {/* Major Diamond Lines connecting centers of edges */}
          <line x1="150" y1="10" x2="10" y2="150" stroke="rgba(232, 198, 127, 0.55)" strokeWidth="1.4" />
          <line x1="10" y1="150" x2="150" y2="290" stroke="rgba(232, 198, 127, 0.55)" strokeWidth="1.4" />
          <line x1="150" y1="290" x2="290" y2="150" stroke="rgba(232, 198, 127, 0.55)" strokeWidth="1.4" />
          <line x1="290" y1="150" x2="150" y2="10" stroke="rgba(232, 198, 127, 0.55)" strokeWidth="1.4" />

          {/* Corner Cross Diagonals */}
          <line x1="10" y1="10" x2="290" y2="290" stroke="rgba(232, 198, 127, 0.35)" strokeWidth="1.2" />
          <line x1="10" y1="290" x2="290" y2="10" stroke="rgba(232, 198, 127, 0.35)" strokeWidth="1.2" />

          {/* House Sign Numbers & Lagna indicator */}
          {Array.from({ length: 12 }, (_, i) => {
            const hNum = i + 1;
            const signNum = getHouseSignNum(hNum);
            const pos = houseCoordinates[hNum];
            return (
              <g key={`house-num-${hNum}`}>
                <text
                  x={pos.signX}
                  y={pos.signY}
                  fill="rgba(232, 198, 127, 0.65)"
                  fontSize="9"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {signNum}
                </text>
                {hNum === 1 && (
                  <text
                    x={pos.x}
                    y={pos.y - 18}
                    fill="#f0913e"
                    fontSize="8.5"
                    fontFamily="Marcellus, serif"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    LAGNA
                  </text>
                )}
              </g>
            );
          })}

          {/* Planet Badges Placed in Classical Houses */}
          {Object.entries(housePlanets).map(([houseStr, planets]) => {
            const hNum = Number(houseStr);
            const basePos = houseCoordinates[hNum];
            return planets.map((p, idx) => {
              const count = planets.length;
              const col = idx % 2;
              const row = Math.floor(idx / 2);
              const offsetX = count === 1 ? 0 : col === 0 ? -14 : 14;
              const offsetY = count <= 2 ? (row === 0 ? 0 : 14) : (row * 15 - 8);
              const px = basePos.x + offsetX;
              const py = basePos.y + offsetY;
              const isSelected = activePlanet === p.name;

              return (
                <g
                  key={p.name}
                  onClick={() => handlePlanetClick(p.name)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <rect
                    x={px - 11}
                    y={py - 7}
                    width={22}
                    height={14}
                    rx="4"
                    fill={isSelected ? p.color : "rgba(20, 16, 12, 0.85)"}
                    stroke={isSelected ? "#ffffff" : p.color}
                    strokeWidth={isSelected ? "1.5" : "1"}
                  />
                  <text
                    x={px}
                    y={py + 1}
                    fill={isSelected ? "#12100c" : "#ffffff"}
                    fontSize="8"
                    fontFamily="Inter, sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {p.abbr}{p.isRetro ? "ᴿ" : ""}
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>

      {/* Quick Planet Selector Chips */}
      {!compact && <div className="w-full mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {mainPlanets.map((pName) => {
          const isSelected = activePlanet === pName;
          const pData = chart?.planets[pName];
          return (
            <button
              key={pName}
              type="button"
              onClick={() => handlePlanetClick(pName)}
              className={`flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-xs font-serif transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-ember to-amber-600 text-[#12100c] font-semibold shadow-md shadow-ember/30"
                  : "bg-white/5 border border-white/10 text-cream/80 hover:bg-white/10"
              }`}
            >
              <span>{glyphs[pName] ?? "✦"}</span>
              <span>{pName}</span>
              {pData?.sign && <span className="text-[10px] opacity-75">· {pData.sign}</span>}
            </button>
          );
        })}
      </div>}

      {/* Selected Planet Life Blessing Card */}
      {!compact && selectedPlanet && (
        <div className="mt-3 w-full animate-float-in rounded-2xl glass p-4 border border-gold/25">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl font-bold shadow-md"
                style={{
                  background: `${PLANET_COLORS[activePlanet] ?? "#f0913e"}22`,
                  border: `1px solid ${PLANET_COLORS[activePlanet] ?? "#f0913e"}55`,
                  color: PLANET_COLORS[activePlanet] ?? "#f0913e",
                }}
              >
                {glyphs[activePlanet] ?? "✦"}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base font-semibold text-cream">
                    {activePlanet} in {selectedPlanet.sign}
                  </h3>
                  {selectedPlanet.retrograde && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans">
                      Retrograde · Deep Internal Power
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-gold">
                  {selectedInsight.archetype} · {houseInfo.title}
                </p>
              </div>
            </div>
          </div>

          {/* Core Strengths & Blessings in Plain Language */}
          <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs">
            <div>
              <span className="font-semibold text-ember">🌟 Core Gift: </span>
              <span className="text-cream/90">{selectedInsight.coreStrength}</span>
            </div>
            <p className="text-cream/80 leading-relaxed">
              {selectedInsight.detailedBlessing}
            </p>
            <div className="rounded-xl bg-white/5 p-2.5 border border-white/5">
              <span className="font-semibold text-gold">💡 Life Guidance: </span>
              <span className="text-ash">{selectedInsight.lifeAdvice}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
