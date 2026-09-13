import { useState } from "react";
import { useAstro } from "../astro/AstroContext";
import { glyphs, type Chart } from "../astro/api";
import { getPlanetInsight, HOUSE_TITLES } from "../astro/benefits";

export function ChartWheel({ chart: supplied, compact = false }: { chart?: Chart; compact?: boolean } = {}) {
  const astro = useAstro();
  const chart = supplied ?? astro.profile?.charts[astro.system];
  const PLANETS = Object.entries(chart?.planets ?? {})
    .filter(([, p]) => p.longitude !== null)
    .map(([name, p]) => {
      const insight = getPlanetInsight(name, p.sign);
      const houseInfo = p.house ? HOUSE_TITLES[p.house] : null;
      return {
        glyph: glyphs[name] ?? "✦",
        name,
        sign: p.sign ?? "Taurus",
        house: p.house,
        deg: p.longitude!,
        insight,
        houseTitle: houseInfo?.title ?? (p.house ? `House ${p.house}` : "Auspicious Placement"),
        houseTheme: houseInfo?.theme ?? "",
        retrograde: p.retrograde,
      };
    });

  const HOUSES = chart?.houses?.cusps ?? [];
  const [active, setActive] = useState(0);
  const selected = PLANETS[Math.min(active, PLANETS.length - 1)];
  const angle = (longitude: number) =>
    ((longitude - (chart?.houses?.ascendant ?? 0)) / 180) * Math.PI + Math.PI;
  const R = 130;
  const cx = 150;
  const cy = 150;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative">
        <svg viewBox="0 0 300 300" className={compact ? "h-[140px] w-[140px] sm:h-[160px] sm:w-[160px]" : "h-[280px] w-[280px]"}>
          {/* outer rings */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(240,145,62,0.35)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={R - 26} fill="none" stroke="rgba(232,198,127,0.22)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={54} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* house spokes */}
          {HOUSES.map((cusp, i) => {
            const a = angle(cusp);
            const x1 = cx + Math.cos(a) * 54;
            const y1 = cy + Math.sin(a) * 54;
            const x2 = cx + Math.cos(a) * R;
            const y2 = cy + Math.sin(a) * R;
            const la = a + (((HOUSES[(i + 1) % 12] - cusp + 360) % 360) / 360) * Math.PI;
            const lx = cx + Math.cos(la) * (R - 13);
            const ly = cy + Math.sin(la) * (R - 13);
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.08)" strokeWidth="0.75" />
                <text
                  x={lx}
                  y={ly}
                  fill="rgba(232,198,127,0.55)"
                  fontSize="8"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* aspect lines between planets */}
          {PLANETS.map((p, i) =>
            PLANETS.slice(i + 1)
              .filter((q) =>
                chart?.aspects.some(
                  (a) =>
                    (a.planet_a === p.name && a.planet_b === q.name) ||
                    (a.planet_b === p.name && a.planet_a === q.name),
                ),
              )
              .map((q, j) => {
                const a1 = angle(p.deg);
                const a2 = angle(q.deg);
                const rr = 78;
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={cx + Math.cos(a1) * rr}
                    y1={cy + Math.sin(a1) * rr}
                    x2={cx + Math.cos(a2) * rr}
                    y2={cy + Math.sin(a2) * rr}
                    stroke="rgba(240,145,62,0.12)"
                    strokeWidth="0.6"
                  />
                );
              }),
          )}

          {/* planets on wheel */}
          {PLANETS.map((p, i) => {
            const a = angle(p.deg);
            const px = cx + Math.cos(a) * (R - 40);
            const py = cy + Math.sin(a) * (R - 40);
            const on = i === active;
            return (
              <g key={p.name} onClick={() => setActive(i)} style={{ cursor: "pointer" }}>
                <circle
                  cx={px}
                  cy={py}
                  r={on ? 15 : 12}
                  fill={on ? "#f0913e" : "rgba(20,16,12,0.9)"}
                  stroke={on ? "#f7b46b" : "rgba(232,198,127,0.4)"}
                  strokeWidth="1"
                />
                <text
                  x={px}
                  y={py + 1}
                  fill={on ? "#12100c" : "#e8c67f"}
                  fontSize="13"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {p.glyph}
                </text>
              </g>
            );
          })}

          {/* center text */}
          <text x={cx} y={cy - 4} fill="#f4ece0" fontSize="10" textAnchor="middle" fontFamily="Marcellus">
            Natal Sky
          </text>
          <text x={cx} y={cy + 9} fill="rgba(232,198,127,0.7)" fontSize="7.5" textAnchor="middle">
            Vedic Planetary Alignment
          </text>
        </svg>
      </div>

      {/* Selected Planet Insight Card (Only in full chart view, omitted in compact funnel view to keep benefit cards visible) */}
      {!compact && selected && (
        <div className="mt-3 w-full animate-float-in rounded-2xl glass p-4 border border-gold/20" key={active}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl text-ember">{selected.glyph}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-serif text-base font-medium text-cream">
                    {selected.name} in {selected.sign}
                  </p>
                  {selected.retrograde && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Retrograde · Inner Focus
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gold font-medium">
                  {selected.insight.archetype} · {selected.houseTitle}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2 text-xs border-t border-white/10 pt-3">
            <div>
              <span className="font-semibold text-ember">🌟 Core Superpower: </span>
              <span className="text-cream/90">{selected.insight.coreStrength}</span>
            </div>
            <p className="text-cream/80 leading-relaxed">
              {selected.insight.detailedBlessing}
            </p>
            {selected.houseTheme && (
              <p className="text-[11px] text-ash italic">
                House impact: {selected.houseTheme}
              </p>
            )}
            <div className="rounded-xl bg-white/5 p-2 text-[11px] border border-white/5">
              <span className="font-semibold text-gold">💡 Life Advice: </span>
              <span className="text-ash">{selected.insight.lifeAdvice}</span>
            </div>
          </div>
        </div>
      )}
      {!compact && !selected && (
        <button
          onClick={astro.openProfile}
          className="mt-3 w-full rounded-2xl glass px-4 py-3 text-sm text-ash hover:text-cream"
        >
          {chart ? "Select a planet above to reveal your superpower" : "Add birth details to calculate your chart"}
        </button>
      )}
    </div>
  );
}
