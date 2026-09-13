import { useState } from "react";
import { api, type Birth, type Place, type Profile } from "./api";
import { useAstro } from "./AstroContext";

export default function ProfilePanel({ onBack, onSaved, draft, onDraft, guided = false, language = "en", onQuestion }: { guided?: boolean; language?: "en" | "hi"; onQuestion?: (text: string) => void; onBack: () => void; onSaved?: (profile: Profile) => void; draft?: Record<string,string>; onDraft?: (draft: Record<string,string>) => void }) {
  const astro = useAstro();
  const [birthStep, setBirthStep] = useState(0);
  const prompts = language === "hi" ? ["आपको किस नाम से पुकारें?", "आपकी जन्म तारीख क्या है?", "क्या आपको अपना जन्म समय पता है?", "आपका जन्म किस शहर में हुआ था?"] : ["What name should I call you?", "When were you born?", "Do you know your birth time?", "Which city were you born in?"];
  function moveBirth(step: number) { setBirthStep(step); onQuestion?.(prompts[step]); }

  const [editing, setEditing] = useState<string | null>(null);
  const [birth, updateBirth] = useState<Birth>({ name: draft?.name ?? "", gender: (draft?.gender as Birth["gender"]) ?? "unspecified", birth_date: draft?.birth_date ?? "", birth_time: draft?.birth_time ?? "", time_accuracy: (draft?.time_accuracy as Birth["time_accuracy"]) ?? "exact", uncertainty_minutes: Number(draft?.uncertainty_minutes) || 30, place_id: "", fold: null, preferred_system: astro.system });
  function setBirth(value: Birth) { updateBirth(value); onDraft?.({ name: value.name, gender: value.gender ?? "unspecified", birth_date: value.birth_date, birth_time: value.birth_time ?? "", time_accuracy: value.time_accuracy, uncertainty_minutes: String(value.uncertainty_minutes) }); }
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const field = "mt-2 w-full rounded-xl border border-ember/25 bg-[#0b271e] px-3 py-3 text-sm text-cream";
  function edit(p: Profile) { setEditing(p.id); setBirth(p.birth); setPlace(p.place); setQuery(p.place.name); setError(""); }
  async function search() {
    setSearching(true); setError(""); setResults([]);
    try {
      await api("/session", { method: "POST" });
      const response = await api<{ results: Place[]; online_enabled: boolean; attribution: string }>(`/places?q=${encodeURIComponent(query)}`);
      setResults(response.results);
      setNote(response.results.length ? response.attribution : response.online_enabled ? "No places found. Try the city and country." : "This place is not in the offline city list. Online place search can be enabled in the local service.");
    } catch (e) { setError((e as Error).message); } finally { setSearching(false); }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (guided && birthStep < 3) { moveBirth(birthStep + 1); return; }
    setBusy(true); setError("");
    try {
      await api("/session", { method: "POST" });
      const saved = await api<Profile>(editing ? `/profiles/${editing}` : "/profiles", { method: editing ? "PUT" : "POST", body: JSON.stringify({ ...birth, birth_time: birth.time_accuracy === "unknown" ? null : birth.birth_time }) });
      astro.selectProfile(saved.id); astro.setSystem(birth.preferred_system);
      // Advance using the saved response before refreshing the shared list,
      // which can replace this form while its async submit is still running.
      if (onSaved) { onSaved(saved); void astro.refresh(); }
      else { await astro.refresh(); onBack(); }
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setError("");
    try { await api(`/profiles/${id}`, { method: "DELETE" }); await astro.refresh(); setDeleting(null); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <section className="animate-float-in space-y-5 pb-4">
    <button onClick={() => guided && birthStep > 0 ? moveBirth(birthStep - 1) : onBack()} className="text-xs text-ash">← Back</button>
    <div className="text-center"><p className="ritual-eyebrow">A little about you</p><h2 className="font-display text-2xl text-cream">{guided ? prompts[birthStep] : editing ? "Edit birth details" : "Add a profile"}</h2><p className="mt-2 text-xs text-ash">A few details to make your reflection more personal.</p></div>
    {!guided && astro.profiles.length > 0 && <div className="rounded-3xl glass p-4 space-y-3">{astro.profiles.map(p => <div key={p.id} className="flex flex-wrap items-center gap-3 text-xs"><button className="flex-1 text-left text-cream" onClick={() => { astro.selectProfile(p.id); onBack(); }}>{p.birth.name}{astro.profile?.id === p.id ? " · Active" : ""}</button><button onClick={() => edit(p)} className="text-ember">Edit</button><button onClick={() => setDeleting(p.id)} className="text-ash">Delete</button>{deleting === p.id && <p className="w-full text-ash">Delete this saved birth profile? <button disabled={busy} onClick={() => void remove(p.id)} className="text-ember">Delete profile</button> · <button onClick={() => setDeleting(null)}>Cancel</button></p>}</div>)}</div>}
    <form onSubmit={save} className="rounded-3xl glass-strong p-5 space-y-4">
      {(!guided || birthStep === 0) && <>
      <label className="block text-xs text-ash">Name<input required maxLength={80} className={field} value={birth.name} onChange={e => setBirth({ ...birth, name: e.target.value })} autoComplete="given-name" /></label>
      <label className="block text-xs text-ash">Gender (optional)<select className={field} value={birth.gender ?? "unspecified"} onChange={e => setBirth({ ...birth, gender: e.target.value as Birth["gender"] })}><option value="unspecified">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option></select><span className="block mt-2 text-[10px]">Matches your guide automatically. You can change your guide anytime.</span></label>
      </>}
      {(!guided || birthStep === 1) && <>
      <label className="block text-xs text-ash">Date of birth<input required type="date" min="1900-01-01" max={new Date().toLocaleDateString("en-CA")} className={field} value={birth.birth_date} onChange={e => setBirth({ ...birth, birth_date: e.target.value })} /></label>
      </>}
      {(!guided || birthStep === 2) && <>
      <label className="block text-xs text-ash">Birth time accuracy<select className={field} value={birth.time_accuracy} onChange={e => setBirth({ ...birth, time_accuracy: e.target.value as Birth["time_accuracy"] })}><option value="exact">Exact recorded time</option><option value="approximate">Approximate time</option><option value="unknown">I don’t know</option></select></label>
      {birth.time_accuracy !== "unknown" && <label className="block text-xs text-ash">Local birth time<input required type="time" step="1" className={field} value={birth.birth_time ?? ""} onChange={e => setBirth({ ...birth, birth_time: e.target.value })} /></label>}
      {birth.time_accuracy === "approximate" && <label className="block text-xs text-ash">Time could be off by (minutes)<input type="number" required min={1} max={720} className={field} value={birth.uncertainty_minutes} onChange={e => setBirth({ ...birth, uncertainty_minutes: Number(e.target.value) })} /></label>}
      </>}
      {(!guided || birthStep === 3) && <>
      <label className="block text-xs text-ash">Birthplace<input className={field} value={query} placeholder="City or town, country" onChange={e => { setQuery(e.target.value); setPlace(null); setBirth({ ...birth, place_id: "" }); setResults([]); }} /></label>
      <button type="button" disabled={searching || query.trim().length < 2} className="w-full rounded-xl border border-ember/30 py-3 text-xs text-ember disabled:opacity-40" onClick={() => void search()}>{searching ? "Searching…" : "Find birthplace"}</button>
      {results.map(p => <button key={p.id} type="button" className="w-full rounded-xl glass px-3 py-3 text-left text-xs text-cream" onClick={() => { setPlace(p); setBirth({ ...birth, place_id: p.id }); setQuery(p.name); setResults([]); }}>{p.name}</button>)}
      {place && <p className="text-xs text-gold">✓ {place.name}</p>}
      {note && <p className="text-[10px] text-ash">{note.includes("OpenStreetMap") ? <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">{note}</a> : note}</p>}
      <details><summary className="text-xs text-ash cursor-pointer">Reading tradition (optional)</summary><label className="block text-xs text-ash mt-3">Preferred chart<select className={field} value={birth.preferred_system} onChange={e => setBirth({ ...birth, preferred_system: e.target.value as Birth["preferred_system"] })}><option value="vedic">Vedic · Lahiri sidereal</option><option value="western">Western · Tropical</option></select></label></details>
      {error.includes("occurred twice") && <label className="block text-xs text-ash">Clock-change occurrence<select className={field} value={birth.fold ?? ""} onChange={e => setBirth({ ...birth, fold: e.target.value === "" ? null : Number(e.target.value) as 0 | 1 })}><option value="">Choose recorded occurrence</option><option value="0">First occurrence</option><option value="1">Second occurrence</option></select></label>}
      <p className="text-[10px] leading-relaxed text-ash">Not sure of the time? Choose “I don’t know.” You can still continue; we’ll leave out details that need an exact time.</p>
      </>}
      <button disabled={busy || ((!guided || birthStep === 3) && !place)} className="palm-button">{guided && birthStep < 3 ? "Continue" : busy ? "Calculating your charts…" : "Save birth profile"}</button>
    </form>
    {(error || astro.error) && <p role="alert" className="rounded-xl glass p-3 text-xs text-ember-soft">{error || astro.error}</p>}
  </section>;
}
