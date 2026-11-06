import type { ReactNode } from "react";
import { HouseAudio } from "@/app/_components/HouseAudio";
import { Notice } from "@/app/_components/Content";

export function AudioGuide({ children }: { children?: ReactNode }) {
  return (
    <div className="guide-section-page">
      <header className="guide-section-header">
        <p className="guide-dashboard-eyebrow">Music &amp; sound</p>
        <h2>Put on something you like.</h2>
        <p>
          To play music through a house speaker, pair it in your phone or
          computer&apos;s Bluetooth settings. You can use your usual music app,
          or play an audio file from your device below.
        </p>
      </header>

      <section className="guide-section-stack">
        {children}
        <HouseAudio />
        <Notice tone="warm">
          <strong>Not hearing anything?</strong> Check that Bluetooth is
          connected and the volume is up. Send us a message through your
          reservation if you need a hand.
        </Notice>
      </section>
    </div>
  );
}

