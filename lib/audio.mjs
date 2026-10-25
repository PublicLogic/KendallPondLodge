export const AUDIO_HELP =
  "speaker · load · play · pause · stop · volume 0-100 · mute · unmute · status · clear · help";

const aliases = new Map([
  ["connect", "speaker"],
  ["pair", "speaker"],
  ["open", "load"],
  ["vol", "volume"],
]);

export function parseAudioCommand(value = "") {
  const input = value.trim();
  if (!input) {
    return { type: "error", message: "Type help to see the available commands." };
  }

  const [rawName, ...parts] = input.split(/\s+/);
  const name = aliases.get(rawName.toLowerCase()) || rawName.toLowerCase();

  if (name === "volume") {
    const level = Number(parts[0]);
    if (!Number.isFinite(level) || level < 0 || level > 100) {
      return { type: "error", message: "Volume must be a number from 0 to 100." };
    }
    return { type: "command", name, level: Math.round(level) };
  }

  if (
    [
      "speaker",
      "load",
      "play",
      "pause",
      "stop",
      "mute",
      "unmute",
      "status",
      "clear",
      "help",
    ].includes(name)
  ) {
    return { type: "command", name };
  }

  return {
    type: "error",
    message: `Unknown command: ${rawName}. Type help for the command list.`,
  };
}

export function audioStatus({
  fileName = "No audio selected",
  outputName = "System default",
  paused = true,
  volume = 1,
  muted = false,
} = {}) {
  const state = paused ? "Paused" : "Playing";
  const level = muted ? "muted" : `${Math.round(volume * 100)}%`;
  return `${state} · ${level} · ${outputName} · ${fileName}`;
}
