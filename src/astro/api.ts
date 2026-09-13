export type System = "western" | "vedic";
export type Planet = { longitude: number | null; sign: string | null; degree_in_sign: number | null; retrograde: boolean | null; house: number | null; possible_signs?: string[]; estimated?: boolean; longitude_uncertainty_degrees?: number };
export type Aspect = { planet_a: string; planet_b: string; aspect: string; orb: number; applying: boolean; at?: string; estimated?: boolean; orb_uncertainty?: number };
export type Chart = { system: System; zodiac: string; signature: string; time_known: boolean; time_available?: boolean; time_accuracy: "exact" | "approximate" | "unknown"; planets: Record<string, Planet>; houses: { cusps: number[]; ascendant: number; midheaven: number; system: string } | null; aspects: Aspect[]; warnings: string[] };
export type Place = { id: string; name: string; lat: number; lon: number; timezone: string; source: string };
export type Birth = { name: string; gender?: "female" | "male" | "unspecified"; birth_date: string; birth_time: string | null; time_accuracy: "exact" | "approximate" | "unknown"; uncertainty_minutes: number; place_id: string; fold: 0 | 1 | null; preferred_system: System };
export type Profile = { id: string; birth: Birth; place: Place; charts: Record<System, Chart> };
export type Forecast = { date: string; system: System; source: string; reflections: string[]; statements: string[]; facts: { top_transits: Aspect[] }; snapshot: { at: string; planets: Record<string, Planet> }; uncertainty: string[]; sampling: string; period: string };
export type Panchang = { date: string; tithi: string; paksha: string; nakshatra: string; yoga: string; karana: string; sunrise: string | null; sunset: string | null; rahu_kaal: { start: string; end: string } | null; abhijit: { start: string; end: string; overlaps_rahu_kaal: boolean } | null; place: Place; warning: string | null; ends: Record<string, string | null> };
export type Kundali = { available: boolean; reason?: string; moon_nakshatra?: { name: string; pada: number }; divisions?: Record<string, { ascendant_sign: string; planets: Record<string, { sign: string; house: number }> }>; mangal?: Record<string, { house: number; present: boolean }>; kaal_sarp?: { present: boolean | null }; conventions?: string[] };
export type DashaPeriod = { lord: string; start: string; end: string; antardashas: { lord: string; start: string; end: string }[] };
export type Dashas = { available: boolean; reason?: string; year_days: number; birth_balance_years: number; periods: DashaPeriod[]; current: { mahadasha: string; antardasha: string; start: string; end: string; pratyantardashas: { lord: string; start: string; end: string; active: boolean }[] } | null };
export type Match = { names: string[]; western: { available: boolean; aspects: Aspect[]; reason: string | null }; vedic: { available: boolean; total: number | null; maximum: number; factors: { name: string; score: number; maximum: number }[]; reason?: string; convention: string; meaning: string }; kundali_a: Kundali; kundali_b: Kundali };

export async function api<T>(path: string, options: RequestInit = {}, sessionRetried = false): Promise<T> {
  const signal = options.signal ?? AbortSignal.timeout(45000);
  let response: Response;
  try {
    response = await fetch(`/api${path}`, { ...options, signal, credentials: "same-origin", headers: { "Content-Type": "application/json", ...options.headers } });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Error("Your astrology service is not connected. Please try again when it is available.");
  }
  if (!response.ok) {
    if (response.status === 401 && path !== "/session" && !sessionRetried) {
      try {
        const initSession = await fetch("/api/session", { method: "POST", credentials: "same-origin" });
        if (initSession.ok) {
          return await api<T>(path, options, true);
        }
      } catch {
        // Fall through to standard error handling
      }
    }
    const body = await response.json().catch(() => ({}));
    const detail = typeof body.detail === "string" ? body.detail : Array.isArray(body.detail) ? body.detail.map((e: { msg: string }) => e.msg).join(" ") : "Astrology calculation service is starting up or unavailable. Please retry.";
    throw new Error(detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const signs = "Aries Taurus Gemini Cancer Leo Virgo Libra Scorpio Sagittarius Capricorn Aquarius Pisces".split(" ");
export const glyphs: Record<string, string> = { Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇", Rahu: "☊", Ketu: "☋" };
export function signLabel(planet?: Planet) { return planet?.sign ?? planet?.possible_signs?.join(" / ") ?? "—"; }
export function clockLabel(value?: string | null, zone = "Asia/Kolkata") { return value ? new Date(value).toLocaleTimeString("en-IN", { timeZone: zone, hour: "2-digit", minute: "2-digit" }) : "Unavailable"; }
