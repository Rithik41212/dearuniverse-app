import { useEffect, useState } from "react";

const temples = Object.entries(import.meta.glob("../templeimages/*.png", {
  eager: true, query: "?url", import: "default",
})).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([, url]) => url as string);

export default function TempleBackground({ page }: { page: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!document.hidden && !motion.matches) setIndex((i) => (i + 1) % temples.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { setIndex((i) => (i + 1) % temples.length); }, [page]);
  return (
    <div className="temple-background" aria-hidden="true">
      {temples.map((src, i) => (i === index || i === (index + temples.length - 1) % temples.length || i === (index + 1) % temples.length) && (
        <img key={src} src={src} alt="" decoding="async" loading={i === index ? "eager" : "lazy"}
          className={i === index ? "temple-image is-active" : "temple-image"} />
      ))}
      <div className="temple-veil" />
    </div>
  );
}
