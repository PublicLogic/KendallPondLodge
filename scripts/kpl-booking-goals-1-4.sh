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