import type { Metadata } from "next";
import { HouseAudio } from "@/app/_components/HouseAudio";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { Icon } from "@/app/_components/Icons";

export const metadata: Metadata = { title: "House Audio & Devices", description: "Play local audio through an already-paired house speaker, and see which house devices are connected." };

const pendingControls = [
  { icon: "home", title: "Comfort", note: "Thermostat control is coming soon." },
  { icon: "tools", title: "Television", note: "Roku control is coming soon." },
  { icon: "shield", title: "Locks & security", note: "Not available in the guest app." },
  { icon: "outside", title: "Lighting", note: "Coming soon." },
];

export default function AudioPage() {
  return (
    <div className="guide-section-page">
      <header className="guide-section-header">
        <p className="guide-dashboard-eyebrow">House audio & devices</p>
        <h2>Your audio. The house speaker.</h2>
        <p>Pair the speaker in this device’s Bluetooth settings, choose it as the output, and play a file already on this phone or computer.</p>
      </header>

      <section className="guide-section-stack">
        <HouseAudio />
        <Notice tone="warm"><strong>Alexa for now; speaker-neutral later.</strong> If an Echo is paired as the Bluetooth audio output, this page can play local audio through it. KPL does not sign in to Amazon or issue Alexa cloud commands, so another compatible speaker can replace it later.</Notice>
      </section>

      <section className="guide-section-stack guide-section-surface">
        <SectionHeading eyebrow="What this can do today" title="A clear, local handoff." />
        <div className="capability-summary">
          <div><span className="status status-live">Available</span><strong>Choose an audio file</strong><p>Playback begins in this browser. The file is not uploaded.</p></div>
          <div><span className="status status-live">When supported</span><strong>Select an output</strong><p>Chrome-family browsers can offer an already-paired output picker.</p></div>
          <div><span className="status status-local">Device setting</span><strong>Pair Bluetooth</strong><p>Pairing itself happens in the phone or computer Bluetooth settings, not on a webpage.</p></div>
        </div>
      </section>

      <section className="guide-section-stack">
        <SectionHeading eyebrow="More devices" title="What's connected, and what's coming." intro="House audio is live today. More property devices connect over time." />
        <div className="remote-control-grid">
          {pendingControls.map((control) => (
            <article className="remote-control-card remote-control-card-offline" role="group" aria-disabled="true" key={control.title}>
              <span className="remote-card-status remote-card-status-offline">Coming soon</span>
              <span className="icon-chip"><Icon name={control.icon} /></span>
              <h3>{control.title}</h3>
              <p>{control.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section-stack guide-section-surface">
        <SectionHeading eyebrow="How it works" title="Simple, secure, and built for guests." />
        <div className="info-grid info-grid-three">
          <InfoCard title="1. Booking & Guidebook"><p>Public booking and your private Guidebook run here, with no property credentials ever exposed in the browser.</p></InfoCard>
          <InfoCard title="2. On-site connection"><p>A secure on-site connection talks to approved property devices and returns only the status you need.</p></InfoCard>
          <InfoCard title="3. Guest-ready controls"><p>Only tested, approved controls appear here. Security and camera administration stay out of the guest app.</p></InfoCard>
        </div>
      </section>
    </div>
  );
}
