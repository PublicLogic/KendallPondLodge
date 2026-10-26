# KPL direct booking — real release rehearsal

Run this after the PJ PR is merged/deployed and the KPL PR is deployed.

## Preconditions

PJ Owner Bookings readiness must show:

- messaging enabled
- authorized email sender
- connected Google or Microsoft provider
- public booking base configured

Stripe must be in test mode for the rehearsal.

## Rehearsal

1. Open `https://kendallpondlodge.com/book`.
2. Submit a future actually-free test stay using an inbox you can read.
3. Verify the request appears in Owner Bookings.
4. Verify the guest acknowledgement arrives once.
5. Verify the owner request notification arrives once.
6. Enter the exact itemized owner quote.
7. Block every stayed night on Airbnb.
8. Wait for Airbnb export state to become `owner-blocked`.
9. Refresh Owner Bookings.
10. Click **Send quote**.
11. Verify PJ shows provider accepted.
12. Verify the guest gets exactly one quote email.
13. Open the private quote.
14. Review the exact itemized price and terms.
15. Accept the terms.
16. Enter Stripe test Checkout.
17. Complete Checkout using Stripe's published test card.
18. Return to the quote page.
19. Verify the booking reaches **Confirmed**.
20. Verify deposit and remaining balance equal the PJ record.
21. Verify Owner Bookings shows Confirmed.
22. Verify one guest confirmation email.
23. Verify one owner confirmation email.
24. Verify a Stripe webhook retry does not create a duplicate confirmation.
25. Verify the Guidebook link opens the protected guest Guidebook.
26. Verify PJ attention/reconciliation has no unresolved payment problem.

## Evidence to keep

Record:

- booking request id
- PJ audit event ids
- Stripe test Checkout Session id
- Stripe test PaymentIntent id
- provider-accepted message ids
- confirmation timestamp
- screenshots of the guest and owner final states

Do not put the private quote bearer token into the evidence package.
