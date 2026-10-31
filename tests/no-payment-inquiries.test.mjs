import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("payment-free inquiries create an owner-visible request without checkout",()=>{
  const action=read("app/book/actions.ts");
  const create=action.indexOf("await client.createRequest(input)");
  const inquiry=action.indexOf("form.get('intent') === 'inquiry'");
  const price=action.indexOf("await client.autoPrice(created.id)");
  assert.ok(create>=0 && inquiry>create && price>inquiry);
  assert.match(action,/return \{ received: true as const, inquiry: true as const \}/);
});

test("guests can choose booking or no-payment inquiry with clear consent",()=>{
  const form=read("app/book/StayRequestForm.tsx");
  assert.match(form,/See price & book/);
  assert.match(form,/name="intent" value="inquiry"/);
  assert.match(form,/No payment was taken and your dates are not reserved/);
  assert.match(form,/confirmed only after checkout and verified payment/);
});

test("site provides a question path that does not require dates",()=>{
  const page=read("app/book/page.tsx");
  assert.match(page,/Ask us a question without choosing dates/);
  assert.match(page,/hostContactHref\(\)/);
});
