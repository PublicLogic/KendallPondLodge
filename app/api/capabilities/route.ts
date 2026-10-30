const capabilities = {
  version: "2.0",
  product: "KPL",
  experiences: [
    { id: "booking", path: "/", state: "available", access: "public" },
    { id: "guidebook", path: "/guidebook", state: "available", access: "stay-code" },
    { id: "audio", path: "/guidebook/audio", state: "available", access: "stay-code" },
  ],
  availableNow: [
    { id: "guidebook", label: "Private Guidebook", state: "available" },
    { id: "kendall", label: "Ask Kendall guide search", state: "available" },
    { id: "browser-audio", label: "Browser-local audio", state: "available" },
  ],
  propertyBridge: {
    state: "not-installed",
    runtime: "PuddleJumper",
    controls: ["television", "thermostat", "lighting", "locks", "cameras", "network-speakers"],
  },
  privacy: {
    storesQuestions: false,
    uploadsGuestAudio: false,
    exposesStayCredentialsOnBooking: false,
    simulatesDeviceState: false,
  },
};

export function GET() {
  return Response.json(capabilities, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
