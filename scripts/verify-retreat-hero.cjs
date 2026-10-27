/* Run with the optional QA dependencies documented in GUEST-READY-VERIFICATION.md. */
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict');
const fs=require('fs');
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.QA_OUTPUT || '/tmp/kpl-retreat-hero';
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const results=[];fs.mkdirSync(output,{recursive:true});
for(const [width,height] of [[320,740],[390,844],[768,1024],[1440,900]]){
 const c=await b.newContext({viewport:{width,height},reducedMotion:'reduce'});await c.route('**/*', route => ['GET','HEAD'].includes(route.request().method()) ? route.continue() : route.abort());const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 for(const name of ['By the water','In the hot tub','On the deck']){
  const btn=p.getByRole('button',{name,exact:true});await btn.focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>{const i=document.querySelector('#retreat-view img');return i?.complete&&i.naturalWidth>0});
  assert.equal(await btn.getAttribute('aria-pressed'),'true');const dimensions=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,heroHeight:document.querySelector('[data-retreat-hero]').getBoundingClientRect().height,h1:getComputedStyle(document.querySelector('h1')).fontSize,buttonHeights:[...document.querySelectorAll('[data-retreat-hero] button')].map(e=>e.getBoundingClientRect().height)}));
  const a=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.push({width,scene:name,...dimensions,errors,violations:a.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});
 }
 await p.getByRole('button',{name:'By the water',exact:true}).click();await p.waitForFunction(()=>{const i=document.querySelector('#retreat-view img');return i?.complete&&i.naturalWidth>0});await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`${output}/hero-${width}.png`});
 await c.close();
}
await b.close();fs.writeFileSync(output + '/audit.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));assert.equal(results.filter(r=>r.overflow||r.errors.length||r.violations.length||r.buttonHeights.some(h=>h<44)).length,0);})().catch(e=>{console.error(e.message);process.exit(1)});
