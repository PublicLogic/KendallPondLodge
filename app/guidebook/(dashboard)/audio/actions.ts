'use server';

import { controlGuestHome } from '../house/actions';

// Legacy controls must pass through the same stay policy as the house page.
export async function controlLodgeMusic(previous: string, form: FormData): Promise<string> {
  const next = new FormData();
  next.set('device', 'speaker');
  next.set('command', String(form.get('command') ?? ''));
  next.set('value', String(form.get('volume') ?? ''));
  return controlGuestHome(previous, next);
}
