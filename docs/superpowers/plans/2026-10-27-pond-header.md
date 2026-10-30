# Rural pond header implementation plan

Goal: implement the owner's approved October 27 screenshot direction, not another audit or generated mockup.
Spec: split dark-green editorial panel at left, real Lodge deck photo at right with hot-tub and shoreline views below; quieter rural pond-house tone. Preserve the logo/navigation, STAY below the calendar, booking behavior and all homepage content below the hero.
Architecture: replace RetreatHero's background slideshow with a server-rendered photo collage, reusing the three existing scene props and approved image manifest. Scope styles to its CSS module. No new dependencies, production settings, routes or business rules.
Base: d68eb6580d44db3c09deb21c2f1dd3c88e8e295f. Owner has requested implementation and publication of this header change in the current website workflow.

- [x] Update hero tests first for split layout, still imagery and unchanged routing/content; observe failures.
- [x] Implement the isolated component and responsive CSS. Retain existing alt text and dark green/cream brand colors.
- [x] Replace the old slideshow-only browser assertions with real collage, link, image, keyboard and contrast checks.
- [x] Run full core suite, build/TypeScript, touched-file lint and mobile/desktop browser verification.
- [ ] Publish the reviewed header-only diff through GitHub; verify the production homepage and unchanged STAY placement.

Review focus: no overflow at 320px; text and pictures do not overlap; main photo is preloaded while supporting photos are lazy; links work without client JavaScript; only one H1/main; no private or invented imagery; no changes below the header. Rollback is a selective revert of this isolated commit, never a database restore.

Verification: 101/101 core tests passed; production build/TypeScript and changed-component lint passed. Browser checks at 320, 390, 768, 1024, 1440 and 1920 pixels passed with no overflow, unloaded header images, uncaught browser errors or detected selected WCAG A/AA violations. Keyboard routing and no-JavaScript rendering passed. The existing below-hero source hash remains unchanged. Production release still requires the final merge and live check.
