import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Profile, type System, type Forecast } from "./api";
import { type Language } from "./i18n";

type AstroState = {
  profiles: Profile[];
  profile: Profile | null;
  system: System;
  setSystem: (value: System) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  voiceLanguage: Language;
  setVoiceLanguage: (lang: Language) => void;
  selectProfile: (id: string) => void;
  refresh: () => Promise<void>;
  error: string;
  loading: boolean;
  openProfile: () => void;
  openReport: (mode?: string) => void;
  setOpeners: (openers: { profile: () => void; report: (mode?: string) => void }) => void;
};
const AstroContext = createContext<AstroState | null>(null);

function readSaved(key: string, fallback: string) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } }
export default function AstroProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [active, setActive] = useState(() => readSaved("astro-active", ""));
  const [system, updateSystem] = useState<System>(() => readSaved("astro-system", "vedic") === "western" ? "western" : "vedic");
  const [language, updateLanguage] = useState<Language>(() => (readSaved("astro-language", "en") as Language));
  const [voiceLanguage, updateVoiceLanguage] = useState<Language>(() => (readSaved("astro-voice-language", "en") as Language));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openers, setOpeners] = useState({ profile: () => {}, report: (_mode?: string) => {} });
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      for (let attempt = 0; ; attempt++) {
        try {
          await api("/session", { method: "POST" });
          setProfiles(await api<Profile[]>("/profiles")); setError(""); break;
        } catch (e) {
          if (attempt >= 4) throw e;
          await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
        }
      }
    }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load profiles"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const profile = profiles.find(p => p.id === active) ?? profiles[0] ?? null;
  function selectProfile(id: string) { setActive(id); try { localStorage.setItem("astro-active", id); } catch { /* Optional preference. */ } }
  function setSystem(value: System) { updateSystem(value); try { localStorage.setItem("astro-system", value); } catch { /* Optional preference. */ } }
  function setLanguage(val: Language) { updateLanguage(val); try { localStorage.setItem("astro-language", val); } catch { /* Optional preference. */ } }
  function setVoiceLanguage(val: Language) { updateVoiceLanguage(val); try { localStorage.setItem("astro-voice-language", val); } catch { /* Optional preference. */ } }
  return <AstroContext.Provider value={{ profiles, profile, system, setSystem, language, setLanguage, voiceLanguage, setVoiceLanguage, selectProfile, refresh, error, loading, openProfile: openers.profile, openReport: openers.report, setOpeners }}>{children}</AstroContext.Provider>;
}
export function useAstro() { const value = useContext(AstroContext); if (!value) throw new Error("AstroProvider missing"); return value; }

export function useResource<T>(path: string | null) {
  const [state, setState] = useState<{ path: string | null; data: T | null; error: string; loading: boolean }>({ path: null, data: null, error: "", loading: false });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!path) { setState({ path, data: null, error: "", loading: false }); return; }
    const controller = new AbortController();
    setState({ path, data: null, error: "", loading: true });
    api<T>(path, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(45000)]) }).then(data => {
      if (!controller.signal.aborted) setState({ path, data, error: "", loading: false });
    }).catch(e => { if (!controller.signal.aborted) setState({ path, data: null, error: e.message, loading: false }); });
    return () => controller.abort();
  }, [path, retry]);
  return { ...(state.path === path ? state : { data: null, error: "", loading: !!path }), retry: () => setRetry(v => v + 1) };
}
export function useForecast(period = "day") {
  const { profile, system } = useAstro();
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  const [day, setDay] = useState(() => new Date().toLocaleDateString("en-CA"));
  useEffect(() => { const timer = setInterval(() => setDay(new Date().toLocaleDateString("en-CA")), 60000); return () => clearInterval(timer); }, []);
  // Signature query changes the resource identity immediately when birth details are edited.
  return useResource<Forecast>(profile ? `/profiles/${profile.id}/forecast?system=${system}&period=${period}&tz=${encodeURIComponent(zone)}&revision=${profile.charts[system].signature}&calculation=approximate-transits-v1&local_day=${day}` : null);
}
