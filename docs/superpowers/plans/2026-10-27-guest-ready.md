# Guest-ready public site implementation plan

Goal: finish the guest decision path from property photos to a well-informed stay request, without changing payment or availability safeguards.

Architecture: retain the production Next.js site and STAY identity. Add a single public-facts module and reusable sleeping, FAQ, and booking-explanation sections. Tighten the homepage and add targeted responsive fixes, not another site-wide reset.

Spec: the October 27 production review and the user's instruction to make the A+ PR. Keep the property photography, make the voice confident rather than generic, publish a precise sleeping plan, explain quote/payment expectations, provide sourced proof, and verify the rendered result.

Constraints: base b5dfce3; no merge, production deployment, new secrets, payment writes, fabricated reviews, fixed nightly rates, or invented amenity promises. PR14 remains separate. The maximum is eight overnight guests, regardless of bed options. Public Airbnb is the current factual source; the owner's published July rules supply arrival/departure information. Record sources and unresolved facts.

## Tasks
- [x] Write failing tests for public facts, sleeping plan, booking steps and source-safe content.
- [x] Implement shared facts/components and concise homepage; expand Lodge and rates explanations.
- [x] Fix actual responsive, gallery and image-loading issues without disturbing private shells.
- [x] Correct the two proven stale baseline tests; run all core tests, build, touched-file lint.
- [x] Exercise desktop and mobile pages, gallery, menu, FAQ and read-only date selection; run automated accessibility checks and capture evidence.
- [ ] Publish one tested feature branch and PR. Verify preview commit and leave production unchanged.

## Review focus
- Direct requests disabled or live calendar unavailable: do not promise booking or show an active request flow.
- Shared sofa is not a fourth bedroom and bed options do not increase occupancy.
- Small screens and long captions: no horizontal overflow, hidden links or obscured controls.
- Gallery Escape/close restores focus and scrolling; filtering does not leave invalid active images.
- Rating is a dated Airbnb snapshot, not live or a fabricated testimonial; private credentials never enter public files.

Baseline: 89 tests, 87 passed, two stale source assertions fail (old hospitality-cover copy and Beta footer graphic). No service test failures. Dependencies installed in an isolated, nonpersistent sandbox. Browser tooling is temporary and not a runtime dependency.
