import { NextRequest, NextResponse } from "next/server";
import { GUIDEBOOK_COOKIE_NAME, GuidebookConfigError, verifySessionToken } from "@/lib/guidebook-auth.mjs";
import { OWNER_COOKIE_NAME, OwnerConfigError, verifyOwnerSessionToken } from "@/lib/owner-auth.mjs";

const legacyRedirects: Record<string, string> = {
  "/house-guide": "/guidebook",
  // "House Guide" nav now opens the coded Guidebook directly, not the
  // separate pre-booking policy page that used to live at /guide.
  "/guide": "/guidebook",
  "/help": "/guidebook",
  "/arrival": "/guidebook/arrival",
  "/house": "/guidebook/house",
  "/waterfront": "/guidebook/waterfront",
  "/outside": "/guidebook/outside",
  "/audio": "/guidebook/audio",
  "/checkout": "/guidebook/checkout",
  // Booking became the homepage; keep the old URL working for anyone with it bookmarked.
  "/booking": "/",
  // Remote merged into Audio & Devices inside the coded Guidebook.
  "/remote": "/guidebook/audio",
  "/tools": "/guidebook/audio",
  "/guidebook/remote": "/guidebook/audio",
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const legacyDestination = legacyRedirects[pathname];

  if (legacyDestination) {
    const destination = request.nextUrl.clone();
    destination.pathname = legacyDestination;
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination);
  }

  if (pathname === "/guidebook/access" || pathname.startsWith("/guidebook/access/")) {
    return NextResponse.next();
  }

  if (pathname === "/owner/access" || pathname.startsWith("/owner/access/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/owner")) {
    const session = request.cookies.get(OWNER_COOKIE_NAME)?.value;
    try {
      if (verifyOwnerSessionToken(session)) return NextResponse.next();
    } catch (error) {
      if (error instanceof OwnerConfigError) {
        return new NextResponse(
          "Owner sign-in is temporarily unavailable due to a server configuration issue.",
          { status: 503, headers: { "Content-Type": "text/plain" } },
        );
      }
      throw error;
    }

    const accessUrl = request.nextUrl.clone();
    accessUrl.pathname = "/owner/access";
    accessUrl.search = "";
    accessUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(accessUrl);
  }

  if (pathname.startsWith("/guidebook")) {
    const session = request.cookies.get(GUIDEBOOK_COOKIE_NAME)?.value;
    try {
      if (verifySessionToken(session)) return NextResponse.next();
    } catch (error) {
      // Fail closed: a missing production secret must block the Guidebook,
      // never fall back to a bypassable default baked into public source.
      if (error instanceof GuidebookConfigError) {
        return new NextResponse(
          "The Guidebook is temporarily unavailable due to a server configuration issue. Please contact the hosts.",
          { status: 503, headers: { "Content-Type": "text/plain" } },
        );
      }
      throw error;
    }

    const accessUrl = request.nextUrl.clone();
    accessUrl.pathname = "/guidebook/access";
    accessUrl.search = "";
    accessUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(accessUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/guidebook/:path*",
    "/owner/:path*",
    "/house-guide",
    "/guide",
    "/help",
    "/arrival/:path*",
    "/house/:path*",
    "/waterfront/:path*",
    "/outside/:path*",
    "/audio/:path*",
    "/checkout/:path*",
    "/booking",
    "/remote",
    "/tools",
  ],
};
