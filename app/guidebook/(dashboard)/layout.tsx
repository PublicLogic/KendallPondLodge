import type { ReactNode } from 'react';
import { GuidebookShell } from '../_components/GuidebookShell';
import { requireMusicGuest } from './audio/access';
import '../guestbook.css';
import { ControlDashboard } from '../_components/ControlDashboard';
import { guestHome } from '@/lib/guest-home.mjs';

export const metadata = { robots: { index: false, follow: false } };

export default async function GuidebookDashboardLayout({ children }: { children: ReactNode }) {
  await requireMusicGuest();
  const home = await guestHome().snapshot();
  return <GuidebookShell dashboard={<ControlDashboard home={home} network={process.env.KPL_GUEST_WIFI_SSID ?? ''} />}>{children}</GuidebookShell>;
}
