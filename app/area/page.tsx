import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";

export const metadata: Metadata = {
  title: "The Area",
  description: "Wachusett Mountain, downtown Gardner, and easy access to Boston.",
};

export default function AreaPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Beyond the pond"
        title="The Area."
        intro="Wachusett Mountain, downtown Gardner, and easy access to Boston — close enough for a change of scenery, far enough for a real weekend away."
        image="/images/kpl/pond.jpg"
        imageAlt="Kendall Pond viewed from the lodge shoreline"
        imagePosition="center 55%"
        primaryAction={{ href: "/lodge", label: "See the house" }}
        secondaryAction={{ href: "/rates", label: "Check rates" }}
      />

      <section className="content-section">
        <SectionHeading eyebrow="Around Gardner" title="What's nearby" />
        <div className="info-grid info-grid-three">
          <InfoCard title="Wachusett Mountain">
            <p>About 15 minutes away. Skiing in winter, hiking when the snow is gone, and an easy answer if the group wants a day outside without turning it into a road trip.</p>
          </InfoCard>
          <InfoCard title="Gardner">
            <p>A practical home base for local dining, errands, coffee, groceries, and the kind of small-town wandering that doesn&apos;t need an itinerary to justify itself.</p>
          </InfoCard>
          <InfoCard title="Boston access">
            <p>Close enough for a day trip if you want the city. Far enough that coming back here still feels like leaving something behind.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="The year at Kendall Pond" title="The pond through the seasons." />
        <div className="info-grid info-grid-two">
          <InfoCard title="Summer (Jun–Aug)">
            <p>Swimming off the beach, kayaks on the water, long dinners that drift outside, and evenings that usually end at the firepit because nobody is in a rush to go in.</p>
          </InfoCard>
          <InfoCard title="Foliage (Sep–Oct)">
            <p>This part of Massachusetts turns early. The light gets sharper, the air gets better, and foliage weekends tend to book first for a reason.</p>
          </InfoCard>
          <InfoCard title="Winter (Nov–Mar)">
            <p>Wachusett offers skiing in winter. Ask the hosts about current house and hot tub details for your dates before planning a cold-weather stay.</p>
          </InfoCard>
          <InfoCard title="Ice-out (Apr–May)">
            <p>The ice goes out in early spring. The pond stays quiet, the rates are often better, and the loons come back before summer starts making noise again.</p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="Before you book" title="A few useful answers." />
        <div className="faq-list">
          <details>
            <summary>Where do I check exact availability?</summary>
            <p>
              Real-time dates and pricing live on the Airbnb listing, linked from the <Link href="/rates">Rates page</Link>. That&apos;s the source of truth.
            </p>
          </details>
          <details>
            <summary>Can I bring my dog?</summary>
            <p>Yes, up to two pets are welcome under the current listing rules. Include them in your booking request so the quote can show any pet fee.</p>
          </details>
          <details>
            <summary>Is the waterfront private?</summary>
            <p>Yes. The lodge includes private beach and dock access on Kendall Pond.</p>
          </details>
          <details>
            <summary>Do you host event guests?</summary>
            <p>
              Yes. If you&apos;re in town for a wedding, reunion, or similar gathering, see the <Link href="/events">Events page</Link>.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
