import type { Metadata } from "next";
import { GuestHouse } from '../../_components/GuestHouse';
import { HouseGuide } from '@/app/_components/HouseGuide';

export const metadata: Metadata = { title: "House · Guidebook", robots: { index: false, follow: false } };
export default function HousePage() {
  return <><GuestHouse /><HouseGuide privateGuide /></>;
}
