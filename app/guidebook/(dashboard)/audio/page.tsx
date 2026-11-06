import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Your Music · Guidebook', robots: { index: false, follow: false } };
export default function GuestbookAudioPage() {
  return <section className="gb-section"><h2>Take it to the speakers.</h2><p>Once your phone is connected, keep choosing songs in your own app. Check the house page for connected speaker controls.</p><Link className="gb-button" href="/guidebook/house#house-controls">Open house controls ↗</Link></section>;
}
