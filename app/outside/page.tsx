import type { Metadata } from "next";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PhotoCard } from "@/app/_components/PhotoCard";

export const metadata: Metadata = { title: "Outside", description: "Hot tub, fire pit, pool, and outdoor-area guidance." };

export default function OutsidePage() {
  return (
    <div className="guide-section-page">
      <header className="guide-section-header">
        <p className="guide-dashboard-eyebrow">Outside</p>
        <h2>Relax outside. Reset it when you are done.</h2>
        <p>Hot tub, fire pit, pool, lawn, and neighbor guidance — kept compact so the important safety points stay easy to scan.</p>
      </header>

      <section className="guide-section-stack" id="hot-tub">
        <SectionHeading eyebrow="Hot tub" title="Start clean. Use the normal controls." intro="Replace and secure the cover after use. Contact the hosts if a warning, low water, unusual sound, or unsafe condition appears." />
        <div className="do-dont">
          <div><h3>Do</h3><ul><li>Shower off lotions, dirt, and sand first.</li><li>Replace and secure the cover after use.</li><li>Keep children directly supervised.</li><li>Message the hosts about warnings or unusual conditions.</li></ul></div>
          <div><h3>Do not</h3><ul><li>Force controls, caps, jets, or valves.</li><li>Add soap, oils, bath products, or chemicals.</li><li>Sit or place heavy objects on the cover.</li><li>Use the tub if the water looks unsafe.</li></ul></div>
        </div>
      </section>

      <section className="guide-section-stack guide-section-surface" id="fire-pit">
        <SectionHeading eyebrow="Outdoor areas" title="Fire, pool, and neighbors." />
        <div className="split-section split-section-photo-first">
          <PhotoCard src="/images/kpl/firepit.jpg" alt="Stone fire pit circle between the lodge and Kendall Pond" title="Shoreline fire pit" note="Extinguish every fire fully" wide />
          <div className="stacked-cards">
            <InfoCard title="Fire pit"><p>Use it only when conditions and local rules allow. Keep water nearby, supervise continuously, and extinguish fully. Fireworks are not permitted.</p></InfoCard>
            <InfoCard id="pool" title="Pool"><p>Use it only when available for your stay. No diving, glass, or unsupervised children. Follow all posted instructions.</p></InfoCard>
            <InfoCard title="Neighbors"><p>Sound carries across water. Keep gatherings within the registered guest count and follow the quiet hours in your booking rules.</p></InfoCard>
          </div>
        </div>
        <Notice tone="warm"><strong>Before going inside:</strong> Secure outdoor gear, replace the hot-tub cover, extinguish the fire, remove glass, and leave clear paths around the house.</Notice>
      </section>
    </div>
  );
}
