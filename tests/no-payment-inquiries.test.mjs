import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("date inquiries enter PJ CaseSpace instead of initiating checkout",()=>{
  const action=read("app/book/actions.ts");
  const create=action.indexOf("await client.createRequest(input)");
  const inquiry=action.indexOf("form.get('intent') === 'inquiry'");
  const price=action.indexOf("await client.autoPrice(created.id)");
  assert.ok(inquiry>=0 && inquiry<create && price>create);
  assert.match(action,/await submitGuestQuestion\\(question\\)/);
  assert.match(action,/return \\{ received: true as const, inquiry: true as const \\}/);
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
  assert.match(page,/href="\/ask"/);
});

test("the public question form is a server-side PJ inquiry, not a hidden checkout", () => {
  const page = read("app/ask/page.tsx");
  const client = read("app/ask/GuestQuestionForm.tsx");
  const server = read("app/ask/actions.ts");
  assert.match(page, /GuestQuestionForm/);
  assert.match(client, /submitGuestQuestion/);
  assert.match(client, /Send your question/);
  assert.match(server, /\/api\/stayos\/inquiries/);
  assert.match(server, /"X-PuddleJumper-Request": "true"/);
  assert.match(server, /client_request_id/);
  assert.doesNotMatch(server, /stripe|charge|paymentIntent|checkoutSession/i);
});
