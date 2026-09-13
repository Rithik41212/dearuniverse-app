import { useState } from "react";
import { api, clockLabel, type Panchang, type Match, type Kundali, type Dashas, type Profile } from "./api";
import { useAstro, useResource, useForecast } from "./AstroContext";
import { ChartWheel } from "../components/ChartWheel";
import { SegTabs } from "../components/SegTabs";

const dateLabel = (v: string) => new Date(v).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
export default function ReportPanel({ onBack, initialMode = "Birth chart" }: { onBack: () => void; initialMode?: string }) {
  const astro = useAstro();
  const [mode, setMode] = useState(initialMode);
  const [partner, setPartner] = useState("");
  const [orientation, setOrientation] = useState("a_to_b");
  const [match, setMatch] = useState<Match | null>(null);
  const [group, setGroup] = useState<string[]>([]);
  const [pairs, setPairs] = useState<Match[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [event, setEvent] = useState<Profile | null>(null);
  const p = astro.profile;
  const revision = p?.charts.vedic.signature;
  const k = useResource<Kundali>(p && ["Kundali", "Doshas"].includes(mode) ? `/profiles/${p.id}/kundali?revision=${revision}` : null);
  const d = useResource<Dashas>(p && mode === "Dashas" ? `/profiles/${p.id}/dashas?revision=${revision}` : null);
  const forecast = useForecast();
  const onboarding = useResource<{ facts: string[]; steps: { title: string; text: string }[]; warnings: string[] }>(p && mode === "Life reading" ? `/profiles/${p.id}/onboarding-funnel?system=${astro.system}&revision=${revision}` : null);
  const almanac = useResource<Panchang>(p && mode === "Muhurat" ? `/panchang?place_id=${encodeURIComponent(p.place.id)}` : null);
  const card = "rounded-3xl glass-strong p-5 space-y-3";
  const select = "w-full rounded-xl border border-ember/25 bg-[#17110d] p-3 text-xs text-cream";
  async function compare() {
    if (!p || !partner) return;
    setBusy(true); setError(""); setMatch(null);
    try { setMatch(await api<Match>("/compatibility", { method: "POST", body: JSON.stringify({ profile_a: p.id, profile_b: partner, orientation }) })); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function compareGroup() {
    setBusy(true); setError(""); setPairs([]);
    try { setPairs((await api<{ pairs: Match[] }>("/compatibility/group", { method: "POST", body: JSON.stringify({ profile_ids: group }) })).pairs); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function prashna() {
    if (!p) return;
    setBusy(true); setError("");
    try { setEvent(await api<Profile>(`/prashna?place_id=${encodeURIComponent(p.place.id)}`, { method: "POST" })); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  function download() {
    if (!p) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(p, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "my-birth-chart.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const matching = (m: Match) => <div className={card} key={m.names.join("|")}><h2 className="font-serif text-xl text-gold">{m.names.join(" & ")}</h2><p className="text-sm text-cream">{m.vedic.available ? `${m.vedic.total} / 36 traditional matching points` : m.vedic.reason}</p>{m.vedic.factors.map(f => <div key={f.name} className="flex justify-between border-b border-white/5 pb-2 text-xs"><span className="text-ash">{f.name}</span><span>{f.score} / {f.maximum}</span></div>)}<p className="text-[10px] text-ash">Base North Indian rules; regional exceptions and cancellations are not applied. This is not a probability of relationship success.</p><h3 className="font-serif text-gold">Western synastry</h3>{!m.western.available && <p className="text-xs text-ash">{m.western.reason}</p>}{m.western.aspects.slice(0, 12).map((a, i) => <p key={i} className="text-xs text-cream/80">{a.planet_a} {a.aspect.toLowerCase()} {a.planet_b} · {a.orb.toFixed(2)}°</p>)}</div>;
  async function setTimeToExact() {
    if (!p) return;
    setBusy(true); setError("");
    try {
      const updatedBirth = {
        ...p.birth,
        time_accuracy: "exact",
        uncertainty_minutes: p.birth.uncertainty_minutes || 30,
        birth_time: p.birth.birth_time || "12:00:00"
      };
      await api(`/profiles/${p.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedBirth)
      });
      await astro.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const renderTimeWarning = (reason?: string) => {
    if (!p) return null;
    return (
      <div className={`${card} border border-amber-500/30 bg-gradient-to-b from-[#1c1510] to-[#120e0b]`}>
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="space-y-1">
            <h3 className="font-serif text-base text-gold">Exact Birth Time Required</h3>
            <p className="text-xs text-ash leading-relaxed">{reason}</p>
            {p.birth.birth_time && (
              <p className="text-[11px] text-cream/70">
                Recorded time: <span className="font-mono text-gold">{p.birth.birth_time}</span> (currently set to <em>{p.birth.time_accuracy}</em>)
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void setTimeToExact()}
            className="w-full rounded-xl bg-gradient-to-r from-ember to-amber-600 px-4 py-2.5 text-xs font-semibold text-[#12100c] shadow-md shadow-ember/25 transition-transform active:scale-98 hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Updating Profile..." : `✦ Use ${p.birth.birth_time || "Recorded Time"} as Exact & Calculate`}
          </button>
          <button
            type="button"
            onClick={astro.openProfile}
            className="text-center text-xs text-ash underline hover:text-cream"
          >
            Or adjust birth details in profile editor
          </button>
        </div>
      </div>
    );
  };

  return <section className="animate-float-in space-y-5 pb-4">
    <button onClick={onBack} className="text-xs text-ash">← Back</button>
    <div className="text-center"><p className="ritual-eyebrow">A closer look at your sky</p><h1 className="font-display text-2xl text-cream">{mode}</h1><p className="mt-1 text-xs text-ash">{p?.birth.name ?? "Your personal report"}</p></div>
    {!p ? <div className={card}><p className="text-sm text-ash">Add your birth details to see your calculated chart and readings.</p><button className="palm-button" onClick={astro.openProfile}>Add a profile</button>{astro.error && <p role="alert" className="text-xs text-ember">{astro.error}</p>}</div> : <>
      <div className="grid grid-cols-2 gap-3"><select aria-label="Active birth profile" className={select} value={p.id} onChange={e => { astro.selectProfile(e.target.value); setMatch(null); setEvent(null); }} >{astro.profiles.map(v => <option key={v.id} value={v.id}>{v.birth.name}</option>)}</select><select aria-label="Astrology system" className={select} value={astro.system} onChange={e => astro.setSystem(e.target.value as "western" | "vedic")}><option value="vedic">Vedic · Lahiri</option><option value="western">Western · Tropical</option></select></div>
      <div className="no-scrollbar overflow-x-auto [&_button]:whitespace-nowrap"><SegTabs tabs={["Birth chart", "Daily forecast", "Kundali", "Dashas", "Compatibility", "Life reading"]} active={mode} onChange={setMode} size="sm" /></div>
      {mode === "Life reading" && <div className={card}>{onboarding.data?.facts.map(f => <p key={f} className="text-xs text-gold">{f}</p>)}{onboarding.data?.steps.map(s => <div key={s.title}><h2 className="font-serif text-xl text-gold">{s.title}</h2><p className="mt-2 text-sm text-cream/80">{s.text}</p></div>)}{onboarding.loading && <p className="text-xs text-ash">Preparing your reading…</p>}{onboarding.error && <p role="alert" className="text-xs text-ember">{onboarding.error}</p>}</div>}
      {mode === "Birth chart" && <div className={card}><ChartWheel /><button className="text-xs text-ember" onClick={download}>Download my birth chart</button><button className="ml-4 text-xs text-ash" onClick={astro.openProfile}>Edit details</button>{p.charts[astro.system].warnings.map(w => <p key={w} className="text-xs text-ash">{w}</p>)}</div>}
      {mode === "Daily forecast" && <div className={card}><p className="text-xs text-gold">{forecast.data?.date}</p>{forecast.data?.statements.map(t => <p key={t} className="text-xs text-gold">{t}</p>)}{forecast.data?.reflections.map(t => <p key={t} className="font-serif text-base leading-relaxed">{t}</p>)}{forecast.error && <p role="alert" className="text-xs text-ash">{forecast.error} <button onClick={forecast.retry} className="text-ember">Retry</button></p>}{forecast.loading && <p className="text-xs text-ash">Preparing your reading…</p>}</div>}
      {["Kundali", "Doshas"].includes(mode) && k.data && <>
        {!k.data.available ? renderTimeWarning(k.data.reason) : <>
          <div className={card}><h2 className="font-serif text-xl text-gold">{k.data.moon_nakshatra?.name}</h2><p className="text-xs text-ash">Moon nakshatra · Pada {k.data.moon_nakshatra?.pada} · Lahiri</p></div>
          {mode === "Kundali" && Object.entries(k.data.divisions ?? {}).map(([name, chart]) => <div key={name} className={card}><h2 className="font-serif text-xl text-gold">{name} · {name === "D1" ? "Rashi" : name === "D9" ? "Navamsa" : "Dashamsa"}</h2><p className="text-xs text-ash">Rising · {chart.ascendant_sign}</p><div className="grid grid-cols-3 gap-2">{Object.entries(chart.planets).map(([planet, value]) => <div key={planet} className="rounded-xl bg-white/5 p-2 text-center"><p className="text-[10px] text-ember">{planet}</p><p className="font-serif text-sm">{value.sign}</p><p className="text-[9px] text-ash">House {value.house}</p></div>)}</div></div>)}
          <div className={card}><h2 className="font-serif text-xl text-gold">Traditional indicators</h2>{Object.entries(k.data.mangal ?? {}).map(([base, value]) => <p key={base} className="text-xs text-ash">Mangal from {base}: {value.present ? "Present" : "Not present"} · Mars in house {value.house}</p>)}<p className="text-xs text-ash">Kaal Sarp enclosure: {k.data.kaal_sarp?.present === null ? "Near boundary" : k.data.kaal_sarp?.present ? "Present" : "Not present"}</p><p className="text-[10px] text-ash">Indicators under the stated rules, without cancellation rules or predictions of harm.</p></div>
        </>}
      </>}
      {mode === "Dashas" && d.data && <>{!d.data.available ? renderTimeWarning(d.data.reason) : <><div className={card}><p className="text-xs text-ash">Current Vimshottari period</p><h2 className="font-serif text-xl text-gold">{d.data.current ? `${d.data.current.mahadasha} / ${d.data.current.antardasha}` : "Outside available timeline"}</h2><p className="text-[10px] text-ash">Sidereal year: {d.data.year_days} days · Birth balance: {d.data.birth_balance_years.toFixed(3)} years</p>{d.data.current?.pratyantardashas.filter(t => t.active).map(t => <p key={t.lord} className="text-xs text-cream">Pratyantardasha: {t.lord} · until {dateLabel(t.end)}</p>)}</div>{d.data.periods.map(v => <details className={card} key={v.start}><summary className="cursor-pointer font-serif text-gold">{v.lord}<span className="ml-2 text-[10px] text-ash">{dateLabel(v.start)} – {dateLabel(v.end)}</span></summary>{v.antardashas.map(a => <p key={a.start} className="text-xs text-ash">{a.lord} · {dateLabel(a.start)} – {dateLabel(a.end)}</p>)}</details>)}</>}</>}
      {mode === "Compatibility" && <><div className={card}><label className="block text-xs text-ash">Compare with<select aria-label="Partner profile" className={`${select} mt-2`} value={partner} onChange={e => { setPartner(e.target.value); setMatch(null); }}><option value="">Choose another saved profile</option>{astro.profiles.filter(v => v.id !== p.id).map(v => <option key={v.id} value={v.id}>{v.birth.name}</option>)}</select></label><label className="block text-xs text-ash">Traditional matching direction<select className={`${select} mt-2`} value={orientation} onChange={e => { setOrientation(e.target.value); setMatch(null); }}><option value="a_to_b">Active profile in traditional groom role</option><option value="b_to_a">Partner in traditional groom role</option></select></label><button className="palm-button" disabled={busy || !partner || partner === p.id} onClick={() => void compare()}>{busy ? "Comparing charts…" : "Compare birth charts"}</button><button className="text-xs text-ember" onClick={astro.openProfile}>Add partner’s birth details</button></div>{match && matching(match)}</>}
      {mode === "Group compatibility" && <><div className={card}>{astro.profiles.map(v => <label key={v.id} className="flex gap-3 text-sm"><input type="checkbox" checked={group.includes(v.id)} onChange={() => { setPairs([]); setGroup(group.includes(v.id) ? group.filter(i => i !== v.id) : [...group, v.id]); }} />{v.birth.name}</label>)}<button className="palm-button" disabled={busy || group.length < 2 || group.length > 8} onClick={() => void compareGroup()}>Compare selected profiles</button></div>{pairs.map(matching)}</>}
      {mode === "Prashna Kundali" && <><div className={card}><p className="text-xs text-ash">Cast a chart for the current moment at {p.place.name}. Use a profile with the correct location for your question.</p><button disabled={busy} className="palm-button" onClick={() => void prashna()}>Cast the moment’s chart</button></div>{event && <div className={card}><p className="text-xs text-ash">{event.birth.birth_date} · {event.birth.birth_time}</p><ChartWheel chart={event.charts[astro.system]} /></div>}</>}
      {mode === "Muhurat" && <div className={card}><p className="text-xs text-ash">{p.place.name} · {almanac.data?.date}</p><h2 className="font-serif text-xl text-gold">Abhijit window</h2><p className="text-sm">{almanac.data?.abhijit ? `${clockLabel(almanac.data.abhijit.start, p.place.timezone)} – ${clockLabel(almanac.data.abhijit.end, p.place.timezone)}` : almanac.loading ? "Calculating…" : "Unavailable today under this convention"}</p><p className="text-xs text-ash">The eighth of fifteen daylight divisions; excluded on Wednesdays. This general traditional window is not a personalized election for a particular event.</p>{almanac.data?.abhijit?.overlaps_rahu_kaal && <p className="text-xs text-ember">This window overlaps Rahu Kaal.</p>}<h3 className="font-serif text-gold">Panchang transitions</h3>{Object.entries(almanac.data?.ends ?? {}).map(([name, end]) => <p key={name} className="text-xs text-ash">{name}: ends {end ? new Date(end).toLocaleString("en-IN", { timeZone: p.place.timezone }) : "Unavailable"}</p>)}{almanac.error && <p role="alert" className="text-xs text-ember">{almanac.error}</p>}</div>}
      {(k.loading || d.loading) && <p className="text-center text-xs text-ash">Calculating your report…</p>}
      {(error || k.error || d.error) && <p role="alert" className="rounded-xl glass p-3 text-xs text-ember">{error || k.error || d.error}</p>}
    </>}
  </section>;
}
