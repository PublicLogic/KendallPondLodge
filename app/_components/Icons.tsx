type IconName =
  | "home"
  | "arrival"
  | "house"
  | "water"
  | "outside"
  | "audio"
  | "checkout"
  | "help"
  | "arrow"
  | "shield"
  | "tools";

export function Icon({ name, size = 22 }: { name: IconName | string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "arrival") {
    return <svg {...common}><path d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-6h6v6" /><path d="M17 7h3v5" /></svg>;
  }
  if (name === "house") {
    return <svg {...common}><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>;
  }
  if (name === "water") {
    return <svg {...common}><path d="M2 8c3-2 5 2 8 0s5 2 8 0 4 0 4 0M2 13c3-2 5 2 8 0s5 2 8 0 4 0 4 0M2 18c3-2 5 2 8 0s5 2 8 0 4 0 4 0" /></svg>;
  }
  if (name === "outside") {
    return <svg {...common}><path d="M12 3c-2 3-4 5-4 8a4 4 0 0 0 8 0c0-2-1-4-2-5 0 3-2 4-2 4 0-3 0-5 0-7Z" /><path d="M5 21h14" /></svg>;
  }
  if (name === "audio") {
    return <svg {...common}><path d="M5 9v6h4l5 4V5L9 9H5Z" /><path d="M17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" /></svg>;
  }
  if (name === "checkout") {
    return <svg {...common}><path d="M4 4h12v16H4zM8 8h4M8 12h4" /><path d="m14 16 2 2 4-5" /></svg>;
  }
  if (name === "help") {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.3 2.3 0 1 1 3.2 2.1c-.8.4-1 1-1 1.9M12 17h.01" /></svg>;
  }
  if (name === "arrow") {
    return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5" /></svg>;
  }
  if (name === "shield") {
    return <svg {...common}><path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
  }
  if (name === "tools") {
    return <svg {...common}><path d="m14 6 4-4 4 4-4 4" /><path d="m16 8-9 9" /><path d="M7 13 2 18v4h4l5-5" /></svg>;
  }
  return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>;
}
