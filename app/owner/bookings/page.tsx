import type { Metadata } from "next";
import Link from "next/link";

import {
  bookingAttention,
  bookingConfigured,
  bookingDb,
  bookingMessageStatus,
  bookingClient,
  publicError,
  type Booking,
  type BookingAttention,
  type BookingMessageState,
  type BookingMessagingStatus,
  usd,
} from "@/lib/booking-db";

import {
  nightsBetween,
  quoteHasPaymentWindow,
} from "@/lib/booking.mjs";

import {
  airbnbStayStatus,
  fetchAirbnbIcs,
} from "@/lib/airbnb-ical.mjs";

import { requireKplOwner } from "@/lib/require-kpl-owner";

import {
  issueQuote,
  autoPriceRequest,
  releaseQuote,
  resolvePaymentProblem,
} from "./actions";

import { QuoteLinkActions } from "./QuoteLinkActions";

export const metadata: Metadata = {
  title: "Direct bookings",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const legacyWorkflow = ["New", "Quote", "Airbnb", "Send", "Paying", "Confirmed"] as const;
const instantWorkflow = ["New", "Held", "Paying", "Confirmed"] as const;

function quoteSent(
  message: BookingMessageState | null | undefined,
) {
  return (
    message?.status === "sent" &&
    message.provider_accepted === true
  );
}

function statusLabel(
  request: Booking,
  stayStatus: string | null,
  quoteMessage: BookingMessageState | null | undefined,
  instant = false,
) {
  if (request.status === "requested") return "New";

  if (request.status === "quoted") {
    if (instant) return "Held";
    if (stayStatus !== "owner¶»§q«^