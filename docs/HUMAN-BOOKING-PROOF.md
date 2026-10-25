# KPL human booking proof

This is the release acceptance test for the direct-booking experience. It proves a person can complete the actual KPL workflow and that PuddleJumper records and emails the same state.

Run this against **Preview/test only** until the entire checklist passes.

## Pass criteria

A run passes only when all of these are true:

1. A guest can submit dates from the real KPL `/book` page without signing in.
2. The owner can sign in to the real KPL Owner workspace and see the same request.
3. PuddleJumper sends the guest a **request received** email.
4. The owner can issue an itemized quote from KPL.
5. After the owner blocks the full stay on Airbnb and the block is visible to PJ, PuddleJumper sends the guest a **quote ready** email containing the private KPL quote link.
6. The guest can open that emailed link, see the exact quote and terms, accept them, and enter Stripe test checkout.
7. A successful Stripe test payment is verified through the KPL webhook and PJ changes the booking to `confirmed`.
8. PuddleJumper sends the guest a **booking confirmed** email.
9. The owner sees the confirmed booking in KPL with no unresolved payment-reconciliation item.
10. PJ has one confirmed direct reservation linked to the same booking/Case. No duplicate booking, payment, email, reservation, or Case is created by refresh/retry.

## Required test configuration

KPL Preview:

- `KPL_DIRECT_BOOKING_ENABLED=true`
- Preview `KPL_STORE_URL` and `KPL_STORE_KEY`
- Preview Airbnb calendar source registered with PJ
- Stripe **test** key and matching Preview webhook secret
- `KPL_BOOKING_CONTACT_EMAIL=info@publiclogic.org`
- `KPL_BOOKING_ORIGIN` set to the exact Preview origin used for the run

PuddleJumper Preview/test:

- the KPL Preview booking key is bound to the Preview workspace/property
- `PJ_STAY_MESSAGING=enabled`
- `PJ_STAY_EMAIL_IDENTITIES` includes the Preview workspace with:
  - name: `The Lodge at Kendall Pond`
  - address: `info@publiclogic.org`
  - replyTo: `info@publiclogic.org`
- an authorized email sender is connected for that same workspace and the provider allows it to send as `info@publiclogic.org`
- `KPL_QUOTE_LINK_BASES` maps that Preview workspace/property to the exact KPL Preview `/book/quote` base

Do not use live Stripe credentials for this proof.

## Human run

Use a real inbox you can read as the guest. Do not use the Lodge sender address as the guest address.

### 1. Guest requests dates

Open the KPL Preview `/book` page in a normal browser.

Submit:
- future free check-in/check-out dates
- 2 guests
- 0 pets
- your test guest name
- your real test inbox

Expected:
- KPL shows **request received**
- no card is requested and no charge is made
- Owner → Bookings shows one new request
- the guest receives **We got your dates — The Lodge at Kendall Pond**
- From is **The Lodge at Kendall Pond <info@publiclogic.org>**
- Reply-To is **info@publiclogic.org**

Record:
- booking request ID
- guest email timestamp/message ID
- screenshot of the received state
- screenshot of the owner request

### 2. Owner issues the quote

In Owner → Bookings, enter the exact nightly price, cleaning, pet/tax/other fees, exact deposit, cancellation terms, and balance terms.

Issue the quote.

Then block every quoted night in Airbnb. Wait until the export/PJ check shows the complete owner block.

Expected:
- booking status is `quoted`
- guest receives **Your stay at The Lodge at Kendall Pond is ready**
- email contains the private KPL `/book/quote/<token>` link
- the token is not displayed in the owner UI as an email-delivery secret and is not stored in the PJ message body

Record:
- quote timestamp
- email message ID
- screenshot of the quote in Owner
- screenshot of the received quote email

### 3. Guest accepts and pays

Open the quote link from the email.

Expected before payment:
- dates match the original request
- every price line matches Owner
- deposit amount is exact
- cancellation and balance terms are visible
- page does not say the stay is booked yet

Accept the terms and continue to Stripe test checkout.

Complete the test payment using Stripe's standard successful test-card flow.

Expected:
- KPL returns to a checking/payment-processing state, not a redirect-only “booked” claim
- the signed Stripe webhook reaches KPL
- PJ verifies the payment amount/session and moves the booking to `confirmed`

Record:
- Stripe Checkout Session ID
- Stripe test Payment/Checkout event ID
- screenshot of the quote before payment
- screenshot of the post-payment KPL state

### 4. Confirmation

Expected:
- Owner → Bookings shows the stay confirmed/paid
- no refund/payment-rejected reconciliation is open
- PJ has one direct StayOS reservation for the same dates
- PJ booking and reservation point to the same governed Case lineage
- guest receives **You’re booked — The Lodge at Kendall Pond**
- confirmation From/Reply-To remain the Lodge identity

Record:
- confirmation email message ID
- PJ reservation ID
- Case ID
- screenshot of Owner confirmed state
- screenshot of confirmation email

### 5. Retry/idempotency check

Refresh the quote/payment-return page and redeliver the same Stripe test webhook once.

Expected:
- still one booking
- still one payment record
- still one direct reservation
- no second Case
- no duplicate confirmation email
- no new reconciliation problem

## Optional stay-access proof

Advance the confirmed stay through the PJ/KPL host flow to `PRE_ARRIVAL`.

Expected:
- guest receives the private stay link by email
- the bearer token is rendered only for provider delivery and is not stored in the PJ message body or returned to the host
- revoke/reissue behavior remains owner-controlled

## Evidence record

Save one small proof record for the run:

```text
Run date:
KPL Preview URL:
PJ revision:
KPL revision:
Guest test inbox:
Booking request ID:
Quote email message ID:
Stripe Checkout Session:
Stripe event:
PJ reservation ID:
Case ID:
Confirmation email message ID:
Result: PASS / FAIL
Notes:
```

Do not put booking keys, Stripe secrets, owner codes, Airbnb calendar URLs, or guest-access bearer tokens in the evidence record.
