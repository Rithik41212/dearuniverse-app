"""Category-specific conversational direction and useful offline reflections."""

TITLES = ['What matters to you', 'Strengths to lean on', 'What could work better', 'The tradeoff to consider', 'A conversation worth having', 'Your next small step']
HINDI_TITLES = ['आपके लिए क्या ज़रूरी है', 'आपकी मदद करने वाली ताकत', 'क्या बेहतर हो सकता है', 'कहाँ ध्यान देना है', 'एक ज़रूरी बातचीत', 'आपका अगला छोटा कदम']

GUIDANCE = {
    'marriage': {
        'hook': 'Sab poochte hain kab. Aap sochiye, kaisa?',
        'report': 'Vivah Samvaad',
        'focus': 'Marriage readiness, shared values, expectations, family pressure and questions to discuss. Never predict a wedding date or assume marital status.',
        'en': [
            'Everyone asks when. What kind of marriage would feel right to you? Start with how you want everyday life to feel: respected, supported, and free to be yourself. Your own answer deserves space alongside other people’s expectations.',
            'Knowing what matters to you can make a difficult decision clearer. Name one value you would like to share with a partner, and one difference you could welcome. Shared values can help without requiring identical personalities.',
            'Talking about ordinary life can reveal more than trying to impress each other. Discuss work, home responsibilities, money habits and personal space. Clear expectations can prevent avoidable misunderstandings later.',
            'Taking more time can bring clarity, though it may mean a difficult conversation with family. Moving quickly may ease that pressure, but leave important questions unanswered. Give yourself a realistic time to think, then name what you still need to know.',
            'Try opening with: “Before we decide, I would love to understand what a good everyday life looks like for each of us.” Listen for how differences are handled as well as where you agree. Respectful disagreement is useful information too.',
            'Write down three values and one question you want to discuss before taking the next step. Choose a calm moment to share just one of them. Afterwards, notice whether you felt heard and whether you also made room for the other person.',
        ],
        'hi': [
            'सब पूछते हैं कब। आप सोचिए, कैसा? ऐसा रिश्ता जिसमें आपकी बात सुनी जाए और आप खुद जैसे रह सकें। दूसरों की उम्मीदों के साथ अपनी इच्छा को भी जगह दें।',
            'अपने लिए ज़रूरी बात पहचानना फैसले को आसान बना सकता है। साथी के साथ साझा करने वाला एक मूल्य लिखें और एक ऐसा अंतर जिसे आप स्वीकार कर सकते हैं। हर पसंद का एक जैसा होना ज़रूरी नहीं।',
            'रोज़मर्रा की ज़िंदगी पर बात करने से उम्मीदें साफ़ हो सकती हैं। काम, घर की ज़िम्मेदारी, पैसे की आदत और निजी समय पर चर्चा करें। इससे बाद की गलतफ़हमियाँ कम करने में मदद मिल सकती है।',
            'थोड़ा समय लेने से स्पष्टता मिल सकती है, लेकिन परिवार से मुश्किल बातचीत भी करनी पड़ सकती है। जल्दी फैसला दबाव घटा सकता है, पर कुछ सवाल बाकी रह सकते हैं। सोचने का समय और ज़रूरी सवाल तय करें।',
            'कहकर देखें: फैसला लेने से पहले मैं समझना चाहती हूँ कि हम दोनों के लिए अच्छी रोज़मर्रा की ज़िंदगी कैसी होगी। सहमति के साथ असहमति संभालने का तरीका भी सुनें। सम्मान से बात होना भी एक अहम संकेत है।',
            'अपने तीन मूल्य और एक सवाल लिखें। शांत समय में उनमें से एक बात साझा करें। बाद में सोचें कि क्या आपकी बात सुनी गई और आपने भी दूसरे को जगह दी।',
        ],
    },
    'relationships': {
        'hook': 'Baat hoti hai. Phir bhi baat pahunchti nahi?',
        'report': 'Rishton Ka Aaina',
        'focus': 'Communication, reciprocity, connection, recurring patterns and personal needs. Do not assume a partner exists or claim to know their feelings.',
        'en': [
            'You talk, but does your meaning reach the other person? Start by noticing when you feel most understood, whether in romance or another close connection. That moment can offer a clue about the kind of care you value.',
            'Being able to name a need is a strength you can practise. Instead of hoping someone guesses, try one clear request. It gives the other person a fair chance to respond and helps you see what support is actually available.',
            'A small, consistent gesture can be easier to sustain than a grand promise. Try a short check-in where each person gets uninterrupted time. The benefit is room for both voices; the aim is understanding, not winning.',
            'Opening up can create closeness, but it also asks for vulnerability. If a conversation is getting heated, a pause can help, provided you agree when to return. Repeatedly postponing every difficult topic can leave needs unspoken.',
            'Try: “I feel closest to you when we have time to listen. Could we make a little room for that?” Ask what helps them feel connected too. If you are exploring new love, use the same question to understand what connection means to you.',
            'Choose one request that is specific and possible this week. Share it gently, then notice the response rather than guessing at intentions. Keep room for your own boundaries and for an honest answer.',
        ],
        'hi': [
            'बात होती है। फिर भी बात पहुँचती नहीं? याद करें कि किस बातचीत में आपको सबसे अधिक समझा गया। वह पल बता सकता है कि आपके लिए अपनापन कैसा महसूस होता है।',
            'अपनी ज़रूरत को नाम देना एक अभ्यास है। सामने वाला अंदाज़ा लगाए, इसकी जगह एक साफ़ अनुरोध करें। इससे उसे जवाब देने का मौका मिलता है और आपको उपलब्ध सहारा समझ आता है।',
            'छोटा और नियमित प्रयास बड़े वादे से आसान हो सकता है। थोड़ी देर ऐसी बातचीत करें जिसमें दोनों बिना टोके बोल सकें। मकसद जीतना नहीं, एक-दूसरे को समझना है।',
            'खुलकर बोलने से नज़दीकी बढ़ सकती है, लेकिन संकोच भी महसूस हो सकता है। बातचीत गर्म होने लगे तो लौटने का समय तय करके विराम लें। हर मुश्किल बात टालने से ज़रूरतें अनसुनी रह सकती हैं।',
            'कहकर देखें: जब हम ध्यान से सुनते हैं, मुझे अपनापन महसूस होता है। क्या हम इसके लिए थोड़ा समय रख सकते हैं? उनकी बात भी पूछें। नए रिश्ते की तलाश में हैं तो पहले खुद से यही सवाल करें।',
            'इस हफ्ते पूरा हो सकने वाला एक साफ़ अनुरोध चुनें। उसे सहजता से कहें और इरादे का अंदाज़ा लगाने की जगह जवाब सुनें। अपनी सीमाओं और सच्चे जवाब, दोनों को जगह दें।',
        ],
    },
    'career': {
        'hook': 'Mehnat poori hai. Phir bhi kuch atka hai? Kaam kar rahe hain. Par kya aage badh rahe hain?',
        'report': 'Career Disha / Vyapar Disha',
        'focus': 'Job changes, growth, field choice, self-employment, customers, profit and partnerships. Distinguish employment from business using the user’s context; avoid financial directives.',
        'en': [
            'The effort is there. Is it taking you somewhere you want to go? Define progress in your own terms: learning, recognition, a better role, or solving a real customer problem. One clear definition can make the next decision easier.',
            'Look for a strength you have already used in a real situation. What did someone trust you to solve, and what did you enjoy improving? Write down that example so your next conversation is grounded in experience.',
            'A focused experiment can turn uncertainty into useful feedback. At work, ask what one improvement would make the biggest difference. In a business, ask a customer what is still frustrating them before adding another offer.',
            'Staying can give you stability and time to build skills, while a new direction may offer learning at the cost of uncertainty. Compare the actual workload, support and resources each option needs. A small trial can help before a larger commitment.',
            'Try asking a manager, mentor or customer: “What would make my contribution more useful over the next month?” Ask for one concrete example. It can turn vague pressure to do more into a task you can evaluate.',
            'Choose one skill or customer problem to work on this week. Set aside two short sessions and decide what useful feedback would look like. Review what you learned before adding another commitment.',
        ],
        'hi': [
            'मेहनत पूरी है। फिर भी कुछ अटका है? आपके लिए आगे बढ़ने का मतलब क्या है: सीखना, पहचान, बेहतर भूमिका या ग्राहक की समस्या हल करना? एक साफ़ जवाब अगला फैसला आसान बना सकता है।',
            'किसी असली अनुभव में इस्तेमाल की गई अपनी ताकत पहचानें। किस समस्या के लिए किसी ने आप पर भरोसा किया और क्या सुधारना आपको अच्छा लगा? वह उदाहरण लिखें ताकि अगली बातचीत अनुभव से जुड़ी हो।',
            'छोटा प्रयोग अनिश्चितता को उपयोगी सीख में बदल सकता है। नौकरी में पूछें कि कौन सा सुधार सबसे मददगार होगा। व्यापार में नया प्रस्ताव जोड़ने से पहले ग्राहक की परेशानी सुनें।',
            'अभी के काम में बने रहने से स्थिरता और सीखने का समय मिल सकता है। नई दिशा अवसर के साथ अनिश्चितता भी ला सकती है। दोनों में लगने वाला समय, सहारा और संसाधन देखें; पहले छोटा प्रयोग उपयोगी हो सकता है।',
            'मैनेजर, मार्गदर्शक या ग्राहक से पूछें: अगले महीने मेरा योगदान अधिक उपयोगी कैसे हो सकता है? एक ठोस उदाहरण माँगें। इससे ज़्यादा करने का अस्पष्ट दबाव एक समझने योग्य काम बन सकता है।',
            'इस हफ्ते एक कौशल या ग्राहक की समस्या चुनें। उसके लिए दो छोटे समय तय करें और सोचें कि उपयोगी प्रतिक्रिया कैसी होगी। नई ज़िम्मेदारी जोड़ने से पहले मिली सीख देखें।',
        ],
    },
    'growth': {
        'hook': 'Sabki sun li. Ab thoda apni sunein?',
        'report': 'Jeevan Disha',
        'focus': 'Priorities, next steps, routines, confidence and self-understanding. Explore possibilities without predicting events or claiming destiny is fixed.',
        'en': [
            'You have heard everyone else. What would you hear if you made a little room for yourself? Name one thing you want more of in everyday life. You do not need a complete life plan to begin with an honest preference.',
            'Think of a time you adapted to something unfamiliar. What helped: curiosity, patience, a routine, or asking for support? That is a resource you can try again without expecting yourself to have every answer.',
            'A small experiment can make an unclear direction easier to explore. Give one interest a little time and notice whether it creates energy or simply adds pressure. Both responses are useful information.',
            'Keeping familiar routines can offer steadiness, while trying something new can bring learning and discomfort together. You can protect one reliable habit while testing a change. Avoid turning a fresh start into a demand to change everything.',
            'Ask someone you trust: “When have you seen me most engaged in what I’m doing?” Listen for examples, then decide what fits your own experience. Their perspective can support your judgment without replacing it.',
            'Make twenty minutes for one thing you keep wishing you had time for. Afterwards, write what felt useful and what you would change. Repeat a small step that fits your life instead of waiting for perfect certainty.',
        ],
        'hi': [
            'सबकी सुन ली। अब थोड़ा अपनी सुनें? रोज़मर्रा की ज़िंदगी में किस चीज़ के लिए अधिक जगह चाहते हैं? शुरुआत के लिए पूरी जीवन योजना नहीं, एक ईमानदार इच्छा काफ़ी हो सकती है।',
            'किसी नए हालात में खुद को ढालने का समय याद करें। जिज्ञासा, धैर्य, दिनचर्या या किसी का सहारा, क्या मददगार था? वही ताकत फिर इस्तेमाल कर सकते हैं; हर जवाब पहले से जानना ज़रूरी नहीं।',
            'छोटा प्रयोग धुंधली दिशा को समझना आसान कर सकता है। किसी रुचि को थोड़ा समय दें और देखें कि ऊर्जा मिलती है या दबाव बढ़ता है। दोनों अनुभव उपयोगी जानकारी हैं।',
            'पुरानी दिनचर्या स्थिरता दे सकती है और नई कोशिश सीख के साथ असहजता भी ला सकती है। एक सहायक आदत बनाए रखते हुए बदलाव आज़माएँ। नई शुरुआत का मतलब सब कुछ एक साथ बदलना नहीं है।',
            'किसी भरोसेमंद व्यक्ति से पूछें: आपने मुझे कब सबसे अधिक मन लगाकर काम करते देखा है? उदाहरण सुनें और अपने अनुभव से मिलाएँ। उनकी नज़र आपके फैसले का सहारा बन सकती है, उसकी जगह नहीं।',
            'उस चीज़ के लिए बीस मिनट निकालें जिसके लिए समय मिलने की इच्छा रहती है। बाद में लिखें कि क्या उपयोगी लगा और क्या बदलेंगे। पूरे भरोसे का इंतज़ार करने की जगह जीवन में फिट होने वाला छोटा कदम दोहराएँ।',
        ],
    },
}

GUIDANCE['business'] = {
    **GUIDANCE['career'],
    'report': 'Vyapar Disha',
    'focus': 'Business only: customers, product-market fit, partnerships, starting up and sustainable workload. Discuss practical experiments and tradeoffs without predicting profit or giving investment instructions.',
    'en': [
        'You have put your heart into this. Where does the business feel stuck: reaching people, explaining your offer, or delivering it sustainably? Pick one bottleneck rather than treating everything as urgent.',
        'Remember a time a customer chose your work or thanked you. What were they actually valuing? That is a better starting point for your next offer than trying to please everybody.',
        'A clearer offer can help the right customer recognise what you do. Describe one problem you solve, who it is for, and what the next step looks like. Test whether someone unfamiliar with your business understands it.',
        'A partnership can bring skills and shared effort, but unclear roles can create friction. Talk through responsibilities, decision-making and how to handle disagreement before committing. Leave room to check practical and professional advice where needed.',
        'Ask one customer: What was difficult before you found us, and what still feels difficult? Listen before describing your next idea. Their words can help you identify a useful, manageable experiment.',
        'Choose one offer and one group of customers. Try a small improvement this week, then review the actual feedback and effort involved. Let evidence, available resources and your judgment shape the next decision.',
    ],
    'hi': [
        'मेहनत पूरी है। फिर भी कुछ अटका है? ग्राहक तक पहुँचना, प्रस्ताव समझाना या काम संभालना, इनमें सबसे बड़ी रुकावट कौन सी है? अभी एक पर ध्यान दें।',
        'किस ग्राहक ने आपके काम की तारीफ़ की थी? उसे किस बात से मदद मिली? सबको खुश करने की जगह उस उपयोगिता से अगला प्रस्ताव शुरू करें।',
        'साफ़ प्रस्ताव सही ग्राहक को समझने में मदद कर सकता है। एक समस्या, उसके ग्राहक और अगले कदम को आसान शब्दों में बताएँ। किसी नए व्यक्ति से पूछें कि उसे क्या समझ आया।',
        'साझेदारी कौशल और मेहनत बाँट सकती है, लेकिन अस्पष्ट भूमिकाएँ तनाव बढ़ा सकती हैं। ज़िम्मेदारी, फैसले और असहमति पर पहले बात करें। बड़े कदम के लिए व्यावहारिक जानकारी जाँचें।',
        'एक ग्राहक से पूछें: आप हमारे पास आने से पहले किस परेशानी में थे और अभी क्या मुश्किल है? नया विचार बताने से पहले सुनें। उनकी बात छोटा प्रयोग चुनने में मदद कर सकती है।',
        'एक प्रस्ताव और एक ग्राहक समूह चुनें। इस हफ्ते छोटा सुधार आज़माएँ और असली प्रतिक्रिया देखें। अगले फैसले में समय, संसाधन और अपनी समझ को जगह दें।',
    ],
}
GUIDANCE['numerology'] = {
    'hook': 'Nayi shuruaat hai. Naam bhi apna sa ho.', 'report': 'Naam Sanket',
    'focus': 'Name numerology: actual supplied name spelling and calculated numbers, symbolism, pronunciation, usability, identity and comparing names. Never promise that changing a name changes fate. Explain a relevant calculated number simply only if it helps the question.',
    'en': [
        'A new chapter deserves a name that feels like yours. What draws you to this name: its sound, meaning, family connection or the beginning it represents? That personal reason belongs at the centre of this exploration.',
        'Your name already carries associations through the way you use it. Notice what feels authentic when you introduce yourself. Numerology offers symbolic prompts; your own experience gives those prompts meaning.',
        'A spelling that is easy to say and recognise can make everyday introductions smoother. Say it aloud and imagine someone reading it for the first time. Practical ease matters alongside any symbolic interpretation.',
        'An unusual spelling can feel distinctive, but may need repeated explanation or administrative updates. Compare that effort with what you value about the change. A different spelling cannot guarantee different life outcomes.',
        'Try asking someone you trust: What do you hear or picture when I say this name? Listen without giving away the answer you hope for. Keep what fits your intentions and leave the rest.',
        'Write your preferred spelling exactly, say it aloud, and try it in a short introduction. For a business name, separately check availability and practical requirements. Give yourself a little time before making a lasting change.',
    ],
    'hi': [
        'नई शुरुआत है। नाम भी अपना सा हो। इस नाम में आपको क्या पसंद है: आवाज़, अर्थ, परिवार से जुड़ाव या नया अध्याय? यही निजी वजह बातचीत की शुरुआत है।',
        'आपके नाम के साथ आपके अनुभव जुड़े हैं। परिचय देते समय क्या स्वाभाविक लगता है, यह देखें। अंक परंपरा के संकेत हैं; उनका अर्थ अपनी ज़िंदगी से मिलाकर समझें।',
        'आसान वर्तनी और उच्चारण रोज़मर्रा के परिचय में मदद कर सकते हैं। नाम बोलकर देखें और सोचें कि नया व्यक्ति इसे कैसे पढ़ेगा। संकेतों के साथ व्यावहारिक सरलता भी मायने रखती है।',
        'अलग वर्तनी खास लग सकती है, लेकिन बार-बार समझाना या दस्तावेज़ बदलना पड़ सकता है। इस मेहनत और अपनी पसंद को साथ देखें। वर्तनी बदलने से जीवन के परिणाम तय नहीं होते।',
        'किसी भरोसेमंद व्यक्ति से पूछें: यह नाम सुनकर आपके मन में क्या आता है? अपनी पसंद का जवाब पहले न बताएँ। जो बात आपकी मंशा से मेल खाए उसे रखें।',
        'पसंदीदा वर्तनी ठीक-ठीक लिखें और एक छोटे परिचय में बोलें। व्यापार के नाम के लिए उपलब्धता और ज़रूरी नियम अलग से जाँचें। स्थायी बदलाव से पहले थोड़ा समय दें।',
    ],
}

def direction(focus):
    return GUIDANCE.get(focus, GUIDANCE['growth'])

def fallback_sections(profile, facts, numbers, body):
    content = direction(body.focus)
    titles = HINDI_TITLES if body.language == 'hi' else TITLES
    texts = list(content[body.language])
    if body.question:
        texts[0] += (' आपने चुना: ' if body.language == 'hi' else ' Your focus: ') + body.question[:160]
    if body.context:
        texts[1] += (' आपने साझा किया: ' if body.language == 'hi' else ' You shared: ') + body.context[:160]
    references = ['CORE_SUN', 'NUM_LIFE_PATH', 'LOVE_VENUS', 'GROWTH_SATURN', 'CORE_SUN', 'NUM_LIFE_PATH']
    available = {f['id'] for f in facts}
    return [{'id': str(i), 'title': titles[i], 'text': text,
             'fact_ids': [references[i] if references[i] in available else facts[0]['id']]} for i, text in enumerate(texts)]
