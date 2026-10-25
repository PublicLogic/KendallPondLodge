import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { StatBand } from "@/app/_components/StatBand";

export const metadata: Metadata = {
  title: "Inside the Lodge",
  description:
    "Inside the Lodge at Kendall Pond: cathedral ceilings, two fireplaces, an open kitchen, three bedrooms, two full baths, and flexible sleeping space for up to eight guests.",
};

export default function LodgePage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Inside the house"
        title="Inside the Lodge."
        intro="A lake house built for being together: cathedral ceilings, two fireplaces, an open kitchen, three bedrooms, two full baths, and enough room for a full group to spread out."
        image="/images/kpl/great-room.jpg"
        imageAlt="Cathedral-ceiling great room at the Lodge at Kendall Pond"
        imagePosition="center"
        primaryAction={{ href: "/book", label: "Book your stay" }}
        secondaryAction={{ href: "/grounds", label: "See the waterfront" }}
      />

      <StatBand
        stats={[
          { value: "8", label: "Guests" },
          { value: "3", label: "Bedrooms" },
          { value: "2", label: "Full baths" },
          { value: "2", label: "Fireplaces" },
        ]}
      />

      <section className="content-section">
        <SectionHeading
          eyebrow="The main level"
          title="The kitchen and great room do the heavy lifting."
          intro="This is where the house feels biggest: the open kitchen, dining area, cathedral-ceiling great room, fireplace, and big windows all work as one shared space."
        />

        <div className="photo-grid photo-grid-two">
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="The Lodge great room with cathedral ceiling and fireplace"
            title="Great room"
            note="Cathedral ceiling, fireplace, and plenty of seating"
            wide
          />
          <PhotoCard
            src="/images/kpl/kitchen-dining.jpg"
            alt="Open kitchen and dining area at the Lodge"
            title="Kitchen & dining"
            note="Open to the main living space for shared meals"
          />
        </div>

        <div className="info-grid info-grid-three lodge-overview-grid">
          <InfoCard title="Cook together">
            <p>
              The kitchen is part of the gathering space, so nobody disappears
              from the weekend just because they are making dinner.
            </p>
          </InfoCard>
          <InfoCard title="Spread out">
            <p>
              The main room has enough seating for a full house, with the pond
              still visible beyond the windows and deck.
            </p>
          </InfoCard>
          <InfoCard title="Two levels">
            <p>
              The lower level gives the group another place to land and opens
              directly to the patio, hot tub, lawn, and water.
            </p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading
          eyebrow="Sleeping"
          title="Three bedrooms, plus flexible space."
          intro="For larger groups, tell us who is coming when you request your stay. We can help make sure the sleeping setup fits before you book."
        />

        <div className="photo-grid">
          <PhotoCard
            src="/images/kpl/king-room.jpg"
            alt="King bedroom at the Lodge"
            title="King room"
            note="A proper bedroom for settling in"
          />
          <PhotoCard
            src="/images/kpl/queen-room.jpg"
            alt="Queen bedroom at the Lodge"
            title="Queen room"
            note="Bright guest room with a queen bed"
          />
          <PhotoCard
            src="/images/kpl/bunk-room.jpg"
            alt="Twin-over-full bunk room at the Lodge"
            title="Bunk room"
            note="Twin over full"
          />
          <PhotoCard
            src="/images/kpl/great-room.jpg"
            alt="Shared living space at the Lodge"
            title="Extra sleeping space"
            note="Queen pull-out plus additional lounge space"
            wide
          />
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="How the house works"
          title="Comfortable for a group without feeling overbuilt."
        />
        <div className="info-grid info-grid-two">
          <InfoCard title="Two full bathrooms">
            <p>
              Two full baths keep mornings and wedding-weekend getting-ready
              from turning into a single-file operation.
            </p>
          </InfoCard>
          <InfoCard title="Fireplaces on both levels">
            <p>
              The Lodge has two fireplaces, which helps the house feel like a
              lake house even when the weather turns colder.
            </p>
          </InfoCard>
          <InfoCard title="Deck above, patio below">
            <p>
              Upstairs opens toward the deck; downstairs walks out to the patio,
              hot tub, lawn, firepit, and shoreline.
            </p>
          </InfoCard>
          <InfoCard title="Laundry & practical space">
            <p>
              The house is set up for real stays, not just pretty photos:
              kitchen, laundry, storage, and places to actually put your things.
            </p>
          </InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Ready to come up?</p>
            <h2>Send us your dates.</h2>
            <p>
              We will check the calendar and send a complete direct quote with
              the price and terms before you pay.
            </p>
          </div>
          <div>
            <Link className="button button-primary" href="/book">
              Book your stay →
            </Link>
            <p className="booking-guest-link">
              <Link href="/grounds">See the waterfront first</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="content-section">
        <Notice tone="plain">
          Already booked? The private <Link href="/guidebook">Guest Guide</Link>
          {" "}has arrival, house, waterfront, and checkout details for your stay.
        </Notice>
      </section>
    </main>
  );
}
