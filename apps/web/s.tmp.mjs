import { chromium } from '@playwright/test';
const SP='/tmp/claude-0/-home-user-desihub/2403c8e0-30ef-5121-9793-910b8ebbb1a1/scratchpad/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, reducedMotion:'reduce' });
const p = await ctx.newPage();
await p.route('https://fonts.g**', r=>r.abort());
await p.goto('http://localhost:3323/', {waitUntil:'networkidle'}).catch(()=>{});
await p.waitForTimeout(600);
await p.screenshot({ path: SP+'m-top.png' });          // above the fold
// Prove the search input is a real field you can type into.
await p.getByRole('searchbox').first().fill('garba');
await p.waitForTimeout(200);
await p.screenshot({ path: SP+'m-typed.png' });
console.log('value =', await p.getByRole('searchbox').first().inputValue());
console.log('h1 count =', await p.locator('h1').count());
console.log('season strip =', await p.locator('#season-heading').count());
await b.close();
