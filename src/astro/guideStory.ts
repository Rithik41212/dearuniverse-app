import { signs, type Profile } from "./api";
import type { Numbers } from "./NumerologyPanel";

const hindiSigns = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];

export function chartHighlights(profile: Profile, hi: boolean) {
  const chart = profile.charts.vedic;
  const label = (sign: string | null | undefined) =>
    sign ? (hi ? hindiSigns[signs.indexOf(sign)] ?? sign : sign) : hi ? "समय आवश्यक" : "Time needed";
  return [
    { label: hi ? "सूर्य राशि" : "Sun sign", value: label(chart.planets.Sun?.sign), glyph: "☉" },
    { label: hi ? "चंद्र राशि" : "Moon sign", value: label(chart.planets.Moon?.sign), glyph: "☾" },
    {
      label: hi ? "लग्न" : "Ascendant",
      value: label(chart.houses ? signs[Math.floor(((chart.houses.ascendant % 360) + 360) % 360 / 30)] : null),
      glyph: "✧",
    },
  ];
}

export function guideStory(
  step: number,
  hi: boolean,
  profile: Profile | null,
  numbers: Numbers | undefined,
  chapterText: string | undefined,
  fallback: string
) {
  const name = profile?.birth.name.split(" ")[0] ?? "";
  const highlights = profile ? chartHighlights(profile, hi) : null;

  const scripts = hi
    ? [
        // Step 0: Hook
        "ध्यान से सुनिए। जिस क्षण आपने अपनी पहली सांस ली, पूरे ब्रह्मांड ने आपके लिए सितारों के बीच एक अद्वितीय आकाशीय मानचित्र अंकित कर दिया। नौ ग्रह, बारह भाव और सत्ताईस नक्षत्र—एक ऐसा संयोग जो सृष्टि में न पहले कभी बना, और न दोबारा कभी बनेगा। प्राचीन वैदिक महर्षियों के ज्ञान और आधुनिक सटीक खगोल गणनाओं से, मैं आपकी व्यक्तिगत मार्गदर्शिका हूँ। चलिए आपके जन्म के आकाश, आपकी कुंडली और आपके भाग्य के उन रहस्यों को खोलते हैं जो केवल आपके लिए बने हैं।",
        // Step 1: Birth details
        "हर महान यात्रा समय और स्थान के एक सटीक बिंदु से शुरू होती है। अपना नाम, जन्म तिथि और जन्मस्थान दर्ज कीजिए। यदि जन्म का समय ज्ञात है, तो अवश्य जोड़िए—वह आपके लग्न और जीवन के दृष्टिकोण को उजागर करता है। यदि समय याद न हो, तो अज्ञात चुनिए; ग्रह फिर भी आपके स्वभाव और मन की दिशा बताएंगे।",
        // Step 2: First chart reveal
        `${name ? `${name}, ` : ""}देखिए आपके जन्म के समय का आकाश। ${highlights ? `आपकी गणना में सूर्य ${highlights[0].value} राशि में आत्मबल का प्रतीक है, और चंद्रमा ${highlights[1].value} में आपके भाव-संसार को दर्शाता है। ` : ""}यह आपकी आकाशीय नींव है। आज आप अपने जीवन के किस पहलू को सबसे गहराई से समझना चाहेंगे? नीचे एक विषय चुनिए।`,
        // Step 3: Question
        "अब सितारों के इस नक्शे को आपकी वास्तविक ज़िंदगी से जोड़ते हैं। कौन सा सवाल इस समय आपके मन में गूंज रहा है? आप क्या हासिल करना चाहते हैं या किस दिशा में स्पष्टता की तलाश है? अपने शब्दों में साझा कीजिए।",
        // Step 4: Numerology
        numbers
          ? `${name ? `${name}, ` : ""}अब आपके अंकों का रहस्य खुलता है। आपकी जन्म तिथि से जीवन पथ अंक ${numbers.life_path.value} निकलता है—जो ${numbers.life_path.theme} का मार्ग है। ${numbers.destiny ? `आपके नाम की ध्वनि से अभिव्यक्ति अंक ${numbers.destiny.value} बनता है। ` : ""}${numbers.soul_urge ? `और आपके अंतरमन का अंक ${numbers.soul_urge.value} आपके दिल की गहरी चाहतों को छूता है। ` : ""}देखिए यह अंक आपकी जन्म कुंडली से कैसे मिलते हैं। अब आपकी संपूर्ण रीडिंग को खोलते हैं।`
          : fallback,
        // Step 5: Chapters
        chapterText ?? fallback,
        // Step 6: Q&A Conversation
        "नक्शा बन चुका है, लेकिन सफ़र आपको तय करना है। इस रीडिंग की कौन सी बात आपके दिल को छू गई? आगे बढ़ने से पहले आपके मन में क्या सवाल है? नीचे अपना प्रश्न पूछिए—मैं आपके साथ हूँ।",
      ]
    : [
        // Step 0: Hook
        "Listen closely. The exact second you took your first breath, the universe froze an unrepeatable geometric blueprint across the stars. Nine planets, twelve houses, twenty-seven lunar mansions—aligned in an orchestration that has never occurred before, and will never occur again. Ancient Vedic wisdom understood this code, and high-precision celestial astronomy calculates it to the exact arcsecond. I am your personal cosmic guide. Let’s unveil the secret patterns of your life, your gifts, and your destiny.",
        // Step 1: Birth details
        "Every great journey begins with an exact coordinate in space and time. Enter your name, birth date, and the city where you entered this world. If you know your birth time down to the minute, share it—that unlocks your rising sign, the lens through which you meet life. If the time is approximate or unknown, the cosmos still reveals your Sun, Moon, and profound planetary patterns.",
        // Step 2: First chart reveal
        `${name ? `${name}, ` : ""}behold the sky at the dawn of your life. ${highlights ? `Your Sun shines in ${highlights[0].value}, illuminating your core vitality, while your Moon rests in ${highlights[1].value}, holding the quiet truths of your emotional realm. ` : ""}This is your celestial foundation. Now, where shall we focus your lens today? Choose the path below that calls to you most urgently.`,
        // Step 3: Question
        "Now we bridge the celestial with your living reality. What question has been echoing in your thoughts? What are you building, seeking, or longing to transform? Speak openly and authentically. We bring timeless insight to meet your real life.",
        // Step 4: Numerology
        numbers
          ? `${name ? `${name}, ` : ""}now your numbers awaken. Your birth date carries the vibration of Life Path ${numbers.life_path.value}—the archetype of ${numbers.life_path.theme}. ${numbers.destiny ? `The letters in your name resonate with Destiny number ${numbers.destiny.value}, reflecting your expressed talents. ` : ""}${numbers.soul_urge ? `And your inner vowels sound the frequency of Soul Urge ${numbers.soul_urge.value}, the secret craving of your spirit. ` : ""}Notice how these numbers mirror the very same themes written in your planetary chart. Let's see how they unite in your personal reading.`
          : fallback,
        // Step 5: Chapters
        chapterText ?? fallback,
        // Step 6: Q&A Conversation
        "The map has been drawn, but the journey is yours to walk. What part of your reading stirred something inside you? What clarity do you need before you step forward? Ask me anything below—I am right here with you.",
      ];

  return scripts[step] ?? fallback;
}
