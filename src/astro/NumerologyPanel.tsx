import type { CSSProperties } from "react";
import { useAstro, useResource } from "./AstroContext";

type NumberValue = { value: number; sum: number; steps: number[]; theme: string; practice: string };
export type Numbers = { name: string; system: string; convention: string; notice: string; name_notice: string | null; letters: { letter: string; value: number; vowel: boolean }[]; life_path: NumberValue; destiny: NumberValue | null; soul_urge: NumberValue | null; personal_year: NumberValue; personality: NumberValue | null; birthday: NumberValue };

export function NumberReveal({ data, compact = false }: { data: Numbers; compact?: boolean }) {
  return (
    <div className={`number-reveal ${compact ? "compact-number-reveal" : ""}`}>
      <p className="journey-eyebrow">✦ Your cosmic numbers ✦</p>
      <div className="number-trinity">
        {([["Life Path", data.life_path], ["Destiny", data.destiny], ["Soul Urge", data.soul_urge]] as const).map(
          ([label, n]) => (
            <div className="number-medallion" key={label}>
              <span>{label}</span>
              <strong>{n?.value ?? "—"}</strong>
              <small>{n?.theme ?? "Name spelling needed"}</small>
            </div>
          )
        )}
      </div>
      {!compact && (
        <>
          <p className="journey-caption">Name analysis · {data.name}</p>
          <div className="number-letters" aria-label="Letter values">
            {data.letters.map((l, i) => (
              <span key={i} style={{ "--letter-index": i } as CSSProperties} className={l.vowel ? "is-vowel" : ""}>
                {l.letter}
                <small>{l.value}</small>
              </span>
            ))}
          </div>
          <div className="number-calculations">
            {([["Life Path", data.life_path], ["Destiny", data.destiny], ["Soul Urge", data.soul_urge], ["Personal Year", data.personal_year]] as const).map(
              ([name, n]) => n && <p key={name}><span>{name}</span><b>{n.steps.join(" → ")}</b></p>
            )}
          </div>
          {data.name_notice && <p className="journey-caption">{data.name_notice}</p>}
          <details><summary>How your numbers are calculated</summary><p>{data.convention}</p><p>{data.notice}</p></details>
        </>
      )}
    </div>
  );
}

export default function NumerologyPanel({ onBack }: { onBack: () => void }) {
  const astro = useAstro();
  const result = useResource<Numbers>(astro.profile ? `/profiles/${astro.profile.id}/numerology?revision=${astro.profile.charts.vedic.signature}` : null);
  return <section className="journey-content"><button className="journey-link" onClick={onBack}>← Back</button><h1>Your numbers, revealed</h1>{result.data ? <NumberReveal data={result.data} /> : result.error ? <><p role="alert">{result.error}</p><button className="palm-button" onClick={result.retry}>Retry</button></> : astro.profile ? <p>Calculating your numbers…</p> : <button className="palm-button" onClick={astro.openProfile}>Add birth details</button>}</section>;
}
