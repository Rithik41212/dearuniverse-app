export type Sign = {
  name: string;
  sanskrit: string;
  glyph: string;
  dates: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  ruler: string;
  color: string; // accent
  gradient: [string, string];
  traits: string[];
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;
  lucky: { color: string; number: number; time: string };
};

export const SIGNS: Sign[] = [
  {
    name: "Aries", sanskrit: "Mesha", glyph: "♈", dates: "Mar 21 – Apr 19",
    element: "Fire", ruler: "Mars", color: "#f0913e", gradient: ["#f0913e", "#c74a2c"],
    traits: ["Bold", "Pioneering", "Restless"],
    daily: "Mars sharpens your instinct today — act on the idea you keep circling back to. A conversation before noon opens a door you thought was shut.",
    weekly: "The week rewards momentum over planning. Start the thing unfinished in your head; the details arrange themselves once you move.",
    monthly: "A season of firsts. New alliances form around your ambition, but guard your energy — not every fire needs your spark.",
    yearly: "Jupiter widens your horizon in matters of work and reputation. The year asks you to lead without burning those who follow.",
    lucky: { color: "Scarlet", number: 9, time: "6–8 AM" },
  },
  {
    name: "Taurus", sanskrit: "Vrishabha", glyph: "♉", dates: "Apr 20 – May 20",
    element: "Earth", ruler: "Venus", color: "#7bb661", gradient: ["#7bb661", "#3d6b34"],
    traits: ["Grounded", "Sensual", "Loyal"],
    daily: "Venus favours slow pleasures — a good meal, a long look, an unhurried decision. Wealth follows patience today, not haste.",
    weekly: "Money and self-worth intertwine this week. What you value quietly reshapes what you're willing to accept from others.",
    monthly: "Comfort becomes a compass. Build the routine you've resisted; stability is the luxury you're actually craving.",
    yearly: "Saturn tests your foundations so the lasting ones remain. By year's end you'll own what you once only rented.",
    lucky: { color: "Emerald", number: 6, time: "5–7 PM" },
  },
  {
    name: "Gemini", sanskrit: "Mithuna", glyph: "♊", dates: "May 21 – Jun 20",
    element: "Air", ruler: "Mercury", color: "#c78be0", gradient: ["#c78be0", "#7a4a9e"],
    traits: ["Curious", "Quick", "Dual"],
    daily: "Mercury quickens your tongue — say the clever thing, but let one truth stay unspoken. A message arrives that changes your plans for the better.",
    weekly: "Ideas multiply faster than hours. Pick the two worth your name and let the rest drift; scattered brilliance still scatters.",
    monthly: "Learning, siblings, and short journeys light up. A skill picked up on a whim becomes surprisingly useful.",
    yearly: "The year is a long conversation with yourself. Write it down — the version of you emerging deserves a record.",
    lucky: { color: "Amethyst", number: 5, time: "10 AM–Noon" },
  },
  {
    name: "Cancer", sanskrit: "Karka", glyph: "♋", dates: "Jun 21 – Jul 22",
    element: "Water", ruler: "Moon", color: "#e05a72", gradient: ["#e05a72", "#8e2b3e"],
    traits: ["Nurturing", "Intuitive", "Protective"],
    daily: "The Moon, your ruler, turns your feelings into a forecast. Trust the pull toward home; something there needs tending before you go far.",
    weekly: "Emotional tides run high — ride them, don't fight them. A family matter softens once you stop bracing for the worst.",
    monthly: "Roots and belonging take centre stage. You'll define what 'safe' means on your own terms this month.",
    yearly: "The year deepens your inner world. Old wounds surface not to hurt but to finally close.",
    lucky: { color: "Pearl White", number: 2, time: "9–11 PM" },
  },
  {
    name: "Leo", sanskrit: "Simha", glyph: "♌", dates: "Jul 23 – Aug 22",
    element: "Fire", ruler: "Sun", color: "#e8a13e", gradient: ["#f0c04a", "#b06a1e"],
    traits: ["Radiant", "Generous", "Proud"],
    daily: "The Sun crowns you today — be seen without demanding it. Your warmth accomplishes what your effort alone could not.",
    weekly: "Creativity and romance align. Make something, or someone, feel chosen; your attention is the gift this week.",
    monthly: "The spotlight finds you whether you seek it or not. Lead with heart and the applause becomes loyalty.",
    yearly: "A year of authorship — you stop waiting for permission to be central to your own story.",
    lucky: { color: "Golden", number: 1, time: "Noon–2 PM" },
  },
  {
    name: "Virgo", sanskrit: "Kanya", glyph: "♍", dates: "Aug 23 – Sep 22",
    element: "Earth", ruler: "Mercury", color: "#c9a24a", gradient: ["#d4b45e", "#7a6320"],
    traits: ["Precise", "Devoted", "Analytical"],
    daily: "Mercury tunes your eye for the flaw others miss. Fix one small thing perfectly and let it stand for the rest.",
    weekly: "Service and health ask for attention. The system you build now saves you a month of small chaos.",
    monthly: "Order becomes devotion. In caring for the details, you're really caring for someone — including yourself.",
    yearly: "The year refines rather than expands. You'll master what you already do, and mastery, this once, is enough.",
    lucky: { color: "Sandalwood", number: 5, time: "7–9 AM" },
  },
  {
    name: "Libra", sanskrit: "Tula", glyph: "♎", dates: "Sep 23 – Oct 22",
    element: "Air", ruler: "Venus", color: "#e8b04a", gradient: ["#f0c86a", "#a87824"],
    traits: ["Harmonious", "Fair", "Charming"],
    daily: "Venus asks for balance, not compromise. Choose the option that keeps your peace intact — even if it disappoints one person.",
    weekly: "Partnerships come into focus. The scales tip toward you when you finally state what you need out loud.",
    monthly: "Beauty and agreement guide the month. A negotiation you dreaded ends fairer than expected.",
    yearly: "A year of unions — of people, ideas, and the two halves of yourself long at odds.",
    lucky: { color: "Rose Gold", number: 6, time: "4–6 PM" },
  },
  {
    name: "Scorpio", sanskrit: "Vrishchika", glyph: "♏", dates: "Oct 23 – Nov 21",
    element: "Water", ruler: "Mars & Pluto", color: "#c74a3e", gradient: ["#d45a4a", "#6b1e1e"],
    traits: ["Intense", "Magnetic", "Transformative"],
    daily: "Power moves in silence today. Watch more than you speak; what you learn now, you'll use precisely later.",
    weekly: "A truth surfaces from the deep. Let it change you rather than defending the version of you it undoes.",
    monthly: "Transformation is the theme — shed what you've outgrown before it starts to rot.",
    yearly: "The year is a rebirth in slow motion. Trust the ending; it's clearing space for a self you haven't met.",
    lucky: { color: "Crimson", number: 8, time: "10 PM–Midnight" },
  },
  {
    name: "Sagittarius", sanskrit: "Dhanu", glyph: "♐", dates: "Nov 22 – Dec 21",
    element: "Fire", ruler: "Jupiter", color: "#e88a4a", gradient: ["#f0a45a", "#a8521e"],
    traits: ["Adventurous", "Honest", "Philosophical"],
    daily: "Jupiter widens the road — say yes to the invitation that scares you a little. Distance, real or mental, does you good today.",
    weekly: "The week wants a bigger question, not a faster answer. Follow curiosity past the edge of your usual map.",
    monthly: "Travel, study, and belief expand. A new philosophy replaces one you'd outgrown without noticing.",
    yearly: "A year of horizons. The freedom you chase turns out to be a truth you finally tell.",
    lucky: { color: "Turmeric", number: 3, time: "3–5 PM" },
  },
  {
    name: "Capricorn", sanskrit: "Makara", glyph: "♑", dates: "Dec 22 – Jan 19",
    element: "Earth", ruler: "Saturn", color: "#8a8f9c", gradient: ["#9aa0ad", "#4a4f5a"],
    traits: ["Ambitious", "Disciplined", "Enduring"],
    daily: "Saturn rewards the long game. One unglamorous task done today becomes tomorrow's quiet advantage.",
    weekly: "Career matters ask for patience over pressure. Climb steadily; the summit isn't going anywhere.",
    monthly: "Structure becomes freedom. The discipline you resent now is the reputation you'll thank later.",
    yearly: "A year of arrival. What you've built for a decade finally holds your full weight.",
    lucky: { color: "Slate", number: 8, time: "5–7 AM" },
  },
  {
    name: "Aquarius", sanskrit: "Kumbha", glyph: "♒", dates: "Jan 20 – Feb 18",
    element: "Air", ruler: "Saturn & Uranus", color: "#4aa8d4", gradient: ["#5ab4e0", "#1e5a7a"],
    traits: ["Visionary", "Independent", "Humane"],
    daily: "The unexpected favours you today — improvise. An idea that seems too strange is exactly the one to follow.",
    weekly: "Community and friendship spark. Your difference is the contribution; stop filing it down to fit.",
    monthly: "The future arrives early for you this month. Build for the version of the world you actually want.",
    yearly: "A year of reinvention — you trade belonging for authenticity and find you lost nothing worth keeping.",
    lucky: { color: "Aqua", number: 4, time: "8–10 PM" },
  },
  {
    name: "Pisces", sanskrit: "Meena", glyph: "♓", dates: "Feb 19 – Mar 20",
    element: "Water", ruler: "Jupiter & Neptune", color: "#7a8ad4", gradient: ["#8a9ae0", "#3a4a8e"],
    traits: ["Dreamy", "Compassionate", "Fluid"],
    daily: "Neptune blurs the line between wish and plan — write the dream down before it dissolves. Your intuition is early, not wrong.",
    weekly: "Creativity and rest both call. Let yourself drift; the answer you're chasing arrives when you stop.",
    monthly: "Spirit and imagination swell. A quiet practice — art, prayer, water — becomes your anchor this month.",
    yearly: "A year of surrender in the best sense. You stop swimming upstream and the current takes you somewhere kinder.",
    lucky: { color: "Sea Green", number: 7, time: "6–8 PM" },
  },
];
