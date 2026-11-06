import type { Metadata } from "next";
import { AudioGuide } from "@/app/_components/AudioGuide";

export const metadata: Metadata = {
  title: "Music at the Lodge",
  description: "How to connect to the Lodge speaker and play your music.",
};

export default function AudioPage() {
  return <AudioGuide />;
}
