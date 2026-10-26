#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"

PJ_REPO="PublicLogic/PuddleJumper"
KPL_REPO="PublicLogic/KendallPondLodge"

PJ_BRANCH="feat/kpl-booking-messaging-${STAMP}"
KPL_BRANCH="feat/kpl-booking-completion-${STAMP}"

KPL_SOURCE="$HOME/Desktop/KendallPondLodge"
PJ_WORKTREE="/tmp/pj-kpl-booking-${STAMP}"
KPL_WORKTREE="/tmp/kpl-booking-${STAMP}"

PJ_TEMP_CLONE=0
PJ_SOURCE=""

say(){ printf '\n=== %s ===\n' "$1"; }
die(){ echo "ERROR: $*" >&2; exit 1; }
need(){ command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

refresh_checksums() {
  python3 <<'PY'
from pathlib import Path
import hashlib
import subprocess

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
}

need git
need gh
need python3
gh auth status >/dev/null 2>&1 || die "GitHub CLI is not authenticated."
test -d "$KPL_SOURCE/.git" || die "KPL repo not found at $KPL_SOURCE"

say "LOCATE PUDDLEJUMPER"

for candidate in \
  "$HOME/puddlejumper" \
  "$HOME/PuddleJumper" \
  "$HOME/Desktop/PuddleJumper" \
  "$HOME/Desktop/puddlejumper"
do
  if [ -d "$candidate/.git" ]; then
    remote="$(git -C "$candidate" remote get-url origin 2>/dev/null || true)"
    case "$remote" in
      *PublicLogic/PuddleJumper.git|*PublicLogic/PuddleJumper)
        PJ_SOURCE="$candidate"
        break
        ;;
    esac
  fi
done

if [ -z "$PJ_SOURCE" ]; then
  PJ_SOURCE="$(mktemp -d /tmp/PuddleJumper-source.XXXXXX)"
  rm -rf "$PJ_SOURCE"
  gh repo clone "$PJ_REPO" "$PJ_SOURCE"
  PJ_TEMP_CLONE=1
fi

echo "PJ source:  $PJ_SOURCE"
echo "KPL source: $KPL_SOURCE"

say "NODE 24"

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
  nvm install 24 >/dev/null
  nvm use 24 >/dev/null
fi

need node
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -eq 24 ] || die "Node 24 required; current version is $(node -v)"
echo "✓ $(node -v)"

say "PJ CLEAN BRANCH"

git -C "$PJ_SOURCE" fetch origin main
git -C "$PJ_SOURCE" worktree add -b "$PJ_BRANCH" "$PJ_WORKTREE" origin/main
cd "$PJ_WORKTREE"

need corepack
corepack enable
corepack prepare pnpm@9.15.9 --activate
need pnpm

echo "PJ baseline: $(git rev-parse HEAD)"
echo "pnpm: $(pnpm -v)"

say "PJ PRIVATE QUOTE-LINK SAFETY"

python3 <<'PY'
from pathlib import Path

p = Path("apps/puddlejumper/src/stayos/messaging.ts")
s = p.read_text()

old = """export const STAY_LINK_PLACEHOLDER = '{{stay_link}}';
export const STALE_CLAIM_MINUTES = 10;"""

new = """export const STAY_LINK_PLACEHOLDER = '{{stay_link}}';

/**
 * Private KPL quote links are bearer links just like stay-access links.
 * The raw URL exists only in memory for the provider call and is never
 * persisted in stayos_messages.
 */
export const BOOKING_QUOTE_LINK_PLACEHOLDER = '{{booking_quote_link}}';

export const STALE_CLAIM_MINUTES = 10;"""

if old not in s:
    raise SystemExit("messaging.ts placeholder anchor changed; stop instead of guessing")
s = s.replace(old, new, 1)

old = """  if (outgoingBody.includes(STAY_LINK_PLACEHOLDER)) {
    // A stay link can only be sent by the caller that holds it. A generic
    // retry of such a message would send an empty placeholder.
    setFailed(db, messageId, 'stay_link_unavailable', true);
    return current();
  }
  const channel = message.channel as StayMessageChannel;"""

new = """  if (outgoingBody.includes(STAY_LINK_PLACEHOLDER)) {
    // A stay link can only be sent by the caller that holds it. A generic
    // retry of such a message would send an empty placeholder.
    setFailed(db, messageId, 'stay_link_unavailable', true);
    return current();
  }

  if (outgoingBody.includes(BOOKING_QUOTE_LINK_PLACEHOLDER)) {
    // A private quote bearer link must also be rendered by the caller that
    // owns it. Generic retries may never send the unresolved placeholder.
    setFailed(db, messageId, 'booking_quote_link_unavailable', true);
    return current();
  }

  const channel = message.channel as StayMessageChannel;"""

if old not in s:
    raise SystemExit("messaging.ts delivery anchor changed; stop instead of guessing")
p.write_text(s.replace(old, new, 1))
PY

say "PJ BOOKING MESSAGING SERVICE"

cat > apps/puddlejumper/src/stayos/booking/bookingMessaging.ts <<'EOF'
import type Database from 'better-sqlite3';

import { hasProviderFor } from '../../api/routes/outboundCommunications.js';
import {
  BOOKING_QUOTE_LINK_PLACEHOLDER,
  createStayMessage,
  deliverStayMessage,
  getAuthorizedSender,
  type StayMessageRow,
  type StayMessagingResolver,
} from '../messaging.js';
import { stayMessagingEnabled } from '../messagingGate.js';
import type { StayOSBookingScope } from './config.js';
import type { Booking } from './bookingService.js';

export type BookingMessageKind =
  | 'request_guest'
  | 'request_owner'
  | 'quote_guest'
  | 'confirmed_guest'
  | 'confirmed_owner';

export type BookingMessageState = {
  kind: BookingMessageKind;
  status: string;
  hold_reason: string | null;
  sent_at: string | null;
  verification: string;
  provider_accepted: boolean;
};

export type BookingMessagingReadiness = {
  enabled: boolean;
  sender_authorized: boolean;
  provider_connected: boolean;
  owner_recipients: number;
  public_base_configured: boolean;
};

export type BookingMessagingSummary = {
  readiness: BookingMessagingReadiness;
  bookings: Record<string, Partial<Record<BookingMessageKind, BookingMessageState>>>;
};

function publicBase(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = (env.KPL_BOOKING_PUBLIC_BASE_URL ?? '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/'
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function bookingOwnerEmailsFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const seen = new Set<string>();
  return (env.KPL_BOOKING_OWNER_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    })
    .slice(0, 8);
}

function messageState(
  kind: BookingMessageKind,
  row: StayMessageRow,
): BookingMessageState {
  return {
    kind,
    status: row.status,
    hold_reason: row.hold_reason,
    sent_at: row.sent_at,
    verification: row.verification,
    provider_accepted: row.verification === 'provider_accepted',
  };
}

function syntheticHeld(kind: BookingMessageKind, reason: string): BookingMessageState {
  return {
    kind,
    status: 'held',
    hold_reason: reason,
    sent_at: null,
    verification: 'none',
    provider_accepted: false,
  };
}

function messageKey(
  bookingId: string,
  kind: BookingMessageKind,
  ownerIndex?: number,
): string {
  return ownerIndex === undefined
    ? `booking:${bookingId}:${kind}:v1`
    : `booking:${bookingId}:${kind}:${ownerIndex}:v1`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there';
}

function dollars(cents: number | null): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.max(0, cents ?? 0) / 100);
}

function kindFromKey(value: string | null): BookingMessageKind | null {
  if (!value) return null;
  const match = value.match(
    /^booking:[0-9a-f-]{36}:(request_guest|request_owner|quote_guest|confirmed_guest|confirmed_owner)(?::\d+)?:v1$/i,
  );
  return (match?.[1] as BookingMessageKind | undefined) ?? null;
}

function bookingIdFromKey(value: string | null): string | null {
  if (!value) return null;
  return value.match(/^booking:([0-9a-f-]{36}):/i)?.[1] ?? null;
}

export class StayOSBookingMessaging {
  constructor(
    private readonly db: Database.Database,
    private readonly resolve: StayMessagingResolver,
  ) {}

  readiness(scope: StayOSBookingScope): BookingMessagingReadiness {
    const enabled = stayMessagingEnabled();
    const sender = getAuthorizedSender(this.db, scope.workspaceId, 'email');
    let providerConnected = false;

    if (enabled && sender) {
      try {
        const deps = this.resolve();
        providerConnected = hasProviderFor({
          connectorStore: deps.connectorStore,
          channel: 'email',
          tenantId: scope.workspaceId,
          userId: sender,
        });
      } catch {
        providerConnected = false;
      }
    }

    return {
      enabled,
      sender_authorized: Boolean(sender),
      provider_connected: providerConnected,
      owner_recipients: bookingOwnerEmailsFromEnv().length,
      public_base_configured: Boolean(publicBase()),
    };
  }

  private async deliver(input: {
    scope: StayOSBookingScope;
    booking: Booking;
    kind: BookingMessageKind;
    to: string;
    subject: string;
    body: string;
    ownerIndex?: number;
    render?: (body: string) => string;
  }): Promise<BookingMessageState> {
    const created = createStayMessage(this.db, {
      workspaceId: input.scope.workspaceId,
      reservationId: null,
      channel: 'email',
      toAddress: input.to,
      subject: input.subject,
      body: input.body,
      idempotencyKey: messageKey(input.booking.id, input.kind, input.ownerIndex),
    });

    const delivered = await deliverStayMessage(
      this.db,
      this.resolve,
      input.scope.workspaceId,
      created.row.id,
      [],
      input.render ? { render: input.render } : {},
    );

    return messageState(input.kind, delivered);
  }

  async requestCreated(scope: StayOSBookingScope, booking: Booking): Promise<void> {
    const name = firstName(booking.guest_name);

    await this.deliver({
      scope,
      booking,
      kind: 'request_guest',
      to: booking.guest_email,
      subject: 'We received your Kendall Pond stay request',
      body: [
        `Hi ${name},`,
        '',
        `We received your request for ${booking.check_in} through ${booking.check_out}.`,
        '',
        'This is not a reservation yet. Nate or Allie will check the dates and send the complete itemized quote before any payment is due.',
        '',
        'The Lodge at Kendall Pond',
      ].join('\n'),
    });

    const base = publicBase();
    for (const [index, owner] of bookingOwnerEmailsFromEnv().entries()) {
      await this.deliver({
        scope,
        booking,
        kind: 'request_owner',
        ownerIndex: index,
        to: owner,
        subject: 'New direct stay request · Kendall Pond Lodge',
        body: [
          'A new direct booking request is waiting.',
          '',
          `${booking.check_in} → ${booking.check_out}`,
          `${booking.guests} guest${booking.guests === 1 ? '' : 's'} · ${booking.pets} pet${booking.pets === 1 ? '' : 's'}`,
          '',
          base
            ? `Open Owner Bookings: ${base}/owner/bookings`
            : 'Open KPL Owner Bookings to review it.',
        ].join('\n'),
      });
    }
  }

  async sendQuote(
    scope: StayOSBookingScope,
    booking: Booking,
  ): Promise<BookingMessageState> {
    const base = publicBase();
    if (!base) return syntheticHeld('quote_guest', 'public_base_not_configured');

    const link = `${base}/book/quote/${booking.quote_token}`;
    const name = firstName(booking.guest_name);

    return this.deliver({
      scope,
      booking,
      kind: 'quote_guest',
      to: booking.guest_email,
      subject: 'Your Lodge at Kendall Pond quote is ready',
      body: [
        `Hi ${name},`,
        '',
        'Your private Lodge at Kendall Pond quote is ready.',
        '',
        `Stay: ${booking.check_in} → ${booking.check_out}`,
        `Full stay: ${dollars(booking.total_cents)}`,
        `Deposit due now: ${dollars(booking.deposit_cents)}`,
        '',
        `Review the itemized price and terms here: ${BOOKING_QUOTE_LINK_PLACEHOLDER}`,
        '',
        'Nothing is charged until you review the quote, accept the terms, and continue to Stripe.',
        '',
        'Nate & Allie',
      ].join('\n'),
      render: (body) => body.replace(BOOKING_QUOTE_LINK_PLACEHOLDER, link),
    });
  }

  queueConfirmed(scope: StayOSBookingScope, booking: Booking): void {
    const base = publicBase();
    const name = firstName(booking.guest_name);

    createStayMessage(this.db, {
      workspaceId: scope.workspaceId,
      reservationId: null,
      channel: 'email',
      toAddress: booking.guest_email,
      subject: 'Your Kendall Pond stay is confirmed',
      body: [
        `Hi ${name},`,
        '',
        'Your deposit is recorded and your Lodge at Kendall Pond stay is confirmed.',
        '',
        `Stay: ${booking.check_in} → ${booking.check_out}`,
        `Deposit recorded: ${dollars(booking.deposit_cents)}`,
        `Remaining balance: ${dollars(
          (booking.total_cents ?? 0) - (booking.deposit_cents ?? 0),
        )}`,
        '',
        booking.balance_terms
          ? `Balance terms: ${booking.balance_terms}`
          : 'Your hosts will follow up about the remaining balance.',
        '',
        base
          ? `Guest Guide: ${base}/guidebook`
          : 'Your hosts will send arrival and Guidebook details before check-in.',
        '',
        'Nate & Allie',
      ].join('\n'),
      idempotencyKey: messageKey(booking.id, 'confirmed_guest'),
    });

    for (const [index, owner] of bookingOwnerEmailsFromEnv().entries()) {
      createStayMessage(this.db, {
        workspaceId: scope.workspaceId,
        reservationId: null,
        channel: 'email',
        toAddress: owner,
        subject: 'Direct stay confirmed · Kendall Pond Lodge',
        body: [
          'A direct booking deposit has been verified by PJ.',
          '',
          `${booking.check_in} → ${booking.check_out}`,
          `Deposit: ${dollars(booking.deposit_cents)}`,
          `Full stay: ${dollars(booking.total_cents)}`,
          '',
          base
            ? `Owner Bookings: ${base}/owner/bookings`
            : 'Open KPL Owner Bookings for the governed record.',
        ].join('\n'),
        idempotencyKey: messageKey(booking.id, 'confirmed_owner', index),
      });
    }
  }

  summary(
    scope: StayOSBookingScope,
    bookingIds: string[],
  ): BookingMessagingSummary {
    const wanted = new Set(bookingIds);
    const rows = this.db.prepare(`
      SELECT *
      FROM stayos_messages
      WHERE workspace_id = ?
        AND direction = 'outbound'
        AND idempotency_key LIKE 'booking:%'
      ORDER BY created_at ASC
    `).all(scope.workspaceId) as StayMessageRow[];

    const bookings: BookingMessagingSummary['bookings'] = {};

    for (const row of rows) {
      const bookingId = bookingIdFromKey(row.idempotency_key);
      const kind = kindFromKey(row.idempotency_key);
      if (!bookingId || !kind || !wanted.has(bookingId)) continue;
      bookings[bookingId] ??= {};
      bookings[bookingId][kind] = messageState(kind, row);
    }

    return { readiness: this.readiness(scope), bookings };
  }

  async retryPending(limit = 20): Promise<number> {
    const rows = this.db.prepare(`
      SELECT *
      FROM stayos_messages
      WHERE direction = 'outbound'
        AND idempotency_key LIKE 'booking:%'
        AND status IN ('pending', 'held', 'failed')
        AND attempts < 3
      ORDER BY created_at ASC
      LIMIT ?
    `).all(Math.max(1, Math.min(limit, 100))) as StayMessageRow[];

    let delivered = 0;

    for (const row of rows) {
      if (kindFromKey(row.idempotency_key) === 'quote_guest') continue;

      const sender = getAuthorizedSender(this.db, row.workspace_id, 'email');
      if (!stayMessagingEnabled() || !sender) continue;

      let provider = false;
      try {
        const deps = this.resolve();
        provider = hasProviderFor({
          connectorStore: deps.connectorStore,
          channel: 'email',
          tenantId: row.workspace_id,
          userId: sender,
        });
      } catch {
        provider = false;
      }
      if (!provider) continue;

      const final = await deliverStayMessage(
        this.db,
        this.resolve,
        row.workspace_id,
        row.id,
      );
      if (final.status === 'sent') delivered += 1;
    }

    return delivered;
  }
}
EOF

say "PJ BOOKING ROUTES"

python3 <<'PY'
from pathlib import Path

p = Path("apps/puddlejumper/src/stayos/booking/bookingRoutes.ts")
s = p.read_text()

old = """import {
  BookingError,
  type ReservationConflict,
  type CreateBookingInput,
  type IssueQuoteInput,
  type StayOSBookingService,
} from "./bookingService.js";"""

new = """import {
  BookingError,
  type ReservationConflict,
  type CreateBookingInput,
  type IssueQuoteInput,
  type StayOSBookingService,
} from "./bookingService.js";

import type { StayOSBookingMessaging } from "./bookingMessaging.js";"""

if old not in s:
    raise SystemExit("bookingRoutes import anchor changed")
s = s.replace(old, new, 1)

old = """  options: {
    availability?: (
      scope: StayOSBookingScope,
      checkIn: string,
      checkOut: string,
    ) => Promise<string>;
  } = {},
): Router {"""

new = """  options: {
    availability?: (
      scope: StayOSBookingScope,
      checkIn: string,
      checkOut: string,
    ) => Promise<string>;
    messaging?: StayOSBookingMessaging;
  } = {},
): Router {"""

if old not in s:
    raise SystemExit("bookingRoutes options anchor changed")
s = s.replace(old, new, 1)

old = """      ok(res, 201, service.create(scopeOf(res), input));
    }),
  );"""

new = """      const booking = service.create(scopeOf(res), input);

      try {
        await options.messaging?.requestCreated(scopeOf(res), booking);
      } catch {
        console.error('[stayos-booking] request notification deferred');
      }

      ok(res, 201, booking);
    }),
  );"""

if old not in s:
    raise SystemExit("bookingRoutes request anchor changed")
s = s.replace(old, new, 1)

old = """  // 4. Get one
  router.get(
    "/booking-requests/:id","""

new = """  // Messaging status contains no guest email, quote token or provider secret.
  router.get(
    "/booking-requests/message-status",
    handle((_req, res) => {
      const scope = scopeOf(res);
      const ids = service.list(scope, 100).map((booking) => booking.id);

      ok(
        res,
        200,
        options.messaging
          ? options.messaging.summary(scope, ids)
          : {
              readiness: {
                enabled: false,
                sender_authorized: false,
                provider_connected: false,
                owner_recipients: 0,
                public_base_configured: false,
              },
              bookings: {},
            },
      );
    }),
  );

  // 4. Get one
  router.get(
    "/booking-requests/:id","""

if old not in s:
    raise SystemExit("bookingRoutes message-status anchor changed")
s = s.replace(old, new, 1)

old = """  // 7. Attach Stripe Checkout Session
  router.post(
    "/booking-requests/:id/attach-checkout","""

new = """  // Owner-triggered quote delivery after PJ verifies the Airbnb owner block.
  router.post(
    "/booking-requests/:id/send-quote",
    handle(async (req, res) => {
      const id = uuidParam(req, res);
      if (!id) return;

      const booking = service.get(scopeOf(res), id);
      if (!booking) {
        throw new BookingError(404, "not_found", "Booking request not found.");
      }
      if (booking.status !== "quoted") {
        throw new BookingError(409, "not_open", "Only an open quote can be sent.");
      }
      if (!booking.quote_expires || Date.parse(booking.quote_expires) <= Date.now()) {
        throw new BookingError(409, "quote_expired", "This quote is no longer open.");
      }

      const calendar = await readCalendar(
        options.availability,
        scopeOf(res),
        booking.check_in,
        booking.check_out,
      );
      if (calendar !== "owner-blocked") {
        throw new BookingError(
          409,
          "calendar_conflict",
          "The complete stay must be owner-blocked on Airbnb before the quote is sent.",
        );
      }

      if (!options.messaging) {
        throw new BookingError(
          503,
          "message_unavailable",
          "Booking messaging is not configured.",
        );
      }

      ok(
        res,
        200,
        await options.messaging.sendQuote(scopeOf(res), booking),
      );
    }),
  );

  // 7. Attach Stripe Checkout Session
  router.post(
    "/booking-requests/:id/attach-checkout","""

if old not in s:
    raise SystemExit("bookingRoutes send-quote anchor changed")
s = s.replace(old, new, 1)

old = """      ok(res, 200, service.confirmPayment(scopeOf(res), id, session, amount, { externalConflict }));
    }),
  );"""

new = """      const result = service.confirmPayment(
        scopeOf(res),
        id,
        session,
        amount,
        { externalConflict },
      );

      if (result.ok) {
        const confirmed = service.get(scopeOf(res), id);
        if (confirmed?.status === "confirmed") {
          try {
            options.messaging?.queueConfirmed(scopeOf(res), confirmed);
          } catch {
            console.error('[stayos-booking] confirmation notification deferred');
          }
        }
      }

      ok(res, 200, result);
    }),
  );"""

if old not in s:
    raise SystemExit("bookingRoutes confirm-payment anchor changed")
p.write_text(s.replace(old, new, 1))
PY

say "PJ SERVER COMPOSITION"

python3 <<'PY'
from pathlib import Path

p = Path("apps/puddlejumper/src/api/server.ts")
s = p.read_text()

old = """import { StayOSBookingService } from '../stayos/booking/bookingService.js';
import { createStayOSBookingRouter, sendBookingError } from '../stayos/booking/bookingRoutes.js';"""

new = """import { StayOSBookingService } from '../stayos/booking/bookingService.js';
import { StayOSBookingMessaging } from '../stayos/booking/bookingMessaging.js';
import { createStayOSBookingRouter, sendBookingError } from '../stayos/booking/bookingRoutes.js';"""

if old not in s:
    raise SystemExit("server import anchor changed")
s = s.replace(old, new, 1)

old = """  const stayosBookingService = new StayOSBookingService(approvalStore.db, canonDb, undefined,
    scopedPolicyGate(kplPolicy, policyScopesFromEnv()));
  app.use("""

new = """  const stayosBookingService = new StayOSBookingService(approvalStore.db, canonDb, undefined,
    scopedPolicyGate(kplPolicy, policyScopesFromEnv()));

  const stayosBookingMessaging = new StayOSBookingMessaging(
    approvalStore.db,
    stayMessaging,
  );

  app.use("""

if old not in s:
    raise SystemExit("server booking service anchor changed")
s = s.replace(old, new, 1)

old = """    createStayOSBookingRouter(stayosBookingService, loadStayOSBookingConfig(),
      stayContentProviders ? { availability: async (scope,checkIn,checkOut) => (await stayContentProviders.availability(scope,checkIn,checkOut)).status } : {}),
  );"""

new = """    createStayOSBookingRouter(
      stayosBookingService,
      loadStayOSBookingConfig(),
      {
        messaging: stayosBookingMessaging,
        ...(stayContentProviders
          ? {
              availability: async (scope, checkIn, checkOut) =>
                (await stayContentProviders.availability(scope, checkIn, checkOut)).status,
            }
          : {}),
      },
    ),
  );"""

if old not in s:
    raise SystemExit("server booking router anchor changed")
s = s.replace(old, new, 1)

old = """    try {
      // Request Cases: backfill, fold into inquiry Cases, stage sync, close abandoned.
      stayosBookingService.syncBookingRequestCases();
    } catch (error) {
      console.error("[stayos-booking] request Case sync failed", (error as Error).message);
    }
  };"""

new = """    try {
      // Request Cases: backfill, fold into inquiry Cases, stage sync, close abandoned.
      stayosBookingService.syncBookingRequestCases();
    } catch (error) {
      console.error("[stayos-booking] request Case sync failed", (error as Error).message);
    }

    void stayosBookingMessaging.retryPending().catch((error) => {
      console.error(
        "[stayos-booking] message retry failed",
        (error as Error).message,
      );
    });
  };"""

if old not in s:
    raise SystemExit("server maintenance anchor changed")
p.write_text(s.replace(old, new, 1))
PY

say "PJ TEST HARNESS"

python3 <<'PY'
from pathlib import Path

p = Path("apps/puddlejumper/scripts/kpl-beta/harness.ts")
s = p.read_text()

old = """import { StayOSBookingService } from '../../src/stayos/booking/bookingService.js';
import { createStayOSBookingRouter } from '../../src/stayos/booking/bookingRoutes.js';"""

new = """import { StayOSBookingService } from '../../src/stayos/booking/bookingService.js';
import { StayOSBookingMessaging } from '../../src/stayos/booking/bookingMessaging.js';
import { createStayOSBookingRouter } from '../../src/stayos/booking/bookingRoutes.js';"""

if old not in s:
    raise SystemExit("harness import anchor changed")
s = s.replace(old, new, 1)

old = """  booking: StayOSBookingService;
  inquiry: StayOSInquiryService;"""

new = """  booking: StayOSBookingService;
  bookingMessaging: StayOSBookingMessaging;
  inquiry: StayOSInquiryService;"""

if old not in s:
    raise SystemExit("harness interface anchor changed")
s = s.replace(old, new, 1)

old = """  const policy = new KplBookingPolicy(db, canonDb, now);
  const booking = new StayOSBookingService(db, canonDb, now, scopedPolicyGate(policy, [`${TEST_WORKSPACE}/${TEST_PROPERTY}`]));
  const inquiry = new StayOSInquiryService"""

new = """  const policy = new KplBookingPolicy(db, canonDb, now);
  const booking = new StayOSBookingService(db, canonDb, now, scopedPolicyGate(policy, [`${TEST_WORKSPACE}/${TEST_PROPERTY}`]));
  const bookingMessaging = new StayOSBookingMessaging(db, () => messaging);
  const inquiry = new StayOSInquiryService"""

if old not in s:
    raise SystemExit("harness booking anchor changed")
s = s.replace(old, new, 1)

old = """  app.use('/api/stayos/booking', createStayOSBookingRouter(booking, config, { availability: async () => calendar.status }));"""

new = """  app.use('/api/stayos/booking', createStayOSBookingRouter(booking, config, {
    availability: async () => calendar.status,
    messaging: bookingMessaging,
  }));"""

if old not in s:
    raise SystemExit("harness router anchor changed")
s = s.replace(old, new, 1)

old = """    app, db, canonDb, clock, calendar, booking, inquiry, lifecycle, policy,"""

new = """    app, db, canonDb, clock, calendar, booking, bookingMessaging, inquiry, lifecycle, policy,"""

if old not in s:
    raise SystemExit("harness return anchor changed")
p.write_text(s.replace(old, new, 1))
PY

cat > apps/puddlejumper/test/booking-messaging.test.ts <<'EOF'
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BOOKING_QUOTE_LINK_PLACEHOLDER } from '../src/stayos/messaging.js';
import {
  createKplBetaHarness,
  type KplBetaHarness,
} from '../scripts/kpl-beta/harness.js';

describe('KPL governed booking messaging', () => {
  let h: KplBetaHarness;
  let previous: Record<string, string | undefined>;

  beforeEach(() => {
    previous = {
      PJ_STAY_MESSAGING: process.env.PJ_STAY_MESSAGING,
      KPL_BOOKING_PUBLIC_BASE_URL: process.env.KPL_BOOKING_PUBLIC_BASE_URL,
      KPL_BOOKING_OWNER_EMAILS: process.env.KPL_BOOKING_OWNER_EMAILS,
    };

    process.env.PJ_STAY_MESSAGING = 'enabled';
    process.env.KPL_BOOKING_PUBLIC_BASE_URL = 'https://kendallpondlodge.test';
    process.env.KPL_BOOKING_OWNER_EMAILS = 'hosts@example.com';

    h = createKplBetaHarness({
      startAt: '2026-11-02T14:00:00.000Z',
    });
    h.enableGuestEmail();
  });

  afterEach(() => {
    h.close();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('request → quote → payment → confirmation is idempotent and quote token is absent from stored message body', async () => {
    const created = await h.guestBooking('/booking-requests', {
      check_in: '2026-11-10',
      check_out: '2026-11-12',
      guest_name: 'Taylor Guest',
      guest_email: 'taylor@example.com',
      guests: 2,
      pets: 0,
      note: '',
    }).expect(201);

    const booking = created.body.data;

    expect(h.sentEmails.some((email) =>
      email.to === 'taylor@example.com' &&
      /received your Kendall Pond stay request/i.test(email.subject),
    )).toBe(true);

    expect(h.sentEmails.some((email) =>
      email.to === 'hosts@example.com' &&
      /new direct stay request/i.test(email.subject),
    )).toBe(true);

    await h.ownerBooking(`/booking-requests/${booking.id}/quote`, 'post', {
      nightly_cents: 20000,
      cleaning_cents: 10000,
      pet_cents: 0,
      tax_cents: 0,
      other_cents: 0,
      other_label: '',
      deposit_cents: 20000,
      total_cents: 50000,
      cancellation_terms: 'Full refund if cancelled at least thirty days before arrival.',
      balance_terms: 'The remaining balance is due before arrival under the host payment instructions.',
      quote_expires: '2026-11-04T16:00:00.000Z',
    }).expect(200);

    h.calendar.status = 'owner-blocked';

    const sent = await h.ownerBooking(
      `/booking-requests/${booking.id}/send-quote`,
      'post',
    ).expect(200);

    expect(sent.body.data).toMatchObject({
      kind: 'quote_guest',
      status: 'sent',
      provider_accepted: true,
    });

    const stored = h.db.prepare(`
      SELECT body FROM stayos_messages WHERE idempotency_key = ?
    `).get(`booking:${booking.id}:quote_guest:v1`) as { body: string };

    expect(stored.body).toContain(BOOKING_QUOTE_LINK_PLACEHOLDER);
    expect(stored.body).not.toContain(booking.quote_token);

    const quoteEmail = h.sentEmails.find((email) =>
      email.to === 'taylor@example.com' &&
      /quote is ready/i.test(email.subject),
    );

    expect(quoteEmail?.body).toContain(
      `https://kendallpondlodge.test/book/quote/${booking.quote_token}`,
    );

    await h.guestBooking('/booking-requests/begin-checkout', {
      quote_token: booking.quote_token,
    }).expect(200);

    const stripeSession = 'cs_test_bookingmessage12345';

    await h.ownerBooking(
      `/booking-requests/${booking.id}/attach-checkout`,
      'post',
      { stripe_session_id: stripeSession },
    ).expect(200);

    const confirmed = await h.ownerBooking(
      `/booking-requests/${booking.id}/confirm-payment`,
      'post',
      {
        stripe_session_id: stripeSession,
        amount_cents: 20000,
      },
    ).expect(200);

    expect(confirmed.body.data).toEqual({ ok: true });

    await h.bookingMessaging.retryPending();

    expect(h.sentEmails.some((email) =>
      email.to === 'taylor@example.com' &&
      /stay is confirmed/i.test(email.subject),
    )).toBe(true);

    expect(h.sentEmails.some((email) =>
      email.to === 'hosts@example.com' &&
      /direct stay confirmed/i.test(email.subject),
    )).toBe(true);

    await h.ownerBooking(
      `/booking-requests/${booking.id}/confirm-payment`,
      'post',
      {
        stripe_session_id: stripeSession,
        amount_cents: 20000,
      },
    ).expect(200);

    await h.bookingMessaging.retryPending();

    expect(h.sentEmails.filter((email) =>
      email.to === 'taylor@example.com' &&
      /stay is confirmed/i.test(email.subject),
    )).toHaveLength(1);

    const state = await h.ownerBooking(
      '/booking-requests/message-status',
      'get',
    ).expect(200);

    expect(state.body.data.bookings[booking.id].quote_guest).toMatchObject({
      status: 'sent',
      provider_accepted: true,
    });

    expect(state.body.data.bookings[booking.id].confirmed_guest).toMatchObject({
      status: 'sent',
      provider_accepted: true,
    });
  });
});
EOF

say "PJ DOCS"

cat > docs/KPL-BOOKING-MESSAGING.md <<'EOF'
# KPL booking messaging

PuddleJumper is the delivery authority for direct-booking email.

## Flow

1. Guest request:
   - guest acknowledgement
   - configured owner notification
2. Owner quote:
   - PJ refuses delivery until Airbnb reports every stayed night as an owner block
   - the private quote bearer URL is rendered only in memory and is never persisted in `stayos_messages`
3. Stripe deposit confirmation:
   - PJ commits the booking first
   - confirmation messages are queued afterward
   - provider failure never changes Stripe acknowledgement or booking truth
4. Owner status:
   - KPL reads `/booking-requests/message-status`
   - `sent` means the provider accepted the message; it does not claim recipient delivery

## Runtime configuration

PJ requires:

- `PJ_STAY_MESSAGING=enabled`
- `KPL_BOOKING_PUBLIC_BASE_URL=https://kendallpondlodge.com`
- `KPL_BOOKING_OWNER_EMAILS=<comma-separated owner notification addresses>`

Email also requires an authorized StayOS email sender for the KPL workspace and a connected Google or Microsoft provider for that sender.

If either is missing, messages remain held. PJ never fabricates a successful send.

## Safety

- booking calculations and payment truth remain in PJ
- the private quote token is not stored in message history
- quote delivery is idempotent
- confirmation delivery is idempotent
- Stripe webhooks do not depend on mail-provider availability
EOF

say "PJ STAGE + CHECKSUM"

git add \
  apps/puddlejumper/src/stayos/messaging.ts \
  apps/puddlejumper/src/stayos/booking/bookingMessaging.ts \
  apps/puddlejumper/src/stayos/booking/bookingRoutes.ts \
  apps/puddlejumper/src/api/server.ts \
  apps/puddlejumper/scripts/kpl-beta/harness.ts \
  apps/puddlejumper/test/booking-messaging.test.ts \
  docs/KPL-BOOKING-MESSAGING.md

refresh_checksums
git add SHA256SUMS.txt

say "PJ INSTALL"
pnpm install --frozen-lockfile

say "PJ TARGETED TEST"
pnpm --filter @publiclogic/puddlejumper test -- booking-messaging.test.ts

say "PJ FULL CI"
pnpm run ci

say "PJ BOOKING VERIFICATION"
pnpm run verify:booking

say "PJ COMMIT + PUSH"
git status --short
git diff --cached --stat
git commit -m "Add governed KPL booking messaging"
git push -u origin "$PJ_BRANCH"

PJ_PR="$(
  gh pr create \
    --repo "$PJ_REPO" \
    --base main \
    --head "$PJ_BRANCH" \
    --title "KPL: governed booking messaging" \
    --body "Completes the PuddleJumper side of the KPL direct-booking communication lifecycle.

- guest acknowledgement after a request is accepted
- configured owner notification for a new request
- PJ-owned Send Quote after verified Airbnb owner block
- private quote bearer URL rendered only at provider delivery
- queued guest/owner confirmation after payment is committed
- durable provider-accepted state for the KPL owner console
- idempotent request, quote and confirmation messaging
- Stripe acknowledgement does not depend on email delivery

Runtime activation remains fail-closed until PJ_STAY_MESSAGING, the public base, owner recipients, an authorized sender and a connected Google/Microsoft provider are configured."
)"

echo "PJ PR: $PJ_PR"

say "KPL CLEAN BRANCH"

git -C "$KPL_SOURCE" fetch origin main
git -C "$KPL_SOURCE" worktree add -b "$KPL_BRANCH" "$KPL_WORKTREE" origin/main
cd "$KPL_WORKTREE"

echo "KPL baseline: $(git rev-parse HEAD)"

say "KPL PJ CLIENT"

python3 <<'PY'
from pathlib import Path

p = Path("lib/pj-booking-client.mjs")
s = p.read_text()

old = """    release(id) { return this.request(`/booking-requests/${identifier(id)}/release`, { method: 'POST' }); }
    attention() { return this.request('/booking-requests/attention'); }
    resolveReconciliation(id, note) {"""

new = """    release(id) { return this.request(`/booking-requests/${identifier(id)}/release`, { method: 'POST' }); }
    attention() { return this.request('/booking-requests/attention'); }
    messageStatus() { return this.request('/booking-requests/message-status'); }
    sendQuote(id) { return this.request(`/booking-requests/${identifier(id)}/send-quote`, { method: 'POST' }); }
    resolveReconciliation(id, note) {"""

if old not in s:
    raise SystemExit("KPL client method anchor changed")
s = s.replace(old, new, 1)

old = """        acceptance_required: 'Please accept the quote and terms before continuing.',
    };"""

new = """        acceptance_required: 'Please accept the quote and terms before continuing.',
        message_unavailable: 'Email delivery is not available right now. The quote is still safe and can be sent later.',
        quote_expired: 'This quote is no longer open. Check the dates and issue a new quote.',
    };"""

if old not in s:
    raise SystemExit("KPL client publicError anchor changed")
p.write_text(s.replace(old, new, 1))
PY

cat >> lib/booking-db.ts <<'EOF'


export type BookingMessageState = {
 kind:'request_guest'|'request_owner'|'quote_guest'|'confirmed_guest'|'confirmed_owner';
 status:string;
 hold_reason:string|null;
 sent_at:string|null;
 verification:string;
 provider_accepted:boolean;
};

export type BookingMessagingStatus = {
 readiness:{
   enabled:boolean;
   sender_authorized:boolean;
   provider_connected:boolean;
   owner_recipients:number;
   public_base_configured:boolean;
 };
 bookings:Record<string,Partial<Record<BookingMessageState['kind'],BookingMessageState>>>;
};

export async function bookingMessageStatus():Promise<BookingMessagingStatus>{
 return bookingClient().messageStatus() as Promise<BookingMessagingStatus>;
}
EOF

say "KPL SEND QUOTE ACTION"

cat >> app/owner/bookings/actions.ts <<'EOF'


export async function sendQuoteEmail(form: FormData) {
  const cookie = (await cookies()).get(OWNER_COOKIE_NAME)?.value;
  if (!verifyOwnerSessionToken(cookie)) {
    redirect('/owner/access?next=/owner/bookings');
  }

  const id = String(form.get('id') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    redirect('/owner/bookings?status=invalid');
  }

  let outcome = 'quote-sent';

  try {
    const quote = await bookingClient().get(id);

    if (!quote || quote.status !== 'quoted') {
      throw new BookingServiceError(409, 'not_open');
    }

    const ics = await fetchAirbnbIcs({ fresh: true });
    const nights = nightsBetween(quote.check_in, quote.check_out);

    if (airbnbStayStatus(ics, nights) !== 'owner-blocked') {
      throw new BookingServiceError(409, 'calendar_conflict');
    }

    const result = await bookingClient().sendQuote(id);

    if (result?.status !== 'sent' || result?.provider_accepted !== true) {
      outcome = 'quote-held';
    }
  } catch (error) {
    const code = error instanceof BookingServiceError
      ? error.code
      : 'quote-email-error';

    console.error('Could not send quote:', code);
    outcome = code;
  }

  redirect(`/owner/bookings?status=${encodeURIComponent(outcome)}`);
}
EOF

say "KPL QUOTE DELIVERY UI"

cat > app/owner/bookings/QuoteLinkActions.tsx <<'EOF'
"use client";

import { useState } from "react";
import { sendQuoteEmail } from "./actions";

export function QuoteLinkActions({
  id,
  path,
  deliveryStatus,
  providerAccepted,
  holdReason,
  messagingReady,
}: {
  id: string;
  path: string;
  deliveryStatus?: string | null;
  providerAccepted?: boolean;
  holdReason?: string | null;
  messagingReady: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const url = `https://kendallpondlodge.com${path}`;
  const sent = deliveryStatus === "sent" && providerAccepted === true;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="owner-quote-actions">
      {sent ? (
        <span className="owner-message-state owner-message-state-sent">
          ✓ Quote accepted by email provider
        </span>
      ) : (
        <form action={sendQuoteEmail}>
          <input name="id" type="hidden" value={id} />
          <button
            className="button button-primary"
            disabled={!messagingReady}
            type="submit"
          >
            Send quote
          </button>
        </form>
      )}

      <button
        className="button button-secondary"
        onClick={copy}
        type="button"
      >
        {copied ? "Copied" : "Copy link"}
      </button>

      <a
        className="owner-quote-open"
        href={path}
        rel="noreferrer"
        target="_blank"
      >
        Preview guest quote ↗
      </a>

      {!sent && !messagingReady && (
        <small>
          PJ email is held until an authorized sender and connected mail provider are ready.
        </small>
      )}

      {!sent && messagingReady && deliveryStatus === "held" && (
        <small>
          Delivery is held{holdReason ? `: ${holdReason}` : "."}
        </small>
      )}
    </div>
  );
}
EOF

say "KPL OWNER OPERATIONAL LOOP"

python3 <<'PY'
from pathlib import Path

p = Path("app/owner/bookings/page.tsx")
s = p.read_text()

old = """  bookingAttention,
  bookingConfigured,
  bookingDb,
  publicError,
  type Booking,
  type BookingAttention,
  usd,
} from "@/lib/booking-db";"""

new = """  bookingAttention,
  bookingConfigured,
  bookingDb,
  bookingMessageStatus,
  publicError,
  type Booking,
  type BookingAttention,
  type BookingMessageState,
  type BookingMessagingStatus,
  usd,
} from "@/lib/booking-db";"""

if old not in s:
    raise SystemExit("owner page import anchor changed")
s = s.replace(old, new, 1)

start = s.index("const workflow = [")
end = s.index("export default async function OwnerBookings")

replacement = """const workflow = [
  "New",
  "Quote",
  "Airbnb",
  "Send",
  "Paying",
  "Confirmed",
] as const;

function quoteSent(
  message: BookingMessageState | null | undefined,
) {
  return (
    message?.status === "sent" &&
    message.provider_accepted === true
  );
}

function statusLabel(
  request: Booking,
  stayStatus: string | null,
  quoteMessage: BookingMessageState | null | undefined,
) {
  if (request.status === "requested") return "New";

  if (request.status === "quoted") {
    if (stayStatus !== "owner-blocked") return "Waiting for Airbnb block";
    return quoteSent(quoteMessage) ? "Sent" : "Quote ready";
  }

  if (request.status === "checkout") return "Paying";
  if (request.status === "confirmed") return "Confirmed";
  if (request.status === "expired") return "Expired";
  return "Declined";
}

function workflowPosition(
  request: Booking,
  stayStatus: string | null,
  quoteMessage: BookingMessageState | null | undefined,
) {
  if (request.status === "confirmed") return 7;
  if (request.status === "checkout") return 5;

  if (request.status === "quoted") {
    if (stayStatus !== "owner-blocked") return 3;
    return quoteSent(quoteMessage) ? 5 : 4;
  }

  if (request.status === "requested") return 1;
  return 1;
}

function WorkflowRail({
  request,
  stayStatus,
  quoteMessage,
}: {
  request: Booking;
  stayStatus: string | null;
  quoteMessage: BookingMessageState | null | undefined;
}) {
  const position = workflowPosition(request, stayStatus, quoteMessage);

  return (
    <div
      className="owner-booking-progress"
      aria-label="Booking progress"
    >
      {workflow.map((step, index) => {
        const number = index + 1;
        const state =
          number < position
            ? "is-done"
            : number === position
              ? "is-current"
              : "";

        return (
          <div
            className={`owner-booking-step ${state}`}
            key={step}
          >
            <span>{number}</span>
            <strong>{step}</strong>
          </div>
        );
      })}
    </div>
  );
}

"""

s = s[:start] + replacement + s[end:]

old = """  let attention: BookingAttention | null = null;
  let attentionFailed = false;

  const configured = bookingConfigured();"""

new = """  let attention: BookingAttention | null = null;
  let attentionFailed = false;
  let messaging: BookingMessagingStatus | null = null;

  const configured = bookingConfigured();"""

if old not in s:
    raise SystemExit("owner page state anchor changed")
s = s.replace(old, new, 1)

old = """    try {
      attention = await bookingAttention();
    } catch {
      attentionFailed = true;
    }
  }

  let airbnbIcs: string | null = null;"""

new = """    try {
      attention = await bookingAttention();
    } catch {
      attentionFailed = true;
    }

    try {
      messaging = await bookingMessageStatus();
    } catch {
      messaging = null;
    }
  }

  let airbnbIcs: string | null = null;"""

if old not in s:
    raise SystemExit("owner page message status anchor changed")
s = s.replace(old, new, 1)

old = """          const quotePath =
            `/book/quote/${request.quote_token}`;

          return ("""

new = """          const quotePath =
            `/book/quote/${request.quote_token}`;

          const quoteMessage =
            messaging?.bookings?.[request.id]?.quote_guest ?? null;

          const messagingReady = Boolean(
            messaging?.readiness.enabled &&
            messaging?.readiness.sender_authorized &&
            messaging?.readiness.provider_connected &&
            messaging?.readiness.public_base_configured,
          );

          return ("""

if old not in s:
    raise SystemExit("owner page quoteMessage anchor changed")
s = s.replace(old, new, 1)

old = """                  {statusLabel(request.status)}"""
new = """                  {statusLabel(request, stayStatus, quoteMessage)}"""
if old not in s:
    raise SystemExit("owner page statusLabel call changed")
s = s.replace(old, new, 1)

old = """              <WorkflowRail
                request={request}
                stayStatus={stayStatus}
              />"""

new = """              <WorkflowRail
                request={request}
                stayStatus={stayStatus}
                quoteMessage={quoteMessage}
              />"""

if old not in s:
    raise SystemExit("owner page WorkflowRail call changed")
s = s.replace(old, new, 1)

old = """                        <QuoteLinkActions
                          path={quotePath}
                          email={request.guest_email}
                        />"""

new = """                        <QuoteLinkActions
                          id={request.id}
                          path={quotePath}
                          deliveryStatus={quoteMessage?.status}
                          providerAccepted={quoteMessage?.provider_accepted}
                          holdReason={quoteMessage?.hold_reason}
                          messagingReady={messagingReady}
                        />"""

if old not in s:
    raise SystemExit("owner page QuoteLinkActions call changed")
s = s.replace(old, new, 1)

old = """          {status === "quoted"
            ? "Quote created. Block every quoted night on Airbnb, then refresh."
            : status === "released"
              ? "Unpaid hold released. Check Stripe and other reservations before changing Airbnb."
              : status === "resolved"
                ? "Correction note recorded. This did not issue a refund or cancel the stay."
                : publicError(status)}"""

new = """          {status === "quoted"
            ? "Quote created. Block every quoted night on Airbnb, then refresh."
            : status === "quote-sent"
              ? "Quote email was accepted by the connected provider."
              : status === "quote-held"
                ? "The quote is safe, but email delivery is held. Check PJ messaging readiness or use Copy link."
                : status === "released"
                  ? "Unpaid hold released. Check Stripe and other reservations before changing Airbnb."
                  : status === "resolved"
                    ? "Correction note recorded. This did not issue a refund or cancel the stay."
                    : publicError(status)}"""

if old not in s:
    raise SystemExit("owner page flash anchor changed")
p.write_text(s.replace(old, new, 1))
PY

say "KPL GUEST CONFIRMED EXPERIENCE"

python3 <<'PY'
from pathlib import Path

p = Path("app/book/quote/[token]/page.tsx")
s = p.read_text()

old = """    {state === 'confirmed' && <p className="booking-alert" role="status">Your deposit is recorded and your booking is confirmed. Your hosts will follow up about the balance and arrival.</p>}"""

new = """    {state === 'confirmed' && (
      <section
        className="booking-confirmed-panel"
        role="status"
      >
        <div>
          <p className="eyebrow">Confirmed</p>
          <h2>You’re booked.</h2>
          <p>
            Your {usd(deposit)} deposit is recorded for
            {` ${quote.check_in} → ${quote.check_out}`}.
          </p>
          <p>
            Remaining balance: {usd(total - deposit)}.
            {quote.balance_terms
              ? ` ${quote.balance_terms}`
              : ' Nate & Allie will follow up before arrival.'}
          </p>
        </div>

        <div className="booking-confirmed-actions">
          <Link
            className="button button-primary"
            href="/guidebook"
          >
            Open Guest Guide
          </Link>
          <a
            className="button button-secondary"
            href={hostContactHref()}
          >
            Contact Nate & Allie
          </a>
        </div>
      </section>
    )}"""

if old not in s:
    raise SystemExit("confirmed guest state anchor changed")
p.write_text(s.replace(old, new, 1))
PY

cat >> app/a-plus.css <<'EOF'


/* === GOVERNED BOOKING DELIVERY === */
.owner-booking-progress{
  grid-template-columns:repeat(6,minmax(0,1fr));
}

.owner-message-state{
  display:inline-flex;
  min-height:39px;
  align-items:center;
  padding:.5rem .7rem;
  border:1px solid #b8d1c4;
  background:#edf7f1;
  color:#286347;
  font-size:.68rem;
  font-weight:760;
}

.booking-confirmed-panel{
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  align-items:center;
  gap:1.5rem;
  margin:1rem 0 1.25rem;
  padding:1.2rem 1.3rem;
  border:1px solid #b7d3c4;
  border-left:4px solid #2d7654;
  background:#edf7f1;
}

.booking-confirmed-panel h2{
  margin:.15rem 0 .35rem;
  color:#214d3d;
  font-family:var(--font-sans),sans-serif;
  font-size:1.4rem;
}

.booking-confirmed-panel p{
  margin:.25rem 0;
  color:#526a60;
}

.booking-confirmed-actions{
  display:grid;
  gap:.5rem;
  min-width:180px;
}

@media(max-width:760px){
  .owner-booking-progress{
    grid-template-columns:repeat(6,120px);
  }

  .booking-confirmed-panel{
    grid-template-columns:1fr;
  }

  .booking-confirmed-actions{
    min-width:0;
  }
}
EOF

say "KPL REGRESSION TESTS"

cat > tests/booking-messaging-ui.test.mjs <<'EOF'
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("KPL uses PJ for quote delivery and exposes provider state", () => {
  const client = read("lib/pj-booking-client.mjs");
  const actions = read("app/owner/bookings/actions.ts");
  const owner = read("app/owner/bookings/page.tsx");
  const quoteActions = read("app/owner/bookings/QuoteLinkActions.tsx");

  assert.match(client, /messageStatus\(\)/);
  assert.match(client, /sendQuote\(id\)/);
  assert.match(actions, /export async function sendQuoteEmail/);
  assert.match(actions, /owner-blocked/);
  assert.match(owner, /bookingMessageStatus/);
  assert.match(owner, /Waiting for Airbnb block/);
  assert.match(owner, /quoteMessage/);
  assert.match(quoteActions, /Send quote/);
  assert.match(quoteActions, /accepted by email provider/);
  assert.doesNotMatch(quoteActions, /mailto:/);
});

test("confirmed guest experience shows payment result and Guidebook path", () => {
  const quote = read("app/book/quote/[token]/page.tsx");
  assert.match(quote, /You’re booked\./);
  assert.match(quote, /Open Guest Guide/);
  assert.match(quote, /Remaining balance:/);
});
EOF

say "KPL REAL STRIPE REHEARSAL DOC"

cat > docs/BOOKING-E2E.md <<'EOF'
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
EOF

say "KPL STAGE + CHECKSUM"

git add \
  lib/pj-booking-client.mjs \
  lib/booking-db.ts \
  app/owner/bookings/actions.ts \
  app/owner/bookings/QuoteLinkActions.tsx \
  app/owner/bookings/page.tsx \
  app/book/quote/[token]/page.tsx \
  app/a-plus.css \
  tests/booking-messaging-ui.test.mjs \
  docs/BOOKING-E2E.md

refresh_checksums
git add SHA256SUMS.txt

say "KPL INSTALL"
npm ci

say "KPL TEST"
npm run test:core

say "KPL BUILD"
npm run build

say "KPL PACKAGE VERIFICATION"
node scripts/verify-package.mjs

say "KPL COMMIT + PUSH"

git status --short
git diff --cached --stat
git commit -m "Complete governed direct booking lifecycle"
git push -u origin "$KPL_BRANCH"

KPL_PR="$(
  gh pr create \
    --repo "$KPL_REPO" \
    --base main \
    --head "$KPL_BRANCH" \
    --title "Booking: messaging, confirmation and owner loop" \
    --body "Completes the KPL side of direct-booking goals 1–4.

- owner Send Quote goes through PJ instead of a mailto draft
- KPL rechecks Airbnb before asking PJ to send
- PJ independently rechecks the Airbnb owner block
- owner console reads durable PJ provider state
- operational states become New → Quote → Airbnb → Send → Paying → Confirmed
- manual Copy link remains a safe fallback
- confirmed guest gets deposit, balance and Guest Guide next steps
- adds the real Stripe test-mode E2E rehearsal
- authoritative quote/payment math remains in PJ

This is backward-safe while PJ is deployed first: message-status failure does not break booking or Stripe payment."
)"

echo "KPL PR: $KPL_PR"

say "COMPLETE"

echo "PJ PR:"
echo "  $PJ_PR"
echo
echo "KPL PR:"
echo "  $KPL_PR"
echo
echo "Deploy order:"
echo "  1. Review + merge PJ PR"
echo "  2. Deploy PJ"
echo "  3. Configure PJ runtime:"
echo "       PJ_STAY_MESSAGING=enabled"
echo "       KPL_BOOKING_PUBLIC_BASE_URL=https://kendallpondlodge.com"
echo "       KPL_BOOKING_OWNER_EMAILS=<owner notification addresses>"
echo "  4. Confirm one authorized StayOS email sender"
echo "  5. Confirm its Google/Microsoft provider is connected"
echo "  6. Merge/deploy KPL PR"
echo "  7. Run docs/BOOKING-E2E.md with Stripe TEST mode"
echo
echo "Nothing was merged or deployed automatically."

cd "$KPL_SOURCE"
git worktree remove --force "$KPL_WORKTREE" >/dev/null 2>&1 || true
git -C "$PJ_SOURCE" worktree remove --force "$PJ_WORKTREE" >/dev/null 2>&1 || true

if [ "$PJ_TEMP_CLONE" = "1" ]; then
  rm -rf "$PJ_SOURCE"
fi

echo "✓ temp worktrees cleaned"