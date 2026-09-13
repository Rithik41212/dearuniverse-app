type Props = {
  value: number; // 0-100
  label: string;
  color?: string;
  displayText?: string;
};

/** Circular progress meter used for Love / Friendship / Work cards. */
export function RingMeter({ value, label, color = "#f0913e", displayText }: Props) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[76px] w-[76px]">
        <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="5" />
          <circle
            cx="38"
            cy="38"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            style={{ filter: `drop-shadow(0 0 5px ${color}66)`, transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-lg font-semibold text-cream">
          {displayText ?? `${value}%`}
        </span>
      </div>
      <span className="text-xs text-ash">{label}</span>
    </div>
  );
}
