import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OWNER_COOKIE_NAME, verifyOwnerSessionToken } from './owner-auth.mjs';
/** Defense in depth: protected pages check the session as well as Next's proxy. */
export async function requireKplOwner(next = '/owner') {
  let authorized = false;
  try { authorized = verifyOwnerSessionToken((await cookies()).get(OWNER_COOKIE_NAME)?.value); } catch { /* deny */ }
  if (!authorized) redirect(`/owner/access?next=${encodeURIComponent(next)}`);
}
