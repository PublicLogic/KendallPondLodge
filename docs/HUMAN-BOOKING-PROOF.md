# Human booking proof

This is the acceptance run for the actual KPL guest and owner interfaces, PJ records and messaging, and Stripe hosted **test-mode** Checkout. Unit tests and an offline payment fixture support it; they do not replace it.

Use the exact **current Preview URL** recorded for the run. Do not use the production Lodge URL or assume that an old test alias points to the reviewed release. Record actual outcomes in [release verification](NOV1-RELEASE-VERIFICATION.md).

## Before the run

The operator must establish:

- The Preview deployment’s exact KPL commit and the deployed PJ commit, including request-key deduplication support.
- An isolated test workspace/property and scoped key, with the property provisioned for reservation/Case creation.
- A controlled test calendar whose dates can be made free, fully owner-blocked, conflicting and unreadable without changing real guest inventory.
- Stripe test credentials and a matching test webhook endpoint at the Preview origin. Confirm the actual key/account and Checkout are in test mode; a separate mode label is not proof.
- Authorized owner access, a controlled guest inbox and authorized owner notification recipients. Use no unrelated person’s email.
- PJ messaging readiness: `PJ_STAY_MESSAGING=enabled`, `KPL_BOOKING_PUBLIC_BASE_URL` set to the exact Preview origin, and `KPL_BOOKING_OWNER_EMAILS` set to authorized test recipients. An authorized workspace sender and connected provider are required.
- If `PJ_STAY_EMAIL_IDENTITIES` is configured, its test workspace identity must be allowed by the connected provider. Verify the intended From and Reply-To in the received mail.

The KPL `KPL_BOOKING_ORIGIN`, PJ public base and Stripe return/webhook environment must agree. Do not publish credentials, private calendar URLs or the configured inboxes as evidence.

## 1. Request and initial retry

Open the Preview `/book` page in a signed-out browser. Select future free dates and submit a controlled test guest, two guests and no pets.

Check that the form gives pending feedback and prevents another normal submit while pending. The received state must say that the request is not a reservation and no payment has been taken. Verify one request in Owner → Bookings and the intended PJ scope.

Exercise an ambiguous initial-submit retry with the same unchanged form and original `request_key`, using the approved test harness or controlled response-loss scenario. Verify:

- One canonical request and one creation audit entry.
- One logical guest acknowledgement and one owner notification message record; retry does not enqueue another of either kind.
- The controlled guest and owner inboxes receive the expected request messages. Record provider acceptance and inbox receipt separately.

Backend contract checks must also verify that a changed payload with the same key is rejected, and another workspace/property cannot retrieve this request. A later browser retry may be stopped by fresh calendar/overlap checks after an owner hold or confirmation; it must not create a second request. Do not infer a guarantee from a disabled button or from an older backend that ignores the key.

## 2. Quote, block, explicit send

While every requested night remains **free**, enter the exact nightly amount, cleaning, pet, tax, named other fee, deposit, cancellation terms and balance terms in Owner → Bookings. Review and **issue the quote**.

Check that its dates, total, deposit, remaining balance and expiry match the inputs. Issuing the quote must not be treated as an automatic quote email or an Airbnb block.

Manually block every stayed night in the test calendar. Refresh until the fresh read reports the entire stay as `owner-blocked`. A partial block is insufficient. Click **Send quote** and verify:

- The owner sees the actual sent/held/failed result.
- Provider acceptance is reported accurately.
- The controlled guest receives one quote email containing the private KPL quote link.
- The intended sender identity and reply address are correct.

Do not copy the bearer link into screenshots or repository evidence. Redact it in the private evidence package too when a full URL is unnecessary.

## 3. Accept and pay the deposit

Open the received link as the guest. Compare every price line with the owner quote, including deposit now and remaining balance later. Read the cancellation and balance terms. The page must not claim that the stay is already confirmed.

Accept the terms and enter Stripe hosted **test-mode** Checkout. Verify the displayed deposit and currency before completing Stripe’s documented successful test-card flow. Never use a live card for this run.

On return, require the authoritative payment result. If confirmation is still pending, the page must keep showing that state rather than treating the redirect as proof. Verify the signed test webhook reaches KPL and the matching payment decision reaches PJ.

## 4. Confirm and replay

Check all of the following:

- KPL and PJ show the same confirmed booking, exact deposit and remaining balance.
- There is one direct reservation and the expected linked Case; no reservation-sync or payment problem remains unresolved.
- Guest and owner confirmation messages have the expected provider outcomes and are received in the controlled inboxes.
- Refreshing the quote/return page and replaying the same signed Stripe test event creates no additional booking, payment record, reservation, Case or logical confirmation message.
- The existing payment reference and paid timestamp remain consistent after replay.

Keep the distinction between a logical message record, provider acceptance and inbox receipt. Report any discrepancy instead of marking the run passed.

## 5. Recovery checks

Use separate controlled fixtures for these cases; do not disrupt the successful paid fixture or real inventory:

| Case | Required outcome |
| --- | --- |
| Unreadable calendar, occupied dates or partial owner block | No unsupported availability, send or payment approval. |
| Repeated Checkout attempt | Existing compatible session reused; no second session with changed payment parameters. |
| Transient PJ/network failure during webhook handling | Retryable failure remains visible, and a later valid delivery settles once. |
| Invalid signature or test/live mismatch | No booking confirmation. |
| Recorded payment rejection or refund requirement | Durable owner attention item; no false confirmation. |
| Held/failed email after payment | Paid booking remains true; message issue remains visible. |
| Abandoned unpaid quote | Session checked/expired before release; calendar reconciled separately. A confirmed stay cannot use unpaid release. |
| Completed correction record | Records the action already performed; it does not initiate a refund or cancellation. |

## Evidence record

Keep the detailed record in the authorized private location. The repository summary can contain revisions, test outcomes and limitations without guest data or bearer links.

```text
Run date and operator:
Current KPL Preview URL and deployed commit:
Deployed PJ revision:
Verified isolated test workspace/property:
Controlled calendar and inbox evidence location:
Request ID and creation/message counts after retry:
Quote inputs/terms review and full-block evidence:
Quote provider acceptance and inbox receipt:
Stripe test Checkout Session/event references:
Confirmed booking, reservation and Case references:
Confirmation provider acceptance and inbox receipt:
Webhook replay outcome and record counts:
Recovery-case outcomes:
Result: PASS / FAIL / BLOCKED
Unresolved items and responsible person:
```

Do not include secrets, owner codes, private calendar URLs, full guest contact details or quote/stay access tokens. A blocked dependency remains **BLOCKED**; neither a source implementation nor a passing local fixture resolves it.
