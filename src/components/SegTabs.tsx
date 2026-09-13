type Props = {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
  size?: "sm" | "md";
  labels?: Record<string, string>;
};

/** Glass segmented pill toggle (Today / This week / This year). */
export function SegTabs({ tabs, active, onChange, size = "md", labels }: Props) {
  return (
    <div className="inline-flex rounded-full glass p-1">
      {tabs.map((t) => {
        const on = t === active;
        const displayText = labels?.[t] ?? t;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`rounded-full font-medium transition-all duration-300 ${
              size === "sm" ? "px-4 py-1.5 text-xs" : "px-5 py-2 text-sm"
            } ${
              on
                ? "bg-gradient-to-b from-ember-soft to-ember text-[#12100c] shadow-[0_4px_16px_rgba(240,145,62,0.4)]"
                : "text-ash hover:text-cream"
            }`}
          >
            {displayText}
          </button>
        );
      })}
    </div>
  );
}
