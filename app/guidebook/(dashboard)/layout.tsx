import type { ReactNode } from 'react';
import { GuidebookShell } from '../_components/GuidebookShell';
import { requireMusicGuest } from './audio/access';
import '../guestbook.css';

export const metadata = { robots: { index: false, follow: false } };

export default async function GuidebookDashboardLayout({ children }: { children: ReactNode }) {
  await requireMusicGuest();
  return <GuidebookShell>{children}</GuidebookShell>;
}
