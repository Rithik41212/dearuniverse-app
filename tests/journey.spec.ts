import { test, expect, type Page } from "@playwright/test";

const categories = [
  ["Marriage", "marriage", "What would make marriage feel right for you?"],
  ["Love", "relationships", "Where would you like a little more connection?"],
  ["Career Report", "career", "What would progress look like right now?"],
  ["Life Direction", "growth", "What would you like your next chapter to hold?"],
  ["Business Guidance", "business", "Where would a clearer plan help your business?"],
  ["Naam Sanket", "numerology", "What would you like to explore about your name?"],
];
function wav(seconds = 2) {
  const size = 16000 * seconds * 2, data = Buffer.alloc(44 + size);
  data.write("RIFF"); data.writeUInt32LE(36 + size, 4); data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16,16); data.writeUInt16LE(1,20); data.writeUInt16LE(1,22);
  data.writeUInt32LE(16000,24); data.writeUInt32LE(32000,28); data.writeUInt16LE(2,32); data.writeUInt16LE(16,34);
  data.write("data",36); data.writeUInt32LE(size,40);
  for (let i=0;i<size/2;i++) data.writeInt16LE(Math.round(Math.sin(i*.086)*3500),44+i*2);
  return data.toString("base64");
}
async function speechFixture(page: Page, available = true, seconds = 2) {
  await page.route("**/api/journey/guide", route => {
    const body = route.request().postDataJSON();
    return route.fulfill({json:{ text:`Your ${body.focus} conversation begins here. What would you like to feel different?`, source:"test-ai" }});
  });
  await page.route("**/api/journey/utterance", route => available ? route.fulfill({json:{audio:wav(seconds),mime:"audio/wav",source:"test-neural",voice:"test",timing:"word-boundaries",words:[{text:"Your conversation begins here.",start:0,end:seconds}]}}) : route.fulfill({status:503,json:{detail:"Unavailable"}}));
}
async function startReading(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start my reading", exact: true }).click();
}

test("startup offers login and reading entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Log in", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start my reading", exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/welcome-gate-mobile.png", fullPage: true });
  await expect(page.getByRole("button", { name: "Marriage", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Start my reading", exact: true }).click();
  await expect(page.getByRole("button", { name: "Marriage", exact: true })).toBeVisible();
});

test("login opens the saved-profile app", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
});

for (const [label, focus, question] of categories) test(`${label} shows only the particle planet until its spoken question ends`, async ({page}) => {
  await speechFixture(page); await startReading(page);
  await expect(page.locator(".reading-portal, .landing-secondary button")).toHaveCount(6);
  const request = page.waitForRequest(r => r.url().endsWith("/journey/guide") && r.method()==="POST");
  await page.getByRole("button", {name:label,exact:true}).click();
  expect((await request).postDataJSON().focus).toBe(focus);
  await expect(page.locator(".immersive-guide")).toHaveAttribute("data-phase","speaking");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".particle-planet")).toBeVisible();
  await expect(page.locator(".journey-top, .journey-footer, .portrait-name, .portrait-live")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toBeVisible({timeout:10000});
  await expect(page.getByRole("heading",{name:question,exact:true})).toBeVisible();
  await page.locator(".intention-options button").first().click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".immersive-guide")).toHaveAttribute("data-phase","speaking");
  await expect(page.getByLabel("What is on your mind?")).toBeVisible({timeout:10000});
});

test("pausing never opens a question early and settings return to a clean stage",async({page})=>{
  await speechFixture(page,true,3); await startReading(page);
  await page.getByRole("button",{name:"Marriage",exact:true}).click();
  await expect(page.locator(".immersive-guide")).toHaveAttribute("data-phase","speaking");
  await page.getByRole("button",{name:"Guide controls",exact:true}).click();
  await expect(page.locator(".immersive-guide")).toHaveAttribute("data-phase","paused");
  await expect(page.getByRole("heading",{name:"Your conversation"})).toBeVisible();
  await page.waitForTimeout(3200); // Longer than the audio: paused time must not trigger a question.
  await expect(page.locator('.guide-dialog[aria-labelledby="guide-question-title"]')).not.toHaveAttribute("open","");
  await page.getByRole("button",{name:"Resume guide",exact:true}).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading",{name:categories[0][2]})).toBeVisible({timeout:10000});
  await page.getByRole("button",{name:"Listen again",exact:true}).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("particle planet animates, voice and music controls work, and no portraits remain",async({page})=>{
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await speechFixture(page,true,8);await page.setViewportSize({width:1440,height:900});await startReading(page);
  await page.getByRole("button",{name:"Marriage",exact:true}).click();
  await expect(page.locator(".immersive-guide")).toHaveAttribute("data-phase","speaking");
  await expect(page.locator(".portrait-companion, .portrait-fallback")).toHaveCount(0);
  const first=await page.locator(".particle-planet").evaluate((el:HTMLCanvasElement)=>el.toDataURL());
  await expect.poll(()=>page.locator(".particle-planet").evaluate((el:HTMLCanvasElement)=>el.toDataURL())).not.toBe(first);
  await page.screenshot({path:"test-results/particle-universe-desktop.png"});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);await page.screenshot({path:"test-results/particle-universe-mobile.png"});
  await page.getByRole("button",{name:"Guide controls",exact:true}).click();
  await page.getByRole("button",{name:"Ambient music on",exact:true}).click();
  await expect(page.getByRole("button",{name:"Ambient music off",exact:true})).toHaveAttribute("aria-pressed","false");
  const request=page.waitForRequest(r=>r.url().endsWith("/journey/utterance")&&r.postDataJSON().gender==="male");
  await page.getByRole("button",{name:"Warm male voice",exact:true}).click();await request;
  await expect(page.locator(".immersive-guide")).toHaveAttribute("data-phase","speaking");
  await page.getByRole("button",{name:"Guide controls",exact:true}).click();
  await page.getByRole("button",{name:"Close guide",exact:true}).click();
  await expect(page.getByRole("button",{name:"Open menu"})).toBeVisible();expect(errors).toEqual([]);
});

test("unavailable speech opens a readable question and the flow remains usable",async({page})=>{
  await speechFixture(page,false);
  await page.addInitScript(()=>Object.defineProperty(window,"speechSynthesis",{value:undefined}));
  await startReading(page); await page.getByRole("button",{name:"Marriage",exact:true}).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Voice unavailable on this browser. Read along below.")).toBeVisible();
  await expect(page.locator(".guide-dialog[open] .guide-caption")).toContainText("marriage");
  await page.getByRole("button",{name:"Options",exact:true}).click();
  await page.getByRole("button",{name:"Enter app"}).click();
  await expect(page.getByRole("button",{name:"Open menu"})).toBeVisible();
});

test("reference universe fits desktop and mobile and respects reduced motion",async({page})=>{
  await startReading(page);
  for(const size of [{width:1440,height:900},{width:390,height:844},{width:320,height:568}]){
    await page.setViewportSize(size);
    await expect(page.getByRole("button",{name:"Marriage",exact:true})).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/universe-${size.width}.png`,fullPage:true});
  }
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(page.locator(".landing-zodiac-left")).toHaveCSS("animation-name","none");
});
test("complete discovery: birth wizard, real chart, name numbers, midpoint question and demo unlock",async({page})=>{
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await speechFixture(page,false);
  await page.addInitScript(()=>Object.defineProperty(window,"speechSynthesis",{value:undefined}));
  await startReading(page);
  await page.getByRole("button",{name:"Career Report",exact:true}).click();
  await page.getByRole("button",{name:"Growth where I am"}).click();
  await page.getByLabel("What is on your mind?").fill("How can I grow at work?");
  await page.getByLabel("A little context").fill("I enjoy learning.");
  await expect.poll(async()=>(await(await page.request.get("/api/journey")).json()).context).toBe("I enjoy learning.");
  await page.getByRole("button",{name:"Reveal my reading"}).click();
  await page.getByLabel("Name",{exact:true}).fill("Hitesh Chandwani");
  await page.getByLabel("Gender (optional)").selectOption("male");
  await page.getByRole("button",{name:"Continue",exact:true}).click();
  await page.getByLabel("Date of birth").fill("1996-08-14");
  await page.getByRole("button",{name:"Continue",exact:true}).click();
  await page.getByLabel("Local birth time").fill("09:42");
  await page.getByRole("button",{name:"Continue",exact:true}).click();
  await page.getByLabel("Birthplace",{exact:true}).fill("Jaipur");
  await page.getByRole("button",{name:"Find birthplace"}).click();
  await page.getByRole("button",{name:"Jaipur, India",exact:true}).click();
  await page.getByRole("button",{name:"Save birth profile"}).click();
  await expect(page.getByRole("heading",{name:"Your chart, brought to life."})).toBeVisible({timeout:60000});
  await expect(page.locator(".discovery-screen svg")).toBeVisible();
  await page.getByRole("button",{name:"Reveal my numbers",exact:false}).click();
  await expect(page.locator(".number-letters span")).toHaveCount(15);
  await expect(page.locator(".number-medallion").nth(1)).toContainText("11");
  await page.getByRole("button",{name:"Return to guide",exact:true}).click();
  await page.screenshot({path:"test-results/numerology-reveal.png"});
  await page.getByRole("button",{name:"Continue",exact:false}).click();
  await page.getByRole("button",{name:"Begin my reading",exact:false}).click();
  await page.getByRole("button",{name:"Unfold the next chapter"}).click();
  await page.getByRole("button",{name:"Make this more personal"}).click();
  await expect(page.getByRole("heading",{name:"What is the biggest obstacle to your next move?"})).toBeVisible();
  await page.getByLabel("Anything else you would like me to understand?").fill("I want to build confidence gradually.");
  await page.getByRole("button",{name:"Finding confidence"}).click();
  await expect(page.getByRole("button",{name:"Explore my complete reading"})).toBeVisible({timeout:60000});
  await page.getByRole("button",{name:"Explore my complete reading"}).click();
  await expect(page.getByRole("heading",{name:"You’ve seen the pattern. Now explore your next move."})).toBeVisible();
  await page.screenshot({path:"test-results/unlock-preview.png"});
  await page.getByRole("button",{name:"Preview the unlock flow"}).click();
  await page.getByLabel("Mobile number").fill("+91 99999 99999");
  await page.getByRole("button",{name:"Continue to demo OTP"}).click();
  await page.getByLabel("Demo verification code").fill("111111");
  await page.getByRole("button",{name:"Preview verification"}).click();
  await expect(page.getByRole("alert")).toContainText("123456");
  await page.getByLabel("Demo verification code").fill("123456");
  await page.getByRole("button",{name:"Preview verification"}).click();
  await expect(page.getByRole("button",{name:"Payments coming soon"})).toBeDisabled();
  await page.getByRole("button",{name:"Continue to the app without payment"}).click();
  await expect(page.getByRole("button",{name:"Open menu"})).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("button",{name:"Open menu"})).toBeVisible();
  expect(errors).toEqual([]);
  const profiles=await(await page.request.get("/api/profiles")).json();
  for(const p of profiles)await page.request.delete(`/api/profiles/${p.id}`);
});
