import { useMemo } from "react";

/** Ambient starfield + drifting nebula glow for the app canvas. */
export function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.6,
        delay: Math.random() * 4,
        dur: Math.random() * 3 + 2,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* warm nebula washes */}
      <div
        className="absolute -top-24 -right-16 h-72 w-72 rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(240,145,62,0.28), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -left-20 h-64 w-64 rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(199,74,62,0.22), transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(122,74,158,0.18), transparent 70%)" }}
      />
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
