import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/_components/Icons";
import { InfoCard, Notice, SectionHeading } from "@/app/_components/Content";
import { PageHero } from "@/app/_components/PageHero";
import { PhotoCard } from "@/app/_components/PhotoCard";
import { StatBand } from "@/app/_components/StatBand";
import { directBookingEnabled } from "@/lib/booking-db";

export const metadata: Metadata = {
  description: "The Lodge at Kendall Pond: a private waterfront home in Gardner, Massachusetts. See the house and grounds, then reserve your stay. Already booked? Open the private guest Guidebook.",
};

const bookingUrl = process.env.NEXT_PUBLIC_KPL_BOOKING_URL?.trim() || "https://www.airbnb.com/rooms/1667597913565948713";

export default function BookingPage() {
  const directEnabled = directBookingEnabled();
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Gardner, Massachusetts"
        title="The Lodge at Kendall Pond."
        intro="A private waterfront home on a quiet pond, an hour from Boston. Come in out of the world for a while."
        image="/images/kpl/pond.jpg"
        imageAlt="Kendall Pond at golden hour"
        imagePosition="center 55%"
        primaryAction={{ href: bookingUrl, label: "Reserve on Airbnb" }}
        secondaryAction={{ href: directEnabled ? "/book" : "/lodge", label: directEnabled ? "Request direct booking" : "See the house" }}
      />

      <StatBand
        stats={[
          { value: "8", label: "Sleeps" },
          { value: "3", label: "Bedrooms" },
          { value: "2", label: "Baths" },
          { value: "4", label: "Beds" },
        ]}
      />

      <section className="content-section">
        <SectionHeading
          eyebrow="The setting"
          title="Come around the bend and the pond opens up in front of you."
          intro="Kendall Pond sits at the edge of Gardner, Massachusetts — close enough to reach from Boston in an hour, far enough that the only sound is water lapping on your private shoreline. There's a dock, there are kayaks, and the mornings are glassy and unhurried."
        />
        <div className="photo-grid photo-grid-two">
          <PhotoCard
            src="/images/kpl/waterfront-dock.jpg"
            alt="The private dock stretching onto Kendall Pond"
            title="Private dock"
            note="Yours for the whole stay"
            wide
          />
          <PhotoCard
            src="/images/kpl/pond.jpg"
            alt="Kendall Pond from the lawn"
            title="Kendall Pond"
            note="Kayaks, a beach, and quiet water"
            position="center 55%"
          />
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading
          eyebrow="The house"
          title="Built for gathering."
          intro="Two stories, about 2,240 square feet: a vaulted great room with a fireplace, an open kitchen that fits everyone around the counter, and windows that face the water from almost every room."
        />
        <div className="photo-grid">
          <PhotoCard src="/images/kpl/great-room.jpg" alt="Vaulted great room with fireplace" title="Great room" note="Vaulted ceiling, fireplace, room to spread out" wide />
          <PhotoCard src="/images/kpl/kitchen-dining.jpg" alt="Open kitchen and dining area" title="Kitchen & dining" note="Built for real meals, not takeout for two" />
          <PhotoCard src="/images/kpl/king-room.jpg" alt="King bedroom" title="King suite" note="Upper level" />
          <PhotoCard src="/images/kpl/queen-room.jpg" alt="Queen bedroom" title="Queen room" note="Upper level" />
        </div>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="Days & evenings" title="Hot tub, firepit, dock, and a shoreline that's yours alone." intro="Pets welcome." />
        <div className="info-grid info-grid-three">
          <InfoCard title="Hot tub"><p>Covered and set on the lower patio, with the pond always in view.</p></InfoCard>
          <InfoCard title="Firepit"><p>A stone firepit at the shoreline for evenings that run late.</p></InfoCard>
          <InfoCard title="Private beach & kayaks"><p>Swim, paddle, or just watch the light change over the water.</p></InfoCard>
        </div>
      </section>

      <section className="content-section surface-section">
        <SectionHeading eyebrow="Guest feedback" title="Hear from people who stayed." intro="Read current, verified guest reviews on the Airbnb listing." />
        <a href={bookingUrl} rel="noreferrer" target="_blank">Read reviews on Airbnb ↗</a>
      </section>

      <section className="content-section">
        <div className="booking-cta-panel">
          <div>
            <p className="eyebrow">Reserve the lodge</p>
            <h2>We&rsquo;d love to have you.</h2>
            <p>Check live dates and reserve on Airbnb, or request a direct quote with every charge and term shown before payment.</p>
          </div>
          <div>
            <a className="button button-primary" href={bookingUrl} rel="noreferrer" target="_blank">
              Reserve on Airbnb <Icon name="arrow" size={18} />
            </a>
            {directEnabled && <p className="booking-guest-link"><Link href="/book">Request direct booking →</Link></p>}
            <p className="booking-guest-link"><Link href="/guidebook">Already booked? Open Guidebook</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
