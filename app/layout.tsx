import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono } from "next/font/google";
import { ExperienceShell } from "./_components/ExperienceShell";
import { directBookingEnabled } from "@/lib/booking-db";
import "./globals.css";
import "./experience.css";
import "./booking.css";

const plexSans = IBM_Plex_Sans({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plexSerif = IBM_Plex_Serif({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kendallpondlodge.com"),
  title: { default: "Lodge at Kendall Pond", template: "%s · KPL" },
  description: "The Lodge at Kendall Pond: explore the property and book a stay, then use KPL Remote and the private guest Guidebook.",
  applicationName: "KPL",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#112233" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`}>
        <ExperienceShell bookEnabled={directBookingEnabled()}>{children}</ExperienceShell>
      </body>
    </html>
  );
}
