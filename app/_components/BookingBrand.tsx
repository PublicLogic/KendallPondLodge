import Image from 'next/image';
/** Approved artwork, unchanged. KPL remains the guest-facing identity. */
export function BookingBrand({ owner = false }: { owner?: boolean }) {
  return <div className={`booking-brand ${owner ? 'booking-brand-owner' : ''}`}>
    <Image src={owner ? '/brand/stay/puddlejumper-beta.png' : '/brand/stay/puddlejumper-stay.png'}
      width={owner ? 1488 : 401} height={owner ? 342 : 422}
      alt={owner ? 'PuddleJumper Beta' : 'PuddleJumper STAY — Lodging and hospitality'}
      style={{ width: owner ? 300 : 160, maxWidth: '100%', height: 'auto' }} />
    <p>{owner ? 'Lodge at Kendall Pond · Owner controls' : 'Booking powered by PuddleJumper STAY'}<br /><span>By PublicLogic · Systems that stick.</span></p>
  </div>;
}
