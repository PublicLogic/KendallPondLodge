import type { Metadata } from 'next';
import { GuestHouse } from '../../_components/GuestHouse';
export const metadata: Metadata = { title: 'House controls · Guidebook', robots: { index: false, follow: false } };
export default async function HousePage({ searchParams }: { searchParams: Promise<{ control?: string }> }) {
  const params = await searchParams;
  return <GuestHouse control={params.control} />;
}
