#!/usr/bin/env bash
set -euo pipefail

REPO="PublicLogic/KendallPondLodge"

WORKTREE="$(
  find /private/tmp /tmp -maxdepth 1 -type d -name 'kpl-booking-*' 2>/dev/null |
  while read -r d; do
    if git -C "$d" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      b="$(git -C "$d" branch --show-current 2>/dev/null || true)"
      case "$b" in
        feat/kpl-booking-completion-*)
          printf '%s\n' "$d"
          ;;
      esac
    fi
  done |
  sort |
  tail -n 1
)"

if [ -z "$WORKTREE" ]; then
  echo "ERROR: no unfinished KPL booking worktree found."
  exit 1
fi

cd "$WORKTREE"
BRANCH="$(git branch --show-current)"

echo "=== RESUME KPL BOOKING PASS ==="
echo "worktree: $WORKTREE"
echo "branch:   $BRANCH"

python3 <<'PY'
from pathlib import Path

p = Path("tests/a-plus-experience.test.mjs")
s = p.read_text()

old_name = 'test("owner bookings expose the governed four-step workflow"'
if old_name in s:
    start = s.index(old_name)
    end = s.index('test("calendar closes all four polish review findings"')

    replacement = r'''test("owner bookings expose the governed six-step workflow", () => {
  const page = read("app/owner/bookings/page.tsx");
  const actions = read("app/owner/bookings/QuoteLinkActions.tsx");

  for (const step of [
    '"New"',
    '"Quote"',
    '"Airbnb"',
    '"Send"',
    '"Paying"',
    '"Confirmed"',
  ]) {
    assert.match(page, new RegExp(step));
  }

  assert.match(page, /Waiting for Airbnb block/);
  assert.match(page, /QuoteLinkActions/);
  assert.match(page, /bookingMessageStatus/);

  assert.match(actions, /Send quote/);
  assert.match(actions, /Copy link/);
  assert.match(actions, /accepted by email provider/);
  assert.doesNotMatch(actions, /mailto:/);
});

'''
    p.write_text(s[:start] + replacement + s[end:])
    print("✓ updated stale four-step A+ regression test")
else:
    print("✓ A+ workflow test already updated")
PY

git add tests/a-plus-experience.test.mjs

python3 <<'PY'
from pathlib import Path
import hashlib, subprocess

root = Path.cwd()
raw = subprocess.check_output(["git", "ls-files", "-z"])
names = sorted(
    x.decode()
    for x in raw.split(b"\0")
    if x and x.decode() != "SHA256SUMS.txt"
)
lines = []
for name in names:
    p = root / name
    if p.is_file():
        lines.append(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {name}")
(root / "SHA256SUMS.txt").write_text("\n".join(lines) + "\n")
print(f"✓ SHA256SUMS refreshed for {len(lines)} files")
PY

git add SHA256SUMS.txt

echo
echo "=== KPL TEST ==="
npm run test:core

echo
echo "=== KPL BUILD ==="
npm run build

echo
echo "=== KPL PACKAGE VERIFICATION ==="
node scripts/verify-package.mjs

echo
echo "=== KPL COMMIT + PUSH ==="
git add \
  lib/pj-booking-client.mjs \
  lib/booking-db.ts \
  app/owner/bookings/actions.ts \
  app/owner/bookings/QuoteLinkActions.tsx \
  app/owner/bookings/page.tsx \
  'app/book/quote/[token]/page.tsx' \
  app/a-plus.css \
  tests/booking-messaging-ui.test.mjs \
  tests/a-plus-experience.test.mjs \
  docs/BOOKING-E2E.md \
  SHA256SUMS.txt

git status --short
git diff --cached --stat

if ! git diff --cached --quiet; then
  git commit -m "Complete governed direct booking lifecycle"
fi

git push -u origin "$BRANCH"

PR="$(
  gh pr list \
    --repo "$REPO" \
    --head "$BRANCH" \
    --state open \
    --json url \
    --jq '.[0].url // empty'
)"

if [ -z "$PR" ]; then
  PR="$(
    gh pr create \
      --repo "$REPO" \
      --base main \
      --head "$BRANCH" \
      --title "Booking: messaging, confirmation and owner loop" \
      --body "Completes the KPL side of direct-booking goals 1–4.

- owner Send Quote goes through PJ
- KPL and PJ both verify the Airbnb owner block
- owner console reads durable PJ provider state
- six-stage owner workflow: New → Quote → Airbnb → Send → Paying → Confirmed
- manual Copy link remains a safe fallback
- confirmed guest gets deposit, balance and Guest Guide next steps
- includes the Stripe test-mode E2E rehearsal
- authoritative quote/payment math remains in PJ"
  )"
fi

echo
echo "KPL PR: $PR"
echo "PJ PR to use: https://github.com/PublicLogic/PuddleJumper/pull/6"
echo
echo "Next order:"
echo "1. Merge/deploy PJ PR #6"
echo "2. Configure PJ messaging runtime"
echo "3. Merge/deploy this KPL PR"
echo "4. Run docs/BOOKING-E2E.md in Stripe test mode"
