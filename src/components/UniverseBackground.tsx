import CelestialArt from "./CelestialArt"
import { Starfield } from "./Starfield"
import "./universe.css"

/** Code-native, gently moving celestial artwork; no image downloads. */
export default function UniverseBackground({
  immersive = false,
}: {
  immersive?: boolean
}) {
  return (
    <div
      className={`universe-background ${immersive ? "universe-immersive" : ""}`}
      aria-hidden="true"
    >
      <div className="universe-nebula" />
      <div className="universe-texture" />
      <div className="universe-stars">
        <Starfield />
      </div>
      <div className="universe-wheel">
        <CelestialArt wheel />
      </div>
      <div className="universe-planet" />
      <svg className="universe-constellation" viewBox="0 0 420 780" fill="none">
        <g stroke="currentColor" strokeWidth=".7">
          <path d="M32 95 106 61 168 128 125 214 53 177ZM285 501 360 453 387 553 320 629 244 593Z" />
          <path
            d="m106 61 19 153M285 501l35 128M38 618l30 56 50-28 29 87"
            strokeDasharray="2 7"
          />
          <circle cx="330" cy="133" r="24" />
          <path d="M340 111a24 24 0 0 0 0 44 24 24 0 1 1 0-44Z" />
        </g>
        {[
          [32, 95],
          [106, 61],
          [168, 128],
          [125, 214],
          [53, 177],
          [285, 501],
          [360, 453],
          [387, 553],
          [320, 629],
          [244, 593],
          [38, 618],
          [68, 674],
          [118, 646],
          [147, 733],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i % 3 ? 1.7 : 3}
            fill="currentColor"
          />
        ))}
      </svg>
    </div>
  )
}
