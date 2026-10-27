# Direct-booking owner runbook

Target release: **November 1, 2026**. This describes the implemented workflow; actual deployment and rehearsal results belong in [release verification](NOV1-RELEASE-VERIFICATION.md). The owner decision record below remains unresolved until filled with real decisions.

## From request to confirmed stay

### 1. Review the request

Open Owner → Bookings and check new requests and **Needs attention**. Check the guest’s dates, group size, pets and note. A request has not reserved the dates or charged the guest.

PJ can queue a guest acknowledgement and owner notification when its sender is ready. Check message status as well as the inbox. An absent email does not mean the request is absent, and a `sent` status means the provider accepted it, not that the recipient read or received it.

### 2. Issue the quote while the dates are free

Confirm a fresh calendar read shows the entire stay free. Enter the nightly amount, cleaning, pet, tax and any named other fee, the exact deposit amount, and complete cancellation and balance terms. Review the computed total and remaining balance before issuing.

The deposit is an amount for this quote. No standard percentage, tax rate, fee schedule or cancellation rule is adopted by this runbook. The quote has an automatic expiry capped at 48 hours and before check-in; use the expiry displayed in the owner/guest interface.

**Issue the quote before making the Airbnb block.** Issuing requires free dates. The resulting local hold does not update Airbnb and does not email the quote.

### 3. Block the whole stay, then send

Manually block every stayed night on Airbnb. The checkout date is not an additional stayed night. Wait for the fresh export to show every quoted night as `owner-blocked`, then refresh Owner → Bookings.

When the quote is ready, click **Send quote**. Delivery checks the calendar again. A partial block, reservation conflict, unreadable feed or expired quote must be resolved before proceeding.

Check the quote’s delivery status. If it is held or failed, inspect the stated reason and sender readiness. Do not repeatedly issue new quotes to solve an email problem. Any manual follow-up must use an authorized channel and the same valid private quote after the full block is verified.

### 4. Confirm from payment evidence

The guest reviews the private quote, accepts its terms and pays the deposit through Stripe. The remaining balance is **not** charged by that Checkout.

Treat a returning guest page as pending until the signed webhook and PJ decision produce `confirmed`. Verify the exact deposit, the remaining balance, reservation/Case linkage and **Needs attention**. PJ queues confirmation messages after the booking commit; an email failure does not undo a paid booking.

## Exceptions and follow-through

| Situation | Owner action | Completion evidence |
| --- | --- | --- |
| Guest reports no acknowledgement or quote | Locate the existing booking; inspect message readiness/status and provider outcome; follow up through an authorized channel. | Correct booking and message record, plus actual recipient receipt when checked. |
| Payment is processing or uncertain | Inspect the existing Stripe session/payment and PJ attention record before retrying, releasing or promising confirmation. | Matching session/payment decision and settled booking or a recorded unresolved issue. |
| Remaining balance becomes due | Collect it through the method and deadline stated in the quote; record the receipt in the owner’s accounting process. | Amount, date and payment reference reconciled to the stay. KPL does not collect it automatically. |
| Guest cancels a confirmed stay or a refund is required | Apply the agreed quote terms; perform the reservation/cancellation, Stripe and accounting actions through the authorized owner process. Keep the original payment and booking history. | Actual cancellation/refund references and reconciled calendar/accounting records. |
| A correction has already been completed | Use **Record correction** with a factual note and the relevant reference. | Note describes work already done. The button itself neither refunds a card nor cancels a reservation. |
| Unpaid guest abandons the quote | Check the quote and any Stripe session. The release action checks/expires an open unpaid session and refuses uncertain completed payment states. Release only after that succeeds. | Unpaid hold released; Airbnb’s separate manual block reconciled and removed only when no other stay requires it. |

Never use the unpaid-hold release action for a confirmed stay. Do not delete records to make reconciliation appear clear. If the calendar or payment state is uncertain, keep the issue visible while resolving the source of uncertainty.

## Owner coverage and decision record

Fill this record before accepting live deposits. It records decisions and responsibility; it does not ask the software to invent them.

| Item | Decision / evidence |
| --- | --- |
| Target release | November 1, 2026 |
| Release operator and backup | Unresolved — name each person. |
| New-request and inbox coverage | Unresolved — assign who checks requests, held mail and replies, and when. |
| Payment/reconciliation coverage | Unresolved — assign who watches webhook/payment issues and escalates them. |
| Per-quote deposit rules | Unresolved — record the owner-approved rule or approval method for each quote. |
| Fees and tax treatment | Unresolved — record the approved calculation, remittance responsibility and review source. |
| Balance collection | Unresolved — record method, due-date rule, receipt process and responsible person. |
| Cancellation/refund wording | Unresolved — retain the approved text used in each quote and who handles paid cancellations. |
| Live email identity and recipients | Unresolved — verify sender authorization, provider permission and owner recipients privately. |
| Real rehearsal | Unresolved — record date, exact deployed KPL/PJ revisions and the private evidence location. |
| Release decision | Unresolved — record the operator, time, remaining limitations and decision in release verification. |

Keep owner codes, provider credentials, private calendar URLs, quote tokens and guest contact details out of repository evidence. Store operational evidence in the authorized private record.
