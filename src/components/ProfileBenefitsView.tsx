import { useState } from "react";
import { useAstro } from "../astro/AstroContext";
import { getProfileBenefits, type BenefitCard } from "../astro/benefits";
import { t } from "../astro/i18n";

export function ProfileBenefitsView() {
  const astro = useAstro();
  const lang = astro.language;
  const profile = astro.profile;
  const [activeCategory, setActiveCategory] = useState<string>("all");

  if (!profile) return null;

  const benefits = getProfileBenefits(profile);

  const categories = [
    { id: "all", label: t("btn_all_gifts", lang) },
    { id: "superpower", label: t("btn_core_gifts", lang) },
    { id: "wealth", label: t("btn_wealth_gifts", lang) },
    { id: "relationship", label: t("btn_love_gifts", lang) },
    { id: "yoga", label: t("btn_yoga_gifts", lang) },
  ];

  const filteredBenefits = activeCategory === "all"
    ? benefits
    : benefits.filter((b) => b.category === activeCategory);

  return (
    <div className="space-y-4 pt-2">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <h2 className="font-serif text-lg font-medium text-cream">
              {t("benefits_heading", lang)}
            </h2>
          </div>
          <p className="text-xs text-ash">
            {t("benefits_sub", lang)}
          </p>
        </div>
        <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold text-gold">
          {benefits.length} {t("auspicious_assets", lang)}
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-serif transition-all ${
              activeCategory === cat.id
                ? "bg-gold text-[#12100c] font-semibold shadow-sm"
                : "bg-white/5 text-ash border border-white/10 hover:text-cream"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Benefits Cards Grid */}
      <div className="space-y-3">
        {filteredBenefits.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl glass p-4 border border-gold/20 transition-all hover:border-gold/40 hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/10 text-lg border border-gold/20">
                  {b.icon}
                </span>
                <div>
                  <h3 className="font-serif text-sm font-medium text-cream">
                    {b.title}
                  </h3>
                  <span className="inline-block text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full mt-0.5 border border-gold/20">
                    {b.badge}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded-xl bg-ember/10 p-2.5 border border-ember/20 text-ember-soft font-medium">
                🎯 {b.gift}
              </div>

              <p className="text-cream/80 leading-relaxed pt-1">
                {b.whyItMatters}
              </p>

              <div className="flex items-start gap-1.5 pt-1 text-[11px] text-ash">
                <span className="text-gold shrink-0">✦</span>
                <span><strong className="text-cream/90">How to activate:</strong> {b.practicalTip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
