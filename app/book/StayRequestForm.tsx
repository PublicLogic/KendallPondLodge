'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { BookingBrand } from '@/app/_components/BookingBrand';
import { clearGuestRequestKey, createGuestRequestKeyManager } from '@/lib/guest-request-key.mjs';

type ServerAction = (formData: FormData) => Promise<{ received: true; instant_path?: string }>;

type Props = {
  action: ServerAction;
  unavailableDates: string[];
  today: string;
  availabilityReady: boolean;
  initialError?: string;
  instant?: boolean;
};

type Month = {
  year: number;
  month: number;
};

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function StayRequestReceipt({ onNewRequest }: { onNewRequest?: () => void }) {
  return (
    <div>
      <p className="booking-alert" role="status">
        Request received. Sending a request does not reserve the dates or charge you.
      </p>
      <p>Weâ€™ll review your dates and send the full quote before you pay.</p>
      <Link className="button button-secondary" href="/book" onClick={onNewRequest}>Request another stay</Link>
    </div>
  );
}

function RequestSubmit({ ready, nights, instant }: { ready: boolean; nights: number; instant: boolean }) {
  const { pending } = useFormStatus();

  return (
    <div className="booking-submit-row stay-submit-row">
      <button
        className="button button-primary"
        disabled={!ready || pending}
        type="submit"
      >
        {pend¶»§q«^