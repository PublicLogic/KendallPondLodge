import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  bookingClient,
  directBookingEnabled,
  publicError,
  type Booking,
} from '@/lib/booking-db';

import {
  blockedNightsFromIcs,
  fetchAirbnbIcs,
} from '@/lib/airbnb-ical.mjs';

import {
  nightsBetween,
  propertyToday,
} from '@/lib/booking.mjs';

import { requestStay } from './actions';
import { BookingSteps } from '@/app/_components/StayInformation';
import { StayRequestForm, StayRequestReceipt } from './StayRequestForm';

export const metadata: Metadata = {
  title: 'Request a stay',
  alternates: { canonical: '/book' },
  description:
    'Choose your dates and request a direct stay at the Lodge at Kendall Pond.',
};

export const dynamic = 'force-dynamic';

const airbnb =
  'https://www.airbnb.com/rooms/1667597913565948713';

const BLOCKING_DIRECT_STATUSES = new Set([
  'quoted',
  'checkout',
  'confirmed',
]);

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const enabled = directBookingEnabled();
  let instant = false;
  if (enabled) {
    try {
      instant = (await bookingClient().instantSettings())?.enabled === true;
    } catch {
      instant = false;
    }
  }
  const today = propertyToday();

  const unavailable = new Set<string>();
  let availabilityReady = enabled;

  if (enabled) {
    try {
      const ics = await fetchAirbnbIcs({ fr¶»§q«^