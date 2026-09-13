import { useState } from "react";
import GuideDialog from "./GuideDialog";

export default function UnlockPreview({open,onEnterApp,onBack,report,externalError}:{open:boolean;onEnterApp:()=>void;onBack:()=>void;report:string;externalError?:string}) {
  const [stage,setStage]=useState<"plan"|"phone"|"otp"|"ready">("plan");
  const [phone,setPhone]=useState(""),[code,setCode]=useState(""),[error,setError]=useState("");
  return <GuideDialog open={open} onDismiss={onBack} titleId="unlock-title" className="unlock-preview">
    <p className="journey-eyebrow">YOUR NEXT CHAPTER · PREVIEW</p>
    <h2 id="unlock-title">{stage==="plan"?"You’ve seen the pattern. Now explore your next move.":stage==="phone"?"Keep your reading close.":stage==="otp"?"Try the verification preview.":"Your next chapter is waiting."}</h2>
    <p className="unlock-lead">{report} · A personal space to understand your options and turn reflection into action.</p>
    {stage==="plan" && <>
      <div className="unlock-plan"><span>THE COMPLETE READING</span><h3>From insight to a clear next step</h3><ul><li>Your remaining chapters and relevant tradeoffs</li><li>A conversation starter for your situation</li><li>A practical next-step plan to return to</li><li>Your chart and name-number breakdown together</li></ul><p>Pricing will be available when payments launch.</p></div>
      <button className="journey-primary" onClick={()=>setStage("phone")}>Preview the unlock flow →</button>
    </>}
    {stage==="phone" && <form className="journey-form" onSubmit={e=>{e.preventDefault();if(phone.replace(/\D/g,"").length<10 || phone.replace(/\D/g,"").length>15){setError("Enter a mobile number with 10 to 15 digits.");return;}setError("");setStage("otp")}}><label>Mobile number<input type="tel" autoComplete="tel" inputMode="tel" pattern="[+]?[0-9 ]{10,20}" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210" /></label><p className="journey-caption">Demo only. Your number stays in this screen. No SMS is sent.</p><button className="journey-primary">Continue to demo OTP →</button></form>}
    {stage==="otp" && <form className="journey-form" onSubmit={e=>{e.preventDefault();if(code!=="123456"){setError("Use the displayed demo code: 123456.");return;}setError("");setStage("ready")}}><label>Demo verification code<input autoComplete="off" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} placeholder="6-digit code" /></label><p className="demo-code">Demo code: <b>123456</b> · No SMS sent</p><button className="journey-primary">Preview verification →</button><button type="button" className="journey-link" onClick={()=>{setCode("");setError("")}}>Reset demo code</button></form>}
    {stage==="ready" && <div className="unlock-plan"><span>PREVIEW COMPLETE</span><h3>OTP and payment services are not connected yet.</h3><p>No identity has been verified, no payment has been taken, and no paid access has been granted.</p><button className="journey-primary" disabled>Payments coming soon</button></div>}
    {(error || externalError)&&<p role="alert" className="journey-error">{error || externalError}</p>}
    <button className="unlock-free" onClick={onEnterApp}>Continue to the app without payment →</button>
    <p className="unlock-note">Explore the app now. The full-reading unlock shown here is a preview; your saved details are retained.</p>
    <button className="journey-link" onClick={onBack}>← Back to my preview</button>
  </GuideDialog>;
}
