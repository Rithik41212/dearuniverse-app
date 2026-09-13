export interface CategoryIssue {
  id: string;
  title: string;
  issue: string;
  solution: string;
  cosmicAnchor: string;
}

export interface CategoryBenefit {
  title: string;
  description: string;
  highlight: string;
}

export interface CategoryInsightData {
  category: string;
  // Kundli section
  kundliTitle: string;
  kundliDescription: string;
  kundliHook: string;
  kundliBenefits: CategoryBenefit[];
  kundliSpeechEn: string;
  kundliSpeechHi: string;
  // Numerology section
  numerologyTitle: string;
  numerologyDescription: string;
  numerologyHook: string;
  numerologyBenefits: CategoryBenefit[];
  numerologySpeechEn: string;
  numerologySpeechHi: string;
  // Issues & Solutions
  issues: CategoryIssue[];
  issuesSpeechEn: string;
  issuesSpeechHi: string;
}

export const HOOKING_ENGAGEMENT_LINES_EN = [
  "The cosmos has a perfect timing for you — and your moment is unfolding.",
  "Everything you are seeking is already aligning quietly behind the scenes.",
  "Your birth chart is your celestial blueprint of unique strength and purpose.",
  "The right doors open effortlessly when your energy and intentions align.",
  "You carry within you an extraordinary spark of courage and deep wisdom.",
  "Trust your inner rhythm; the universe is supporting every single step.",
  "Clarity is not far away — it begins with honoring who you truly are.",
  "Your unique vibration is your superpower in love, work, and life.",
  "A single moment of self-understanding can change the course of years.",
  "Your chart does not restrict you; it reveals the heights you can reach.",
  "Where you felt stuck before is exactly where your breakthrough is preparing.",
  "When you honor your natural frequency, the right people recognize you instantly.",
  "Your stars invite you to step forward into your fullest confidence.",
  "Peace and progress begin when you stop doubting what feels true inside.",
  "You were born under a sky that wanted you here, exactly as you are.",
  "Step forward with courage; great answers begin with a quiet listening heart.",
];

export const HOOKING_ENGAGEMENT_LINES_HI = [
  "ब्रह्मांड का हर संकेत आपके पक्ष में है — आपका शुभ समय शुरू हो रहा है।",
  "जो आप खोज रहे हैं, वह भी सकारात्मक ऊर्जा के साथ आपकी ओर बढ़ रहा है।",
  "आपकी जन्म कुंडली आपकी आंतरिक शक्ति और सफलता का स्वर्णिम नक्शा है।",
  "जब आपके विचार और कर्म एक दिशा में होते हैं, तो हर रास्ता आसान हो जाता है।",
  "आपके भीतर असीम साहस, समझ और सकारात्मक ऊर्जा का वास है।",
  "अपनी अंतरात्मा की आवाज़ पर भरोसा रखें; कायनात आपके साथ है।",
  "सच्ची स्पष्टता कहीं दूर नहीं — यह खुद को समझने से शुरू होती है।",
  "आपकी जन्म ऊर्जा जीवन के हर क्षेत्र में आपका सबसे बड़ा संबल है।",
  "आत्म-विश्वास का एक पल सालों की उलझनों को दूर कर सकता है।",
  "आपकी कुंडली आपकी सीमाओं को नहीं, आपकी असीम संभावनाओं को दर्शाती है।",
  "जहाँ पहले रुकावट महसूस हुई, वहीं से आपकी सबसे बड़ी तरक्की का द्वार खुलेगा।",
  "सकारात्मक सोच और सही समय का तालमेल हर मुश्किल को आसान बना देता है।",
  "आगे बढ़ें, आपका हर कदम नई रोशनी और समृद्धि की ओर अग्रसर है।",
];

export const CATEGORY_INSIGHTS: Record<string, CategoryInsightData> = {
  marriage: {
    category: "Marriage",
    kundliTitle: "Benefits of Your Kundli for Marriage",
    kundliDescription:
      "Your Vedic Kundli highlights your natural relationship harmony, emotional compatibility, and ideal life timing. It shows how the cosmos supports you in building an enduring partnership grounded in mutual respect.",
    kundliHook:
      "Your chart reveals your innate ability to create a warm, loving, and lasting marriage.",
    kundliBenefits: [
      {
        title: "Natural Partnership Harmony",
        description: "Your 7th house and Venus show deep loyalty, kindness, and a gift for making a partner feel truly valued.",
        highlight: "True Compatibility",
      },
      {
        title: "Clarity Over Social Pressure",
        description: "Your planetary alignment helps you distinguish genuine emotional connection from external rush or family panic.",
        highlight: "Confident Decisions",
      },
      {
        title: "Protected Boundaries & Respect",
        description: "Your planetary rulers ensure you enter marriage as your authentic self without having to diminish your dreams.",
        highlight: "Mutual Growth",
      },
    ],
    kundliSpeechEn:
      "Your Vedic birth chart is ready, and it brings wonderful news for marriage. Your planetary alignments highlight natural emotional maturity, deep loyalty, and great capacity for lasting companionship. Your Kundli gives you the clarity to choose with confidence and build a warm, peaceful home.",
    kundliSpeechHi:
      "आपकी जन्म कुंडली तैयार है, और विवाह के संबंध में इसके ग्रह बहुत सुंदर और सकारात्मक संकेत दे रहे हैं। आपकी कुंडली में सच्चा अपनापन, वफादारी और सामंजस्य की अद्भुत क्षमता है। यह आपको सही साथी चुनने और सुखद जीवन बसाने का आत्मविश्वास देती है।",

    numerologyTitle: "Benefits of Your Numbers for Marriage",
    numerologyDescription:
      "Your Life Path and Destiny numbers reveal your personal communication frequency and the special qualities that make you unforgettable to the right partner.",
    numerologyHook:
      "Your numbers act as an energetic magnet for trustworthy and supportive companionship.",
    numerologyBenefits: [
      {
        title: "Magnetic Heart Connection",
        description: "Your Life Path vibration creates an aura of sincerity and calm that immediately puts genuine people at ease.",
        highlight: "Emotional Ease",
      },
      {
        title: "Long-Term Devotion Frequency",
        description: "Your Destiny number carries the vibration of perseverance and building a stable, joyful future together.",
        highlight: "Lasting Stability",
      },
      {
        title: "Soul-Aligned Communication",
        description: "Your Soul Urge number guides you to express love through meaningful actions, eliminating unnecessary doubts.",
        highlight: "Clear Love",
      },
    ],
    numerologySpeechEn:
      "Now, looking into your sacred numbers, your Life Path and Destiny vibration bring beautiful stability to your relationship rhythm. You carry a warm energy that naturally inspires trust and mutual devotion. Your complete report with personalized solutions is ready for you now.",
    numerologySpeechHi:
      "आपके नाम और जन्म तिथि के अंक दर्शाते हैं कि आपकी ऊर्जा में बहुत मिठास और स्थिरता है। आपका जीवन पथ अंक साथी के साथ गहरे विश्वास और प्रेम का संबंध बनाता है। आपकी व्यक्तिगत रिपोर्ट अब पूरी तरह तैयार है।",

    issues: [
      {
        id: "issue_1",
        title: "Balancing Family Advice with Personal Pace",
        issue: "Family wants fast decisions, but you want to ensure the connection feels right deep down.",
        solution: "Trust your inner calm. Use your Life Path clarity to communicate your positive criteria with kindness and firm grace.",
        cosmicAnchor: "7th House & Life Path Calm",
      },
      {
        id: "issue_2",
        title: "Opening Up About Everyday Priorities",
        issue: "Wondering how to talk comfortably about work, lifestyle, and shared goals without awkwardness.",
        solution: "Ask simple, joyful questions like: 'What brings you the most peace at the end of the day?' Let genuine warmth lead.",
        cosmicAnchor: "Venus Harmony & 2nd House",
      },
      {
        id: "issue_3",
        title: "Staying True to Your Personal Freedom",
        issue: "Desiring complete devotion while honoring your unique ambitions and individual identity.",
        solution: "True partnership elevates your dreams. Your chart favors someone who celebrates and champions who you are.",
        cosmicAnchor: "Lagna Vitality & Sun Power",
      },
    ],
    issuesSpeechEn:
      "Here is your Marriage roadmap. First, balance family advice by honoring your inner pace with 7th-house calm. Second, discuss lifestyle priorities with Venusian warmth and joyful honesty. And third, stay true to your identity — your chart strongly favors a partner who champions your dreams.",
    issuesSpeechHi:
      "यहाँ आपके विवाह मार्ग के मुख्य सूत्र हैं। पहला, पारिवारिक सलाह के बीच सातवें भाव की शांति से अपने सही समय पर भरोसा रखें। दूसरा, अपने साथी से जीवन की प्राथमिकताओं पर सहजता और प्यार से बात करें। और तीसरा, अपने सपनों पर अडिग रहें — आपकी कुंडली एक ऐसे साथी का समर्थन करती है जो आपका पूरा सम्मान करे।",
  },

  relationships: {
    category: "Love & Relationships",
    kundliTitle: "Benefits of Your Kundli for Love",
    kundliDescription:
      "Your Moon sign and relationship houses bring profound emotional sensitivity, charm, and the gift of heartfelt connection to your romantic life.",
    kundliHook:
      "Your chart illuminates your natural emotional depth and gift for understanding others.",
    kundliBenefits: [
      {
        title: "Deep Empathy & Care",
        description: "Your Moon placement gifts you with intuition; you instinctively know when a loved one needs gentleness.",
        highlight: "Emotional Depth",
      },
      {
        title: "Joyful Connection & Warmth",
        description: "Your 5th house of love sparks playful energy, creativity, and unforgettable shared moments.",
        highlight: "Playful Romance",
      },
      {
        title: "Resilience in Conflict",
        description: "Benefic aspects grant you the ability to heal misunderstandings with a calm smile and patient words.",
        highlight: "Swift Healing",
      },
    ],
    kundliSpeechEn:
      "Your birth chart brings delightful clarity for love and relationships. Your Moon and Venus alignments give you immense warmth, genuine charm, and an instinctive gift for empathy. This chart protects your peace and shows how deeply rewarding your connections can be.",
    kundliSpeechHi:
      "प्रेम और रिश्तों के लिए आपकी जन्म कुंडली बहुत सुखद और सकारात्मक है। आपका चंद्रमा और शुक्र आपको गहरा अपनापन, आकर्षण और दूसरों के दिल को छूने की समझ देते हैं। यह कुंडली आपके रिश्तों में सच्चा सुकून और प्यार लाती है।",

    numerologyTitle: "Benefits of Your Numbers for Love",
    numerologyDescription:
      "Your numbers decode your love language, clearing away doubts and helping you attract reciprocal affection effortlessly.",
    numerologyHook:
      "Your vibrational frequency draws in people who appreciate your genuine worth.",
    numerologyBenefits: [
      {
        title: "Effortless Attraction",
        description: "Your Destiny number emits an authentic vibration of honesty and emotional reliability.",
        highlight: "Authentic Charm",
      },
      {
        title: "Clear Mutual Understanding",
        description: "Your Life Path helps you express what you desire without fear, inspiring partners to meet you halfway.",
        highlight: "Open Hearts",
      },
      {
        title: "Peaceful Emotional Grounding",
        description: "Your Soul Urge number acts as an anchor, helping you let go of past hurts and welcome fresh romance.",
        highlight: "Fresh Beginnings",
      },
    ],
    numerologySpeechEn:
      "Your numerology reveals an inspiring frequency of love and devotion. Your numbers protect you from one-sided efforts and attract partners who match your loyalty. Your personalized love guidance report is now ready.",
    numerologySpeechHi:
      "आपके अंक यह दिखाते हैं कि आपके पास सच्चा प्यार पाने और निभाने की सुंदर ऊर्जा है। आपके अंक जीवन में सम्मान और एकरूपता लाते हैं। आपकी पूरी रिपोर्ट अब तैयार है।",

    issues: [
      {
        id: "issue_1",
        title: "Expressing What You Really Need",
        issue: "Hoping someone guesses your mood, which occasionally leads to unspoken frustration.",
        solution: "A simple, affectionate request works wonders: 'It would make my day if we spent 15 quiet minutes catching up.'",
        cosmicAnchor: "Moon-Mercury Expressiveness",
      },
      {
        id: "issue_2",
        title: "Stepping Out of Reactive Patterns",
        issue: "Getting pulled into defensive conversations when tired or stressed.",
        solution: "Take a calming breath. A 10-minute pause allows your natural Venusian warmth to take over from frustration.",
        cosmicAnchor: "5th House Emotional Balance",
      },
      {
        id: "issue_3",
        title: "Trusting the Pacing of True Love",
        issue: "Feeling anxious about the future instead of enjoying how things are blossoming now.",
        solution: "Focus on today's shared laughter. Consistent small kindnesses build an unbreakable foundation.",
        cosmicAnchor: "Jupiter Faith & Expansion",
      },
    ],
    issuesSpeechEn:
      "Here is your Relationship guidance. First, protect your inner peace by gently expressing your emotional needs. Second, dissolve misunderstandings with Venusian warmth — a brief mindful pause restores harmony. And third, trust divine timing by celebrating shared laughter today.",
    issuesSpeechHi:
      "यहाँ आपके प्रेम और रिश्तों के उपाय हैं। पहला, चंद्रमा की संवेदनशीलता के साथ अपनी भावनाएं प्यार से साझा करें। दूसरा, किसी भी गलतफहमी में शुक्र के प्रभाव से थोड़ा रुकें — प्रेम हर मतभेद को मिटा देता है। और तीसरा, बृहस्पति के विश्वास से आज के पलों और हंसी का भरपूर आनंद लें।",
  },

  career: {
    category: "Career & Work",
    kundliTitle: "Benefits of Your Kundli for Career",
    kundliDescription:
      "Your 10th house of achievement and ruling planets bestow natural leadership, strategic foresight, and the resilience to turn challenges into major milestones.",
    kundliHook:
      "Your astrological chart reveals high professional potential and recognized authority.",
    kundliBenefits: [
      {
        title: "Natural Leadership Aura",
        description: "Your 10th house placements command respect, helping you naturally guide teams and projects to success.",
        highlight: "Authority & Respect",
      },
      {
        title: "Strategic Foresight",
        description: "Planetary aspects grant you keen instincts for identifying high-impact opportunities before others do.",
        highlight: "Clear Advantage",
      },
      {
        title: "Long-Term Wealth & Stability",
        description: "Saturn and Jupiter alignments ensure that your efforts compound into lasting reputation and financial growth.",
        highlight: "Compounding Success",
      },
    ],
    kundliSpeechEn:
      "Your Vedic birth chart reveals brilliant strengths for your career. Your 10th house and planetary rulers grant you natural leadership, sharp strategic intuition, and the endurance to rise above competition. Great opportunities are unfolding for you.",
    kundliSpeechHi:
      "करियर और कार्यक्षेत्र में आपकी जन्म कुंडली अत्यंत प्रभावशाली और शुभ है। आपका दसवां भाव और शुभ ग्रह आपको स्वाभाविक नेतृत्व, सही निर्णय लेने की क्षमता और निरंतर तरक्की का वरदान देते हैं। आपका भविष्य बहुत उज्ज्वल है।",

    numerologyTitle: "Benefits of Your Numbers for Career",
    numerologyDescription:
      "Your Life Path and Destiny numbers reveal your optimal work rhythm, innate talents, and how to attract prosperous recognition.",
    numerologyHook:
      "Your numbers align your daily efforts with remarkable breakthroughs and promotions.",
    numerologyBenefits: [
      {
        title: "Breakthrough Momentum",
        description: "Your Life Path number charges your mind with creative problem-solving that sets you apart.",
        highlight: "Standout Genius",
      },
      {
        title: "Charismatic Influence",
        description: "Your Destiny number makes your ideas resonate with decision-makers and senior leaders effortlessly.",
        highlight: "Natural Influence",
      },
      {
        title: "Stress-Free Productivity",
        description: "Aligning your tasks with your personal numerological cycle prevents fatigue and maximizes results.",
        highlight: "Peak Energy",
      },
    ],
    numerologySpeechEn:
      "Your numbers confirm a powerful blueprint for professional mastery and financial freedom. Your Life Path energy gives you the confidence to execute big visions with ease. Your complete career guidance report is now ready.",
    numerologySpeechHi:
      "आपके अंक यह साबित करते हैं कि आपके पास सफलता, सम्मान और आर्थिक समृद्धि पाने की पूरी शक्ति है। आपकी मेहनत अब सही फल देने के लिए तैयार है। आपकी पूरी करियर रिपोर्ट तैयार हो चुकी है।",

    issues: [
      {
        id: "issue_1",
        title: "Gaining the Recognition You Deserve",
        issue: "Doing heavy lifting behind the scenes without leadership fully noticing your true impact.",
        solution: "Highlight the concrete problem you solved in your next update. Your natural Sun energy is ready to shine visibly.",
        cosmicAnchor: "10th House Sun Brilliance",
      },
      {
        id: "issue_2",
        title: "Choosing Between Competing Paths",
        issue: "Having multiple interests and fearing that picking one means missing out on another.",
        solution: "Commit to one primary priority for the next quarter. Your Saturn discipline ensures mastery without FOMO.",
        cosmicAnchor: "Saturn Focus & Discipline",
      },
      {
        id: "issue_3",
        title: "Maintaining Daily Vitality & Balance",
        issue: "Pouring so much focus into work that your personal recharging time gets neglected.",
        solution: "Treat rest as an executive strategy. 30 minutes of daily sacred downtime sharpens your professional edge.",
        cosmicAnchor: "6th House Energy Renewal",
      },
    ],
    issuesSpeechEn:
      "Here is your Career roadmap. First, for recognition, let your 10th-house Sun shine by clearly highlighting the concrete problems you solve. Second, overcome competing choices with Saturn’s steady focus on one key goal first. And third, to sustain your peak vitality, treat daily rest as a vital executive strategy.",
    issuesSpeechHi:
      "यहाँ आपका करियर मार्गदर्शन है। पहला, काम का सही श्रेय पाने के लिए दसवें भाव के सूर्य से अपनी उपलब्धियाँ खुलकर बताएं। दूसरा, भटकाव से बचने के लिए शनि के अनुशासन से एक मुख्य लक्ष्य पर टिकें। और तीसरा, ऊर्जा बनाए रखने के लिए भरपूर आराम को अपनी रणनीति बनाएं।",
  },

  business: {
    category: "Business & Wealth",
    kundliTitle: "Benefits of Your Kundli for Business",
    kundliDescription:
      "Your 2nd house of wealth, 11th house of massive gains, and Mercury's commerce power bestow extraordinary commercial instincts and prosperity.",
    kundliHook:
      "Your chart reveals strong entrepreneurial instinct, deal-making flair, and wealth generation.",
    kundliBenefits: [
      {
        title: "Sharp Commercial Intuition",
        description: "Mercury's favor gives you a quick eye for market gaps, consumer psychology, and profitable positioning.",
        highlight: "Commercial Instinct",
      },
      {
        title: "Abundant Wealth Flow",
        description: "Your 11th house aspects bring prosperous networking, lucrative alliances, and multiplying profits.",
        highlight: "Multiplying Wealth",
      },
      {
        title: "Resilient Venture Longevity",
        description: "Benefic earth placements ensure your business builds solid assets that thrive through all market seasons.",
        highlight: "Built to Last",
      },
    ],
    kundliSpeechEn:
      "Your Vedic birth chart brings powerful indicators of commercial prosperity. Your 2nd and 11th houses align with abundance, wise negotiation, and enterprise growth. Your chart confirms you have the vision and instincts to build lasting wealth.",
    kundliSpeechHi:
      "व्यापार और धन के क्षेत्र में आपकी जन्म कुंडली बहुत फलदायी है। आपका दूसरा और ग्यारहवां भाव लाभ, कुशल सौदेबाजी और आर्थिक प्रगति के प्रबल योग बनाते हैं। आप बड़े व्यापारिक मुकाम हासिल करने में सक्षम हैं।",

    numerologyTitle: "Benefits of Your Numbers for Business",
    numerologyDescription:
      "Your business and name vibrations unlock customer trust, brand loyalty, and seamless deal closures.",
    numerologyHook:
      "Your numbers turn your business venture into a recognized, trusted brand.",
    numerologyBenefits: [
      {
        title: "Magnetic Brand Trust",
        description: "Your Destiny number inspires immediate confidence in prospective clients and investors.",
        highlight: "Client Trust",
      },
      {
        title: "Scalable Offering Design",
        description: "Your Life Path frequency simplifies complex ideas into irresistible, clear customer offers.",
        highlight: "Irresistible Value",
      },
      {
        title: "Synchronized Growth Timing",
        description: "Using your Personal Year vibrations ensures you launch big campaigns precisely when market energy supports you.",
        highlight: "Perfect Timing",
      },
    ],
    numerologySpeechEn:
      "Your numerological blueprint reveals strong brand charisma and sustainable growth power. Your numbers guide you toward clear offers and predictable prosperity. Your complete business growth report is ready.",
    numerologySpeechHi:
      "आपके अंक यह दिखाते हैं कि आपके नाम और कार्य में ग्राहकों का अटूट विश्वास जीतने की क्षमता है। आपके पास अपने व्यापार को नई ऊँचाइयों पर ले जाने का सामर्थ्य है। आपकी व्यापारिक रिपोर्ट तैयार है।",

    issues: [
      {
        id: "issue_1",
        title: "Clarifying Your Core Customer Message",
        issue: "Offering so many valuable services that new clients take too long to decide.",
        solution: "Focus on your single most impactful solution in your pitch. Simplicity multiplies customer conversions.",
        cosmicAnchor: "Mercury Simplicity & Clarity",
      },
      {
        id: "issue_2",
        title: "Creating Steady, Predictable Cashflow",
        issue: "Swings between very busy delivery seasons and quieter sales months.",
        solution: "Introduce an ongoing retainer or membership tier. Your 11th house supports recurring community revenue.",
        cosmicAnchor: "11th House Recurring Gains",
      },
      {
        id: "issue_3",
        title: "Delegating with Total Confidence",
        issue: "Feeling like you must handle every detail yourself to ensure high quality.",
        solution: "Set clear outcome expectations and step back. Your natural leadership empowers others to deliver excellence.",
        cosmicAnchor: "Sun Executive Delegation",
      },
    ],
    issuesSpeechEn:
      "Here is your Business strategy. First, simplify your customer offer with Mercury’s clarity so clients decide quickly. Second, build steady cashflow by using 11th-house recurring models. And third, delegate confidently by setting clear outcomes and stepping back. Your venture is built to prosper.",
    issuesSpeechHi:
      "यहाँ आपके व्यापार और धन के सूत्र हैं। पहला, बुध की स्पष्टता से अपनी पेशकश को सरल बनाएं ताकि ग्राहक तुरंत आकर्षित हों। दूसरा, ग्यारहवें भाव की शक्ति से नियमित और सुरक्षित आमदनी का ढांचा बनाएं। और तीसरा, पूरी निपुणता से जिम्मेदारियां सौंपें। आपका व्यवसाय निरंतर बढ़ेगा।",
  },

  growth: {
    category: "Personal Growth & Life Direction",
    kundliTitle: "Benefits of Your Kundli for Life Direction",
    kundliDescription:
      "Your Lagna (Ascendant) and Sun alignment give you immense spiritual vitality, self-renewal, and an authentic inner compass that always points toward growth.",
    kundliHook:
      "Your chart is an empowering blueprint for self-mastery, peace of mind, and purposeful living.",
    kundliBenefits: [
      {
        title: "Unshakable Core Vitality",
        description: "Your Lagna lord blesses you with remarkable mental resilience and the power to bounce back stronger.",
        highlight: "True Resilience",
      },
      {
        title: "Intuitive Inner Compass",
        description: "Your chart gives you a direct connection to your gut feelings; your first calm instinct is your greatest ally.",
        highlight: "Sharp Intuition",
      },
      {
        title: "Radiant Self-Confidence",
        description: "Benefic aspects inspire you to let go of external validation and step into your full, unshakeable self-worth.",
        highlight: "Pure Self-Worth",
      },
    ],
    kundliSpeechEn:
      "Your Vedic birth chart is a sacred roadmap of self-mastery and inner peace. Your Lagna and solar placements bestow immense resilience, clear intuition, and an inspiring purpose. The universe is actively supporting your personal transformation.",
    kundliSpeechHi:
      "जीवन की दिशा और आत्म-विकास के लिए आपकी जन्म कुंडली एक अद्भुत मार्गदर्शक है। आपका लग्न और सूर्य आपको असीम आंतरिक शक्ति, स्पष्ट अंतर्ज्ञान और हर परिस्थिति में आगे बढ़ने का साहस देते हैं। आप एक बेहतरीन दौर में प्रवेश कर रहे हैं।",

    numerologyTitle: "Benefits of Your Numbers for Personal Growth",
    numerologyDescription:
      "Your Life Path and Soul Urge numbers illuminate your authentic life purpose, helping you align everyday habits with your highest potential.",
    numerologyHook:
      "Your numbers free you from comparison and guide you to your authentic greatness.",
    numerologyBenefits: [
      {
        title: "Liberation from Comparison",
        description: "Your Life Path number reminds you that your timing is unique; you are advancing on your own sacred timeline.",
        highlight: "Authentic Rhythm",
      },
      {
        title: "Soul-Aligned Fulfilment",
        description: "Your Soul Urge number reveals the simple daily rituals that keep your mind clear, calm, and inspired.",
        highlight: "Deep Joy",
      },
      {
        title: "Unstoppable Positive Momentum",
        description: "Your Destiny vibration breaks through procrastination, turning small daily actions into massive life shifts.",
        highlight: "Daily Triumphs",
      },
    ],
    numerologySpeechEn:
      "Your numerological code is filled with purpose and positive energy. Your numbers show you how to honor your authentic rhythm and create a life of deep joy and fulfillment. Your complete personal growth report is ready for you now.",
    numerologySpeechHi:
      "आपके अंक सकारात्मक ऊर्जा और प्रेरणा से भरपूर हैं। यह आपको अपनी गति से चलने और जीवन में सच्ची शांति व सफलता पाने का मार्ग दिखाते हैं। आपकी व्यक्तिगत रिपोर्ट तैयार है।",

    issues: [
      {
        id: "issue_1",
        title: "Silencing the Inner Critic",
        issue: "Expecting perfection from yourself on day one, which occasionally delays starting.",
        solution: "Embrace joyful consistency over perfection. Even 10 focused minutes of daily progress transforms your life.",
        cosmicAnchor: "Saturn Grounding & Patience",
      },
      {
        id: "issue_2",
        title: "Saying Yes to Your Own Needs First",
        issue: "Always being available for others while putting your own creative dreams on the backburner.",
        solution: "Protect your sacred morning hour. When you fill your own cup first, you give to the world from overflow.",
        cosmicAnchor: "Lagna Self-Honoring",
      },
      {
        id: "issue_3",
        title: "Trusting Your Unique Life Timing",
        issue: "Feeling anxious when comparing your journey to the timelines of friends or peers.",
        solution: "Your cosmic path has its own magnificent blossoming season. Honor your pace; everything is falling into place.",
        cosmicAnchor: "Jupiter Divine Timing",
      },
    ],
    issuesSpeechEn:
      "Here is your Life Direction guidance. First, silence self-doubt by standing tall in your 1st-house Lagna power. Second, protect your sacred morning hour before attending to others. And third, trust Jupiter's divine timing — your journey is blossoming exactly on schedule.",
    issuesSpeechHi:
      "यहाँ आपके आत्म-विकास के सूत्र हैं। पहला, अपने लग्न भाव की शक्ति से हर आत्म-संदेह को शांत करें। दूसरा, दूसरों से पहले अपने सुबह के समय को अपने सपनों के लिए सुरक्षित रखें। और तीसरा, कायनात के समय पर विश्वास रखें — आपकी तरक्की सही समय पर हो रही है। पूरे विश्वास से आगे बढ़ें।",
  },

  numerology: {
    category: "Name & Numerology",
    kundliTitle: "Benefits of Your Astrological Blueprint",
    kundliDescription:
      "Your birth chart planetary rulers energize the letters of your name, creating harmonious synergy between your astrological destiny and your vibrational signature.",
    kundliHook:
      "Celestial rulers empower your name with charisma, authority, and auspicious fortune.",
    kundliBenefits: [
      {
        title: "Cosmic Phonetic Harmony",
        description: "Your name resonates with your beneficial planets, amplifying your voice and personal authority.",
        highlight: "Vocal Authority",
      },
      {
        title: "Auspicious Fortune Alignment",
        description: "Aligning your name vibration with your birth planetary ruler removes friction from new beginnings.",
        highlight: "Smooth Path",
      },
      {
        title: "Instant First-Impression Magnetism",
        description: "Your energetic sound signature naturally commands respect, warmth, and attention in social and work spheres.",
        highlight: "Magnetic Presence",
      },
    ],
    kundliSpeechEn:
      "Your astrological alignment gives your name an incredible resonance. Your planetary rulers empower your personal vibration with charisma, authority, and positive fortune. Let's see how your numbers amplify this power.",
    kundliSpeechHi:
      "आपकी जन्म कुंडली आपके नाम और वाणी को विशेष आकर्षण और प्रभाव प्रदान करती है। आपके शुभ ग्रह आपके जीवन में शुभ अवसर और मान-सम्मान बढ़ाते हैं। आइए आपके अंकों का शुभ प्रभाव देखें।",

    numerologyTitle: "Benefits of Your Full Numerology Breakdown",
    numerologyDescription:
      "Every letter in your name carries a distinct sacred vibration that shapes how the world perceives you and supports your goals.",
    numerologyHook:
      "Your full name reduction reveals hidden talents and your highest destiny vibration.",
    numerologyBenefits: [
      {
        title: "Clear Destiny Vibration",
        description: "Your overall name sum reveals your natural gift for attracting supportive opportunities and loyal friends.",
        highlight: "Auspicious Alliances",
      },
      {
        title: "Inner Soul Fulfillment",
        description: "Your vowel frequency clarifies your deepest heartfelt desires, helping you live with purpose and joy.",
        highlight: "Soul Purpose",
      },
      {
        title: "Optimal Personal Year Timing",
        description: "Knowing your current numerological cycle allows you to make big moves with effortless celestial backing.",
        highlight: "Celestial Backing",
      },
    ],
    numerologySpeechEn:
      "Your complete name analysis reveals an auspicious frequency of clarity and success. Every syllable in your name contributes to your personal momentum. Your complete report is ready for you now.",
    numerologySpeechHi:
      "आपके नाम का सम्पूर्ण अंक विश्लेषण बहुत शुभ और प्रगतिशील है। यह आपके जीवन में सकारात्मकता और नए अवसरों का मार्ग प्रशस्त करता है। आपकी रिपोर्ट तैयार है।",

    issues: [
      {
        id: "issue_1",
        title: "Choosing Spellings with Full Confidence",
        issue: "Wondering whether a slight change in spelling will enhance your luck and clarity.",
        solution: "Your existing core numbers carry natural strength. Focus on using your name with full confidence and joy.",
        cosmicAnchor: "Destiny Number Radiance",
      },
      {
        id: "issue_2",
        title: "Matching Your Public Name with Your Heart",
        issue: "Feeling that how the world sees you doesn't fully capture your rich internal evolution.",
        solution: "Align your Soul Urge with your public presence by expressing your true creative voice more openly.",
        cosmicAnchor: "Soul Urge Expressiveness",
      },
      {
        id: "issue_3",
        title: "Synchronizing with Your Personal Year",
        issue: "Wanting to know whether this is a year for rapid expansion or building strong roots.",
        solution: "Your personal year vibration favors steady, purposeful growth. Every positive action is bearing fruit.",
        cosmicAnchor: "Personal Year Synchronization",
      },
    ],
    issuesSpeechEn:
      "Here is your Sacred Numerology roadmap. First, embrace your name spelling with complete confidence and positive pride. Second, align your public work with what truly lights up your Soul Urge number. And third, pace bold moves with your auspicious Personal Year cycle.",
    issuesSpeechHi:
      "यहाँ आपके अंक ज्योतिष के समाधान हैं। पहला, अपने नाम की शक्ति पर पूरा विश्वास रखें। दूसरा, अपने सार्वजनिक काम को अपने दिल की सच्ची खुशी से जोड़ें। और तीसरा, अपने व्यक्तिगत वर्ष चक्र के अनुसार सही समय पर बड़े निर्णय लें। आपके अंक आपकी सबसे बड़ी ताकत हैं।",
  },
};

export function getCategoryInsight(focus: string): CategoryInsightData {
  return CATEGORY_INSIGHTS[focus] ?? CATEGORY_INSIGHTS.growth;
}
