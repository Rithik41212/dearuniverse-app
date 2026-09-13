import type { Profile } from "./api";
import type { Numbers } from "./NumerologyPanel";
import { getCategoryInsight } from "./categoryInsights";

const followups:Record<string,{question:string;hi:string;choices:string[];hiChoices:string[]}>= {
  marriage:{question:"What would help you feel ready for that conversation?",hi:"उस बातचीत के लिए क्या मदद करेगा?",choices:["Clearer expectations","More time to decide","A way to talk to family"],hiChoices:["साफ़ उम्मीदें","सोचने का समय","परिवार से बात का तरीका"]},
  relationships:{question:"What feels hardest to say out loud?",hi:"कौन सी बात कहना सबसे मुश्किल लगता है?",choices:["What I need","What hurt me","What I hope changes"],hiChoices:["मेरी ज़रूरत","जो बात दुख देती है","जो बदलना चाहता हूँ"]},
  career:{question:"What is the biggest obstacle to your next move?",hi:"अगले कदम में सबसे बड़ी रुकावट क्या है?",choices:["Knowing my strengths","Choosing between options","Finding confidence"],hiChoices:["अपनी ताकत समझना","विकल्पों में चुनाव","आत्मविश्वास"]},
  business:{question:"Where does your business need your attention first?",hi:"व्यापार में सबसे पहले कहाँ ध्यान चाहिए?",choices:["Understanding customers","Making the offer clearer","Aligning with a partner"],hiChoices:["ग्राहक को समझना","प्रस्ताव साफ़ करना","साझेदार से तालमेल"]},
  numerology:{question:"What matters most about the name you choose?",hi:"नाम चुनते समय सबसे ज़रूरी क्या है?",choices:["It feels like me","It is easy to remember","It reflects a new beginning"],hiChoices:["मेरी पहचान","याद रखना आसान हो","नई शुरुआत का एहसास"]},
  growth:{question:"What would make a small next step feel possible?",hi:"एक छोटा कदम संभव बनाने में क्या मदद करेगा?",choices:["A clearer priority","A steadier routine","Less pressure to be perfect"],hiChoices:["साफ़ प्राथमिकता","बेहतर दिनचर्या","सही होने का कम दबाव"]},
};
export const followupFor=(focus:string)=>followups[focus]??followups.growth;

export function discoveryNarration(step:number,profile:Profile| null,numbers:Numbers|undefined,hi:boolean,focus:string) {
  const name=profile?.birth.name??"";
  const insight = getCategoryInsight(focus);
  if(step===7 && profile){
    return hi ? `${name}, ${insight.kundliSpeechHi}` : `${name}, ${insight.kundliSpeechEn}`;
  }
  if(step===8 && numbers){
    return hi ? `${name ? `${name}, ` : ""}${insight.numerologySpeechHi}` : `${name ? `${name}, ` : ""}${insight.numerologySpeechEn}`;
  }
  if(step===4){
    return hi ? insight.issuesSpeechHi : insight.issuesSpeechEn;
  }
  if(step===9){const f=followupFor(focus);return hi?`आगे बढ़ने से पहले आपकी बात सुनना चाहेंगे। ${f.hi} एक विकल्प चुनें, या अपने शब्दों में थोड़ा और बताएँ।`:`Before we go further, let’s make this more personal. ${f.question} Choose what feels closest, and add anything you want me to understand.`;}
  if(step===10)return hi?"आपने अपनी बात को थोड़ी और स्पष्टता दी है। अगले अध्याय में विकल्पों के फायदे, महत्वपूर्ण अंतर्दृष्टि और एक छोटा कदम साथ रखेंगे। अपनी पूरी रीडिंग का प्रीव्यू देखें, या अभी ऐप में आगे बढ़ें।":"You’ve begun to put words to what matters. The next chapters bring your opportunities, strengths, and a practical next step together. Explore the full-reading preview, or continue into your space in the app.";
  return null;
}

