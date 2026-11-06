import type { Metadata } from 'next';
import { HouseGuide } from '@/app/_components/HouseGuide';
export const metadata: Metadata = { title: 'House', description: 'House essentials, comfort, kitchen, and entertainment guidance.' };
export default function HousePage() { return <HouseGuide />; }
