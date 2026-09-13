import { type Chart, type Profile, signs } from "./api";

export type BenefitCard = {
  id: string;
  category: "superpower" | "wealth" | "relationship" | "growth" | "yoga";
  title: string;
  badge: string;
  gift: string;
  whyItMatters: string;
  practicalTip: string;
  icon: string;
};

export type PlanetMeaning = {
  archetype: string;
  coreStrength: string;
  detailedBlessing: string;
  lifeAdvice: string;
};

export const HOUSE_TITLES: Record<number, { title: string; theme: string }> = {
  1: { title: "1st House of Self & Magnetic Aura", theme: "Personal vitality, individuality, and natural leadership presence." },
  2: { title: "2nd House of Wealth & Family Legacy", theme: "Prosperity creation, speaking power, and lasting financial foundation." },
  3: { title: "3rd House of Courage & Creative Enterprise", theme: "Bold initiative, communication mastery, and agile intellect." },
  4: { title: "4th House of Emotional Peace & Foundations", theme: "Inner serenity, grounded happiness, real estate, and emotional stability." },
  5: { title: "5th House of Brilliance & Auspicious Luck", theme: "Creative genius, strategic foresight, joy, and positive karmic returns." },
  6: { title: "6th House of Victory & Problem Mastery", theme: "Stamina to overcome any hurdle, disciplined habits, and competitive triumph." },
  7: { title: "7th House of Sacred Union & Public Magnetism", theme: "Harmonious partnerships, magnetic charisma, and mutual empowerment." },
  8: { title: "8th House of Transformation & Inner Power", theme: "Psychological resilience, intuitive breakthroughs, and transformative growth." },
  9: { title: "9th House of Higher Fortune & Destiny", theme: "Expansive wisdom, mentor support, spiritual ethics, and divine timing." },
  10: { title: "10th House of Career Prestige & Impact", theme: "Public authority, executive achievement, professional status, and legacy." },
  11: { title: "11th House of Abundance & Great Ambition", theme: "Fulfillment of cherished dreams, affluent networks, and compounding gains." },
  12: { title: "12th House of Intuition & Global Horizons", theme: "Subconscious brilliance, creative solitude, global empathy, and spiritual depth." },
};

const PLANET_BENEFITS: Record<string, Record<string, PlanetMeaning>> = {
  Sun: {
    Aries: { archetype: "The Pioneering Commander", coreStrength: "Fearless leadership & unwavering drive", detailedBlessing: "Exalted confidence that energizes everyone around you. You take bold initiative and spark breakthrough momentum.", lifeAdvice: "Lead with empathy and channel your high energy into pioneering new ventures." },
    Taurus: { archetype: "The Enduring Builder", coreStrength: "Unshakable persistence & practical genius", detailedBlessing: "Remarkable patience and grounded willpower. You have a natural instinct for turning raw concepts into lasting prosperity and tangible value.", lifeAdvice: "Trust your steady, unhurried pace; your consistency will always outbuild frantic haste." },
    Gemini: { archetype: "The Brilliant Communicator", coreStrength: "Agile curiosity & magnetic eloquence", detailedBlessing: "Quick-witted intelligence that grasps complex ideas effortlessly. You build bridges between people and articulate visions with sparkling charm.", lifeAdvice: "Focus your versatile talents on one high-impact project at a time." },
    Cancer: { archetype: "The Intuitive Protector", coreStrength: "Deep emotional intelligence & loyalty", detailedBlessing: "Profound empathy paired with fierce dedication to your circle. You intuitively sense what others need and create spaces of trust and warmth.", lifeAdvice: "Honor your gut instincts; they are among your sharpest decision-making tools." },
    Leo: { archetype: "The Radiant Sovereign", coreStrength: "Generous authority & creative charisma", detailedBlessing: "Natural warmth that inspires loyalty and admiration. You carry an authentic dignity and elevate the spirits of those in your orbit.", lifeAdvice: "Use your magnetic presence to mentor others and shine spotlight on team success." },
    Virgo: { archetype: "The Master Craftsman", coreStrength: "Exceptional precision & analytical acumen", detailedBlessing: "Sharp eye for quality, operational excellence, and practical problem-solving. You bring order, efficiency, and clarity out of chaos.", lifeAdvice: "Celebrate your achievements without expecting absolute perfection from day one." },
    Libra: { archetype: "The Graceful Diplomat", coreStrength: "Aesthetic mastery & relational harmony", detailedBlessing: "Balanced perspective and refined judgment. You excel at negotiating peaceful resolutions and creating environments of elegance and fairness.", lifeAdvice: "Stand firmly by your personal boundaries while nurturing win-win relationships." },
    Scorpio: { archetype: "The Transformational Catalyst", coreStrength: "Deep focus & unbreakable resilience", detailedBlessing: "Uncanny psychological depth and relentless determination. You rise stronger from every challenge and possess fierce loyalty.", lifeAdvice: "Channel your intense passion into research, healing, or high-stakes leadership." },
    Sagittarius: { archetype: "The Visionary Philosopher", coreStrength: "Expansive optimism & infectious truth", detailedBlessing: "Broad horizons and philosophical wisdom. You see the big picture when others get lost in details and naturally attract good fortune.", lifeAdvice: "Anchor your visionary ideas with a clear, step-by-step practical action plan." },
    Capricorn: { archetype: "The Strategic Architect", coreStrength: "Disciplined ambition & long-term legacy", detailedBlessing: "Unmatched work ethic and mature foresight. You are built to climb high mountains and construct enduring organizations or traditions.", lifeAdvice: "Remember to enjoy the milestones along the journey as you scale your peaks." },
    Aquarius: { archetype: "The Cosmic Innovator", coreStrength: "Original vision & humanitarian impact", detailedBlessing: "Progressive intellect and futuristic ideas. You naturally think outside conventional boxes and champion ideas that elevate the community.", lifeAdvice: "Pair your visionary ideals with personal, heartfelt connections to inspire action." },
    Pisces: { archetype: "The Empathic Sage", coreStrength: "Spiritual imagination & creative flow", detailedBlessing: "Soulful sensitivity and boundless artistic vision. You perceive subtleties that logic misses and carry a healing, calming presence.", lifeAdvice: "Ground your transcendent ideas through creative art, writing, or compassionate service." },
  },
  Moon: {
    Aries: { archetype: "The Spontaneous Heart", coreStrength: "Quick emotional recovery & passionate spirit", detailedBlessing: "Courageous feelings and a spirited zest for living. You forgive fast, act on inspiration, and meet life with fresh enthusiasm.", lifeAdvice: "Take a deep breath before reacting in moments of surprise." },
    Taurus: { archetype: "The Peaceful Sanctuary", coreStrength: "Exalted emotional serenity & grounding peace", detailedBlessing: "Deep emotional balance and contentment. You provide a calm anchor for loved ones and possess a golden touch for comfort and prosperity.", lifeAdvice: "Surround yourself with harmonious aesthetics and nature to recharge your spirit." },
    Gemini: { archetype: "The Curious Mind", coreStrength: "Witty perspective & emotional adaptability", detailedBlessing: "Lighthearted processing and intellectual humor. You keep an open mind and adapt seamlessly to shifting social dynamics.", lifeAdvice: "Journal your thoughts to bring calm focus when your active mind is buzzing." },
    Cancer: { archetype: "The Nurturing Ocean", coreStrength: "Profound empathy & protective devotion", detailedBlessing: "Deep intuitive wisdom and unmatched emotional depth. Your caring presence makes people feel truly seen, safe, and valued.", lifeAdvice: "Protect your personal energy field by taking regular quiet time to replenish." },
    Leo: { archetype: "The Warm-Hearted Champion", coreStrength: "Generous affection & joyful vitality", detailedBlessing: "Big-hearted warmth and protective loyalty. You celebrate the victories of loved ones and bring sunshine and enthusiasm into rooms.", lifeAdvice: "Allow yourself to be supported by others just as generously as you support them." },
    Virgo: { archetype: "The Thoughtful Helper", coreStrength: "Observant care & practical thoughtfulness", detailedBlessing: "Attentive memory and sincere helpfulness. You show love through concrete acts of service, reliability, and helpful solutions.", lifeAdvice: "Practice gentle self-compassion; your daily efforts are deeply appreciated." },
    Libra: { archetype: "The Harmonious Soul", coreStrength: "Diplomatic grace & instinctive fairness", detailedBlessing: "Deep love for peace, balance, and mutual respect. You intuitively understand both sides of every equation and soothe tension naturally.", lifeAdvice: "Prioritize your inner desires with the same dedication you give to pleasing others." },
    Scorpio: { archetype: "The Intuitive Mystic", coreStrength: "Emotional truth & unwavering resilience", detailedBlessing: "X-ray emotional perception. You sense unspoken feelings instantly and possess the spiritual stamina to heal and transform challenges.", lifeAdvice: "Open your heart to trusted allies; vulnerability is a doorway to true intimacy." },
    Sagittarius: { archetype: "The Cheerful Explorer", coreStrength: "Unshakable hope & philosophical buoyancy", detailedBlessing: "Infectious optimism and open-minded generosity. You find meaning and growth in every experience and inspire others to keep looking up.", lifeAdvice: "Root your expansive optimism in consistent daily routines." },
    Capricorn: { archetype: "The Reliable Anchor", coreStrength: "Emotional self-control & steady loyalty", detailedBlessing: "Maturity, quiet strength, and dependability under pressure. People look to you when times are tough because you keep a level head.", lifeAdvice: "Let yourself celebrate small everyday joys without feeling you must carry the world." },
    Aquarius: { archetype: "The Global Empath", coreStrength: "Universal kindness & intellectual clarity", detailedBlessing: "Egalitarian empathy and noble friendship. You treat everyone with equal dignity and care deeply about uplifting society.", lifeAdvice: "Share your private feelings with close friends to deepen personal intimacy." },
    Pisces: { archetype: "The Celestial Dreamer", coreStrength: "Pure intuitive empathy & poetic soul", detailedBlessing: "Boundless compassion, spiritual intuition, and artistic sensitivity. You touch hearts with your warmth and profound understanding.", lifeAdvice: "Set gentle emotional boundaries so you absorb only the best energies." },
  },
};

export function getPlanetInsight(name: string, sign: string | null): PlanetMeaning {
  const s = sign ?? "Taurus";
  const map = PLANET_BENEFITS[name];
  if (map && map[s]) return map[s];

  // Default rich fallback for other planets
  const defaults: Record<string, PlanetMeaning> = {
    Mars: {
      archetype: "The Victorious Pioneer",
      coreStrength: "Dynamic courage & resolute initiative",
      detailedBlessing: `Bestows fearless drive and high energy in ${s}. You have the stamina to break barriers, protect those you love, and take decisive action.`,
      lifeAdvice: "Channel your passion into focused physical activity and high-impact goals.",
    },
    Mercury: {
      archetype: "The Strategic Intellect",
      coreStrength: "Commercial acumen & communicative brilliance",
      detailedBlessing: `Sharp reasoning and analytical clarity in ${s}. You possess a talent for negotiation, persuasive articulation, and rapid learning.`,
      lifeAdvice: "Use your voice to teach, negotiate, and share valuable insights with the world.",
    },
    Jupiter: {
      archetype: "The Divine Mentor",
      coreStrength: "Golden fortune & expansive wisdom",
      detailedBlessing: `Brings auspicious growth and moral integrity in ${s}. You attract mentors, open doors through optimism, and elevate everyone around you.`,
      lifeAdvice: "Keep sharing your knowledge and generosity; it returns to you manifold.",
    },
    Venus: {
      archetype: "The Gracious Benefactor",
      coreStrength: "Magnetic charm & aesthetic mastery",
      detailedBlessing: `Infuses your aura with grace and social attraction in ${s}. You have an instinct for luxury, harmony, deep relationships, and creative wealth.`,
      lifeAdvice: "Express your natural creativity and cultivate spaces of beauty and peace.",
    },
    Saturn: {
      archetype: "The Master of Time",
      coreStrength: "Enduring resilience & structured mastery",
      detailedBlessing: `Gives steadfast patience and the power to build lasting foundations in ${s}. Your greatest rewards compound and blossom with time.`,
      lifeAdvice: "Trust your deliberate progress; what you build with patience will stand forever.",
    },
    Rahu: {
      archetype: "The Visionary Trailblazer",
      coreStrength: "Unconventional ambition & rapid elevation",
      detailedBlessing: `Spurs bold innovation and out-of-the-box thinking in ${s}. You have the drive to pioneer non-traditional paths and reach unusual heights.`,
      lifeAdvice: "Keep your aspirations anchored in ethical purpose for maximum long-term fulfillment.",
    },
    Ketu: {
      archetype: "The Intuitive Sage",
      coreStrength: "Subconscious mastery & spiritual shield",
      detailedBlessing: `Confers deep psychological instincts and detachment in ${s}. You possess an innate sixth sense and spiritual protection against negativity.`,
      lifeAdvice: "Trust your quiet intuitive hunches; they see past illusions with laser clarity.",
    },
  };

  return defaults[name] ?? {
    archetype: `${name} Guardian`,
    coreStrength: `Auspicious influence in ${s}`,
    detailedBlessing: `Harmonizes celestial energies to support your life direction and personal growth.`,
    lifeAdvice: "Stay aligned with your authentic inner truth and steady purpose.",
  };
}

/**
 * Calculates deterministic, deeply positive, and highly personalized benefits
 * based on the user's birth chart placements.
 */
export function getProfileBenefits(profile: Profile | null): BenefitCard[] {
  if (!profile) return [];
  const chart = profile.charts.vedic ?? profile.charts.western;
  if (!chart) return [];

  const cards: BenefitCard[] = [];
  const planets = chart.planets;
  const sunSign = planets.Sun?.sign ?? "Taurus";
  const moonSign = planets.Moon?.sign ?? "Libra";
  const ascSign = chart.houses ? signs[Math.floor(((chart.houses.ascendant % 360) + 360) % 360 / 30)] : null;

  // 1. Core Life Superpower (Sun)
  const sunInsight = getPlanetInsight("Sun", sunSign);
  cards.push({
    id: "core-sun",
    category: "superpower",
    title: `Core Superpower: ${sunInsight.archetype}`,
    badge: `Sun in ${sunSign}`,
    gift: sunInsight.coreStrength,
    whyItMatters: sunInsight.detailedBlessing,
    practicalTip: sunInsight.lifeAdvice,
    icon: "☀️",
  });

  // 2. Emotional Intelligence & Instinct (Moon)
  const moonInsight = getPlanetInsight("Moon", moonSign);
  cards.push({
    id: "moon-intuition",
    category: "relationship",
    title: `Mind & Aura: ${moonInsight.archetype}`,
    badge: `Moon in ${moonSign}`,
    gift: moonInsight.coreStrength,
    whyItMatters: moonInsight.detailedBlessing,
    practicalTip: moonInsight.lifeAdvice,
    icon: "🌙",
  });

  // 3. Ascendant Charisma / Presence
  if (ascSign) {
    cards.push({
      id: "rising-aura",
      category: "superpower",
      title: `Personal Magnetism: Ascendant in ${ascSign}`,
      badge: "Your Natural Impression",
      gift: `Magnetic social presence and adaptive intelligence`,
      whyItMatters: `Your rising sign in ${ascSign} gives you an engaging, instantly likable exterior. People feel drawn to your approachable energy and value your perspective.`,
      practicalTip: `Step boldly into meetings and gatherings; your presence leaves a lasting, positive impression.`,
      icon: "✨",
    });
  }

  // 4. Wealth & Career Blessings (Jupiter / Venus / 2nd / 10th House)
  const jupiterSign = planets.Jupiter?.sign ?? "Cancer";
  const jupInsight = getPlanetInsight("Jupiter", jupiterSign);
  cards.push({
    id: "wealth-blessing",
    category: "wealth",
    title: "Prosperity & Wealth Creation Boon",
    badge: `Jupiter in ${jupiterSign}`,
    gift: "Expansion, wise investments, and auspicious opportunities",
    whyItMatters: jupInsight.detailedBlessing,
    practicalTip: "Focus on long-term compound growth and building trusted professional alliances.",
    icon: "💰",
  });

  // 5. Special Celestial Yogas
  // Check for Budhaditya Yoga (Sun and Mercury together or adjacent)
  const sunHouse = planets.Sun?.house;
  const mercHouse = planets.Mercury?.house;
  if (sunHouse && mercHouse && (sunHouse === mercHouse || Math.abs(sunHouse - mercHouse) === 1 || sunSign === planets.Mercury?.sign)) {
    cards.push({
      id: "budhaditya-yoga",
      category: "yoga",
      title: "Budhaditya Yoga (Solar-Intellect Conjunction)",
      badge: "Auspicious Imperial Yoga",
      gift: "Supreme intellectual sharpness, public respect, and eloquent speech",
      whyItMatters: "When the Sun (soul authority) unites with Mercury (commercial intelligence), it bestows an agile mind, executive decision-making, and prestige in professional circles.",
      practicalTip: "Trust your communication skills in negotiations, presentations, and leadership.",
      icon: "👑",
    });
  }

  // Check for Gaj Kesari or Chandra-Guru Yoga
  const moonHouse = planets.Moon?.house;
  const jupHouse = planets.Jupiter?.house;
  if (moonHouse && jupHouse) {
    const diff = (jupHouse - moonHouse + 12) % 12;
    if ([0, 3, 6, 9].includes(diff)) {
      cards.push({
        id: "gaj-kesari-yoga",
        category: "yoga",
        title: "Gaja Kesari Yoga (Royal Wisdom & Prosperity)",
        badge: "King of Yogas",
        gift: "Unyielding reputation, emotional wisdom, and lasting affluence",
        whyItMatters: "Jupiter and Moon in mutually supportive Kendra alignment form one of Vedic astrology’s most revered yogas, granting victory over adversaries and enduring honor.",
        practicalTip: "Lead with integrity and mentor others; your reputation will be your greatest asset.",
        icon: "🐘",
      });
    }
  }

  // Check for Benefic Venus Influence
  const venusSign = planets.Venus?.sign ?? "Gemini";
  cards.push({
    id: "venus-harmony",
    category: "relationship",
    title: "Artistic Grace & Relational Harmony",
    badge: `Venus in ${venusSign}`,
    gift: "Creative charm, persuasive warmth, and pleasant alliances",
    whyItMatters: "Venus blesses your relationships with warmth, aesthetic appreciation, and an effortless ability to make connections feel meaningful and uplifting.",
    practicalTip: "Engage in creative hobbies and express sincere gratitude to strengthen bonds.",
    icon: "💎",
  });

  // Check for Mars Energy / Courage
  const marsSign = planets.Mars?.sign ?? "Gemini";
  cards.push({
    id: "mars-courage",
    category: "growth",
    title: "Resilient Drive & Breakthrough Stamina",
    badge: `Mars in ${marsSign}`,
    gift: "Courage to overcome obstacles and initiate bold moves",
    whyItMatters: "Gives you the inner fire to tackle complex challenges without backing down. You have the resilience to transform obstacles into stepping stones.",
    practicalTip: "Channel intense focus into high-priority goals during morning peak hours.",
    icon: "🔥",
  });

  return cards;
}
