export type Astrologer = {
  name: string;
  specialty: string;
  years: number;
  photo: string;
  rate: number; // per minute
  languages: string;
};

const p = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&crop=faces&auto=format&q=80`;

export const ASTROLOGERS: Astrologer[] = [
  { name: "Emma Anderson", specialty: "Election Astrology", years: 5, photo: p("1617633150878-7df1d12a9a57"), rate: 24, languages: "English · Hindi" },
  { name: "Ravi Sharma", specialty: "Vedic & Kundali", years: 12, photo: p("1535270732370-dd3188bab1da"), rate: 40, languages: "Hindi · Sanskrit" },
  { name: "Priya Nair", specialty: "Love & Relationships", years: 8, photo: p("1622207691293-5cd80466dab3"), rate: 30, languages: "English · Tamil" },
  { name: "Aarav Deshmukh", specialty: "Career & Finance", years: 15, photo: p("1648817976768-a2fdcba20f9a"), rate: 45, languages: "Hindi · Marathi" },
  { name: "Meera Iyer", specialty: "Palmistry & Numerology", years: 10, photo: p("1716504628084-97224213ca6d"), rate: 35, languages: "English · Telugu" },
];
