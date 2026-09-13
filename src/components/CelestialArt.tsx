export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
]
export const SYMBOLS = [
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
].map(symbol => `${symbol}\uFE0E`)

export default function CelestialArt({
  variant = 0,
  wheel = false,
  className = "",
}: {
  variant?: number
  wheel?: boolean
  className?: string
}) {
  return (
    <svg
      viewBox={wheel ? "0 0 240 240" : "0 0 240 380"}
      fill="none"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth=".7"
    >
      {!wheel && (
        <>
          <rect x="9" y="9" width="222" height="362" rx="15" />
          <rect
            x="15"
            y="15"
            width="210"
            height="350"
            rx="11"
            strokeOpacity=".4"
          />
          {[25, 215].flatMap((x) =>
            [25, 355].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />
            )),
          )}
        </>
      )}
      <g transform={`translate(120 ${wheel ? 120 : 122})`}>
        <circle r="101" strokeOpacity=".5" />
        <circle r="96" strokeDasharray="1 3" />
        <circle r="87" />
        {Array.from({ length: 48 }, (_, i) => (
          <path
            key={i}
            d={i % 2 ? "M0 -49 L0 -78" : "M-3 -48 L0 -83 L3 -48"}
            transform={`rotate(${i * 7.5})`}
            strokeOpacity={i % 2 ? 0.4 : 0.9}
          />
        ))}
        <circle r="45" />
        <circle r="40" strokeOpacity=".4" />
        {variant % 3 === 1 ? (
          <>
            <path
              d="M16 -27 A32 32 0 1 0 16 27 A27 27 0 0 1 16 -27Z"
              fill="currentColor"
              fillOpacity=".18"
            />
            <path d="M20 -12 L23 -3 L32 0 L23 3 L20 12 L17 3 L8 0 L17 -3Z" />
          </>
        ) : variant % 3 === 2 ? (
          <>
            <path d="M-34 0 Q0 -35 34 0 Q0 35 -34 0Z" />
            <circle r="12" />
            <circle r="4" fill="currentColor" />
          </>
        ) : (
          <>
            <path d="M-26 -8 Q-16 -17 -6 -8 M6 -8 Q16 -17 26 -8 M-16 -7 L-16 -3 M16 -7 L16 -3 M0 -9 L-4 10 L4 10 M-12 21 Q0 29 12 21" />
            <path d="M0 -40 L4 -31 L0 -25 L-4 -31Z" />
          </>
        )}
        {wheel &&
          SYMBOLS.map((s, i) => (
            <g key={s} transform={`rotate(${i * 30})`}>
              <path d="M0 -87 V-101" />
              <text
                transform={`translate(0 -69) rotate(${-i * 30})`}
                stroke="none"
                fill="currentColor"
                textAnchor="middle"
                fontSize="13"
              >
                {s}
              </text>
            </g>
          ))}
      </g>
      {!wheel && (
        <>
          <path
            d="M163 241 A55 55 0 1 1 77 241 A44 44 0 0 0 163 241Z"
            fill="currentColor"
            fillOpacity=".14"
          />
          <circle cx="120" cy="277" r="65" strokeOpacity=".4" />
          <path d="M120 224 L124 238 L138 242 L124 246 L120 260 L116 246 L102 242 L116 238Z" />
          <path
            d="M120 308 V349 M94 307 V335 M146 307 V335"
            strokeDasharray="1 4"
          />
          <circle cx="120" cy="351" r="3" />
          {Array.from({ length: 28 }, (_, i) => (
            <circle
              key={i}
              cx={28 + ((i * 67) % 183)}
              cy={35 + ((i * 43) % 302)}
              r={i % 4 ? 0.7 : 1.6}
              fill="currentColor"
              stroke="none"
              opacity=".6"
            />
          ))}
        </>
      )}
    </svg>
  )
}
