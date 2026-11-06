'use server';

import { revalidatePath } from 'next/cache';
import { guestHome } from '@/lib/guest-home.mjs';
import { requireMusicGuest } from '../audio/access';

export async function controlGuestHome(_previous: string, form: FormData): Promise<string> {
  await requireMusicGuest();
  const device = form.get('device');
  const command = form.get('command');
  if (!['speaker', 'tv', 'climate'].includes(String(device)) || typeof command !== 'string') return 'Choose a house control.';
  if (command === 'refresh') {
    revalidatePath('/guidebook', 'layout');
    return 'Status checked again.';
  }
  const raw = form.get('value');
  const value = command === 'source' ? raw : typeof raw === 'string' && /^\d{1,3}(\.5)?$/.test(raw) ? Number(raw) : NaN;
  const result = await guestHome().control(device, command, value);
  revalidatePath('/guidebook', 'layout');
  if (result === 'confirmed') return command === 'temperature' ? 'The thermostat reports the new target. The room will take time to adjust.' : 'The device reports your change.';
  if (result === 'unconfirmed') return 'The change hasn’t been confirmed. Check the device before trying again.';
  return 'That control is unavailable right now. Use the physical controls or message your host.';
}
