import Image from "next/image";

export function BookingBrand({ owner = false }: { owner?: boolean }) {
  return (
    <div className={`booking-brand ${owner ? "booking-brand-owner" : ""}`}>
      <Image
        src={owner ? "/brand/stay/puddlejumper-beta.png" : "/brand/stay/puddlejumper-stay.png"}
        width={owner ? 1488 : 401}
        height={owner ? 342 : 422}
        alt={owner ? "PuddleJumper Beta" : "PuddleJumper STAY"}
      />
      {!owner && <small>STAY booking · By PublicLogic</small>}
    </div>
  );
}
