# Direct-booking rehearsal quick sheet

Use this beside [the full human booking proof](HUMAN-BOOKING-PROOF.md). Record results in [release verification](NOV1-RELEASE-VERIFICATION.md).

**Target:** `<CURRENT_REVIEWED_PREVIEW_ORIGIN>/book`, filled from the actual deployment for this run. Verify the exact KPL/PJ revisions. An older test alias or the production Lodge URL is not the rehearsal target.

## Ready to start

Use an isolated test property/key/calendar, authorized owner access, controlled guest and owner inboxes, Stripe test credentials and a matching test webhook. Confirm the property exists for reservation/Case creation and the deployed backend supports `request_key`.

Owner messaging readiness must show enabled messaging, an authorized sender, a connected provider, owner recipients and the correct public base. PJ uses `KPL_BOOKING_PUBLIC_BASE_URL` and `KPL_BOOKING_OWNER_EMAILS`; a configured workspace email identity also needs provider permission.

## Run

1. Signed out, submit future free dates. Check pending feedback and the received state; no card or reservation yet.
2. Retry the unchanged initial request with the same request key in the controlled retry scenario. Verify one request, one creation event and one logical acknowledgement/owner-notification pair.
3. Check actual receipt in both controlled inboxes, separately from provider acceptance.
4. As owner, enter the exact itemized amounts, deposit, cancellation terms and balance terms; **issue while dates remain free**.
5. Manually block every stayed night in the test calendar. Refresh until the full stay is `owner-blocked`.
6. Click **Send quote**. Check its result and the one received quote email. Issuing alone does not send it.
7. Open the private quote as guest. Match dates, fees, total, deposit, balance, terms and expiry.
8. Accept terms and complete hosted Stripe **test** Checkout for the deposit.
9. Return to KPL. Require the verified payment result; a redirect alone is not confirmation.
10. Check confirmed state in KPL/PJ, exact amounts, one reservation/Case and no unresolved payment or reservation-sync issue.
11. Verify guest and owner confirmations in the controlled inboxes.
12. Refresh the return page and replay the same signed test webhook. Confirm unchanged payment truth and no duplicate booking, reservation, Case or logical confirmation message.
13. Run the separate recovery cases in the full proof: calendar failure, session retry, transient confirmation failure, signature/mode rejection, held email, unpaid release and completed correction.

The remaining balance is not collected by this Checkout. A paid cancellation/refund needs the owner’s actual reservation, Stripe and accounting actions; **Record correction** only records work already done.

## Keep

Record the run time/operator, exact deployments, request ID, test payment/event references, scoped record/message counts and redacted final-state evidence. Mark each result **PASS**, **FAIL** or **BLOCKED**. Keep private quote tokens, calendar URLs, codes, credentials and guest contact details out of the repository.
