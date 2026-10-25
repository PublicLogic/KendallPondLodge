import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
test('public booking never requires owner or PJ sign-in', () => { const s = read('app/book/actions.ts'); assert.doesNotMatch(s, /cookies\(|verifyOwner|requireAuthenticated|ownerPortalUrl/); const proxy = read('proxy.ts'); const matchers = proxy.slice(proxy.indexOf('matcher:')); assert.doesNotMatch(matchers, /"\/book(?:\/|"|:)/); });
test('owner keeps all exact quote fields and fixed expiry; no percentage deposit', () => { const page = read('app/owner/bookings/page.tsx'), action = read('app/owner/bookings/actions.ts'); for (const name of ['nightly', 'cleaning', 'pet', 'tax', 'other', 'other_label', 'deposit', 'cancellation_terms', 'balance_terms', 'availability_checked'])
    assert.ok(page.includes(`name="${name}"`), name); assert.match(action, /48 \* 3600000/); assert.match(action, /65 \* 60000/); assert.match(action, /cancellation.length < 20/); assert.match(action, /balance.length < 20/); assert.doesNotMatch(action, /deposit_percent|depositPercentage/); });
test('private quote only offers safe payment branches and no redirect-only success', () => { const p = read('app/book/quote/[token]/page.tsx'); assert.match(p, /publicBookingState/); assert.match(p, /state === 'quote' \|\| resume/); assert.match(p, /state === 'refund_review'/); assert.match(p, /publicError\(payment\)/); assert.match(read('next.config.ts'), /no-referrer/); });
test('owner status is read-only, not invented saved prices or approvals', () => { const p = read('app/owner/settings/page.tsx'); assert.doesNotMatch(p, /localStorage|<form|<input|propose|saveSettings/); assert.match(p, /Manual delivery/); assert.match(p, /48 hours/); assert.match(p, /requireKplOwner/); });
test('no cleaner module in owner dashboard and exact logos included', () => { assert.doesNotMatch(read('app/owner/page.tsx'), /cleaner|cleaning|turnover/i); for (const n of ['puddlejumper-stay.png', 'puddlejumper-beta.png'])
    assert.ok(existsSync(new URL('../public/brand/stay/' + n, import.meta.url))); });
test('no Supabase fallback or REST URL survives in active adapter', () => { const s = read('lib/booking-db.ts') + read('lib/pj-booking-client.mjs'); assert.doesNotMatch(s, /process\.env\.KPL_SUPABASE|new URL\(`\/rest\/v1|apikey:/); });
function lum(hex) { return hex.match(/../g).map(x => parseInt(x, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((s, c, i) => s + c * [.2126, .7152, .0722][i], 0); }
test('booking alert and focus/brand foreground colors pass 4.5:1 contrast', () => { for (const [fg, bg] of [['654312', 'fff3dc'], ['205f43', 'ffffff'], ['112233', 'ffffff']]) {
    const l = [lum(fg), lum(bg)].sort((a, b) => b - a);
    const ratio = (l[0] + .05) / (l[1] + .05);
    assert.ok(ratio >= 4.5, `${fg}/${bg}: ${ratio.toFixed(2)}`);
} });
