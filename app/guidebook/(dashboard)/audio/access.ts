import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { GUIDEBOOK_COOKIE_NAME, verifySessionToken } from '@/lib/guidebook-auth.mjs';

export async function requireMusicGuest() {
  let authorized = false;
  try {
    authorized = verifySessionToken((await cookies()).get(GUIDEBOOK_COOKIE_NAME)?.value);
  } catch {
    // Missing session configuration denies access.
  }
  if (!authorized) redirect('/guidebook/access?next=%2Fguidebook%2Faudio');
}
