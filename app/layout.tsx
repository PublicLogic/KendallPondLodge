import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ExperienceShell } from "./_components/ExperienceShell";
import { directBookingEnabled } from "@/lib/booking-db";
import "./globals.css";
import "./experience.css";
import "./booking.css";

const plexSans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

const plexSerif = localFont({
  variable: "--font-serif",
  display: "swap",
  src: [
    { path: "./fonts/ibm-plex-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/ibm-plex-serif-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-serif-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

const plexMono = localFont({
  variable: "--font-mono",
  display: "swap",
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kendallpondlodge.com"),
  title: { default: "Lodge at Kendall Pond", template: "%s · KPL" },
  description:
    "A private waterfront lodge on Kendall Pond in Gardner, Massachusetts. Explore the property, request a stay, and use the private guest Guidebook after booking.",
  applicationName: "The Lodge at Kendall Pond",
  icons: {
    icon: [{ url: "/images/kpl/lodge-seal.png", type: "image/png" }],
    shortcut: ["/images/kpl/lodge-seal.png"],
    apple: [{ url: "/images/kpl/lodge-seal.png", type: "image/png" }],
  },
  openGraph: {
    title: "The Lodge at Kendall Pond",
    description:
      "Lakefront on Kendall Pond in Gardner, Massachusetts — hot tub, firepit, private dock, kayaks, and room for up to eight.",
    url: "https://kendallpondlodge.com",
    siteName: "The Lodge at Kendall Pond",
    images: [
      {
        url: "/images/kpl/pond-seating.jpg",
        width: 1200,
        height: 900,
        alt: "The Lodge at Kendall Pond overlooking the water",
      },
    ],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f0e8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`}>
        <ExperienceShell bookEnabled={directBookingEnabled()}>
          {children}
        </ExperienceShell>
      </body>
    </html>
  );
}
