'use server';

import { revalidatePath } from 'next/cache';
import { homeAssistantMusic } from '@/lib/home-assistant-music.mjs';
import { requireMusicGuest } from './access';

export async function controlLodgeMusic(_previous: string, form: FormData): Promise<string> {
  await requireMusicGuest();
  const command = form.get('command');
  if (command === 'refresh') {
    revalidatePath('/guidebook/audio');
    return '';
  }
  if (command !== 'start' && command !== 'play' && command !== 'pause' && command !== 'volume') {
    return 'Choose a music control.';
  }
  const rawVolume = form.get('volume');
  const volume = typeof rawVolume === 'string' && /^\d{1,2}$/.test(rawVolume) ? Number(rawVolume) : NaN;

  let confirmed = false;
  try {
    const music = homeAssistantMusic();
    if (!music) return 'The Lodge speaker is unavailable.';
    confirmed = await music.control(command, volume);
  } catch {
    // A hub request may fail after accepting a command. Refresh its reported state.
  }
  revalidatePath('/guidebook/audio');
  if (!confirmed) return 'The speaker hasn’t confirmed the requested change. Check its status and try again.';
  if (command === 'start') return 'The speaker reports that music is playing.';
  if (command === 'pause') return 'The speaker reports that playback is paused.';
  if (command === 'volume') return `The speaker reports volume at ${volume}%.`;
  return 'The speaker reports that playback resumed.';
}
