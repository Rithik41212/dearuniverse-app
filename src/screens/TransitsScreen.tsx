import { useState } from "react";
import { useAstro, useForecast, useResource } from "../astro/AstroContext";
import { type Panchang, clockLabel, glyphs, signs, signLabel } from "../astro/api";
import { ChartWheel } from "../components/ChartWheel";
import { VedicKundaliChart } from "../components/VedicKundaliChart";
import { ProfileBenefitsView } from "../components/ProfileBenefitsView";
import { SegTabs } from "../components/SegTabs";
import { MoonIcon, SunIcon } from "../components/icons";
import { t } from "../astro/i18n";

export function TransitsScreen() {
  const [tab, setTab] = useState("Natal chart");
  const [chartStyle, setChartStyle] = useState<"kundali" | "wheel">("kundali");
  const astro = useAstro();
  const lang = astro.language;
  const profile = astro.profile;
  const chart = profile?.charts[astro.system];
  const forecast = useForecast();
  const panchang = useResource<Panchang>(
    profile && tab === "Panchang"
      ? `/panchang?place_id=${encodeURIComponent(profile.place.id)}`
      : null,
  );

  // Friendly, engaging transit insights without confusing degrees
  const TRANSITS = forecast.data?.facts.top_transits.map((a) => {
    const isHarmonious = ["trine", "sextile", "conjunction"].includes(a.aspect.toLowerCase());
    return {
      glyph: glyphs[a.planet_a] ?? "✦",
      title: `${a.planet_a} harmonizes with your natal ${a.planet_b}`,
      badge: isHarmonious ? "Auspicious Flow" : "Dynamic Motivation",
      note: isHarmonious
        ? `Brings supportive energy, clarity of thought, and ease into conversations and endeavors today. ${forecast.data?.reflections[0] ?? ""}`
        : `A catalyst for breakthrough action. Focus on clear priorities and patient execution. ${forecast.data?.reflections[0] ?? ""}`,
      tone: isHarmonious ? "#e8c67f" : "#f0913e",
    };
  }) ?? [];

  const emptyTransitMessage = !profile
    ? "Add your birth details for personal celestial insights."
    : "No major challenging transits today. Celestial energies are steady and favorable for your daily focus.";

  const data = panchang.data;
  const PANCHANG = [
    {
      k: "Tithi (Lunar Day)",
      v: data ? `${data.paksha} ${data.tithi}` : "Unavailable",
      desc: "Lunar phase governing creative momentum and emotional harmony",
    },
    {
      k: "Nakshatra (Star)",
      v: data?.nakshatra ?? "Unavailable",
      desc: "Birth star constellation steering intuitive impulses",
    },
    {
      k: "Yoga (Union)",
      v: data?.yoga ?? "Unavailable",
      desc: "Solar-lunar alignment infusing health and harmony",
    },
    {
      k: "Karana (Action Energy)",
      v: data?.karana ?? "Unavailable",
      desc: "Daily rhythmic force for productive decisions",
    },
    {
      k: "Rahu Kaal (Quiet Period)",
      v: data?.rahu_kaal
        ? `${clockLabel(data.rahu_kaal.start, data.place.timezone)} - ${clockLabel(data.rahu_kaal.end, data.place.timezone)}`
        : "Unavailable",
      desc: "Ideal window for reflection, mantra, and inner focus",
    },
    {
      k: "Auspicious Sunrise",
      v: clockLabel(data?.sunrise, data?.place.timezone),
      desc: "Beginning of the energetic Vedic solar day",
    },
  ];

  // Core 3 Placements with human-relatable life strengths
  const sunSign = signLabel(chart?.planets.Sun);
  const moonSign = signLabel(chart?.planets.Moon);
  const ascSign = chart?.houses ? signs[Math.floor(((chart.houses.ascendant % 360) + 360) % 360 / 30)] : "Unavailable";

  return (
    <div className="space-y-6 pb-6">
      {/* Header Banner */}
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-cream">
          {t("sky_title", lang)}
        </h1>
        <p className="text-sm text-ash mt-1">
          <button
            onClick={() => astro.openReport("Birth chart")}
            className="hover:text-gold transition-colors"
          >
            {profile
              ? `${profile.birth.name} · ${profile.birth.birth_date} · ${profile.place.name}`
              : "Add your birth details"}
          </button>
        </p>
      </div>

      {/* Navigation Segments */}
      <div className="flex justify-center">
        <SegTabs
          tabs={["Natal chart", "Transits", "Panchang"]}
          labels={{
            "Natal chart": t("tab_natal", lang),
            "Transits": t("tab_transits", lang),
            "Panchang": t("tab_panchang", lang),
          }}
          active={tab}
          onChange={setTab}
          size="sm"
        />
      </div>

      {/* Natal Chart & Astrology Chart Tab */}
      {tab === "Natal chart" && (
        <div className="animate-float-in space-y-5">
          {/* Main Chart Card */}
          <div className="rounded-3xl glass-strong p-4 border border-gold/25">
            {/* Chart Style Toggle: Vedic Kundali vs Celestial Wheel */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ember">
                  {t("engine_badge", lang)}
                </span>
                <h2 className="font-serif text-sm font-medium text-cream">
                  {chartStyle === "kundali" ? t("chart_kundali", lang) : t("chart_wheel", lang)}
                </h2>
              </div>
              <div className="inline-flex rounded-full bg-black/40 p-1 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setChartStyle("kundali")}
                  className={`px-3 py-1 rounded-full font-serif transition-all ${
                    chartStyle === "kundali"
                      ? "bg-gradient-to-r from-ember to-amber-600 text-[#12100c] font-semibold shadow"
                      : "text-ash hover:text-cream"
                  }`}
                >
                  {t("toggle_kundali", lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setChartStyle("wheel")}
                  className={`px-3 py-1 rounded-full font-serif transition-all ${
                    chartStyle === "wheel"
                      ? "bg-gradient-to-r from-ember to-amber-600 text-[#12100c] font-semibold shadow"
                      : "text-ash hover:text-cream"
                  }`}
                >
                  {t("toggle_wheel", lang)}
                </button>
              </div>
            </div>

            {/* 100% Accurate Astrology Chart */}
            {chartStyle === "kundali" ? (
              <VedicKundaliChart />
            ) : (
              <ChartWheel />
            )}

            {/* Core Trio Placements: Easy to Understand & Empowering */}
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-white/5 p-3 text-center border border-white/5">
                <SunIcon className="mx-auto mb-1 h-4 w-4 text-ember" />
                <p className="font-serif text-sm font-semibold text-cream">{sunSign}</p>
                <p className="text-[10px] text-ember font-medium mt-0.5">{t("core_sun", lang)}</p>
                <p className="text-[9px] text-ash mt-1">{t("core_sun_desc", lang)}</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-3 text-center border border-white/5">
                <MoonIcon className="mx-auto mb-1 h-4 w-4 text-gold" />
                <p className="font-serif text-sm font-semibold text-cream">{moonSign}</p>
                <p className="text-[10px] text-gold font-medium mt-0.5">{t("core_moon", lang)}</p>
                <p className="text-[9px] text-ash mt-1">{t("core_moon_desc", lang)}</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-3 text-center border border-white/5">
                <span className="mx-auto mb-1 block text-sm">✨</span>
                <p className="font-serif text-sm font-semibold text-cream">{ascSign}</p>
                <p className="text-[10px] text-amber-300 font-medium mt-0.5">{t("core_asc", lang)}</p>
                <p className="text-[9px] text-ash mt-1">{t("core_asc_desc", lang)}</p>
              </div>
            </div>
          </div>

          {/* Benefits of Profile Saved According to Birth Chart */}
          <div className="rounded-3xl glass-strong p-5 border border-gold/20">
            <ProfileBenefitsView />
          </div>
        </div>
      )}

      {/* Transits Tab: Relatable, Actionable Everyday Insights */}
      {tab === "Transits" && (
        <div className="animate-float-in space-y-3">
          <div className="rounded-2xl glass p-4 text-center border border-gold/20">
            <span className="text-xl">🌟</span>
            <h2 className="font-serif text-base text-cream mt-1 font-medium">
              {t("daily_influences", lang)}
            </h2>
            <p className="text-xs text-ash mt-0.5">
              {t("daily_influences_sub", lang)}
            </p>
          </div>

          {TRANSITS.length === 0 && (
            <button
              onClick={profile ? forecast.retry : astro.openProfile}
              className="w-full rounded-2xl glass p-5 text-sm text-ash hover:text-cream text-center"
            >
              {forecast.loading ? "Calculating daily celestial alignments..." : forecast.error || emptyTransitMessage}
            </button>
          )}

          {TRANSITS.map((t, idx) => (
            <div key={idx} className="flex gap-3 rounded-2xl glass p-4 border border-white/10 hover:border-gold/30 transition-all">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl shadow"
                style={{
                  background: `${t.tone}22`,
                  border: `1px solid ${t.tone}44`,
                  color: t.tone,
                }}
              >
                {t.glyph}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-serif text-cream text-sm font-medium">{t.title}</p>
                  <span className="text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                    {t.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-cream/80">{t.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panchang Tab: Meaningful Traditional Guidance */}
      {tab === "Panchang" && (
        <div className="animate-float-in space-y-4">
          <div className="rounded-3xl glass-strong p-5 text-center border border-gold/25">
            <p className="text-xs font-serif uppercase tracking-wider text-ash">{t("daily_panchang", lang)}</p>
            <p className="mt-1 font-display text-xl text-cream">
              {data?.date ?? "Your local day"}
            </p>
            <p className="font-serif text-sm text-gold mt-0.5">
              {data ? `${data.paksha} Paksha · ${data.place.name}` : panchang.error || "Select a birth profile to begin"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PANCHANG.map((p) => (
              <div key={p.k} className="rounded-2xl glass p-4 border border-white/10 hover:border-gold/30 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ember">
                    {p.k}
                  </p>
                </div>
                <p className="font-serif text-base font-medium text-cream mt-1">{p.v}</p>
                <p className="text-[11px] text-ash mt-1 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => astro.openReport("Muhurat")}
            className="w-full rounded-full border border-ember/40 py-3.5 font-serif text-ember-soft transition-colors hover:bg-ember/10 flex items-center justify-center gap-2 text-sm"
          >
            <span>{t("find_muhurat", lang)}</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
