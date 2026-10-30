import { createHash, timingSafeEqual } from "node:crypto";

export const GUIDEBOOK_COOKIE_NAME = "kpl-guidebook-session";

// Dev-only fallbacks so `npm run dev` works out of the box without any local
// secrets. These values are public (checked into source) and MUST NEVER be
// used in production — see getCodeHash()/getSessionToken() below, which throw
// instead of falling back once NODE_ENV === "production". This keeps the
// guidebook gate fail-closed: a missing production secret blocks access
// rather than silently accepting a well-known bypass value.
const DEV_ONLY_CODE_HASH = "b44ccb21a392e630ec13c35a3033e23eb3a94f2cc8587e58c9555a7f4f88fe79";
const DEV_ONLY_SESSION_TOKEN = "335e16d7cd40d0177b2b2038363b097a34148232b9b05210dfd15cba37e6fba6";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

/**
 * A configuration error thrown when a required production secret is
 * missing. Callers should treat this as "deny access", not "let it crash".
 */
export class GuidebookConfigError extends Error {
  constructor(envVarName) {
    super(`${envVarName} must be set in production for the Guidebook gate to work.`);
    this.name = "GuidebookConfigError";
  }
}

export function getCodeHash() {
  const configured = process.env.KPL_GUIDEBOOK_CODE_HASH?.trim();
  if (configured) return configured;
  if (isProduction()) throw new GuidebookConfigError("KPL_GUIDEBOOK_CODE_HASH");
  return DEV_ONLY_CODE_HASH;
}

export function getSessionToken() {
  const configured = process.env.KPL_GUIDEBOOK_SESSION_TOKEN?.trim();
  if (configured) return configured;
  if (isProduction()) throw new GuidebookConfigError("KPL_GUIDEBOOK_SESSION_TOKEN");
  return DEV_ONLY_SESSION_TOKEN;
}

function timingSafeStringEqual(a, b) {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

/** Hashes a guest-entered code the same way the configured hash was produced. */
export function hashGuestCode(code) {
  return createHash("sha256").update(code, "utf8").digest("hex");
}

/** Verifies a guest-entered code against the configured (or dev-only) hash. */
export function verifyGuestCode(code) {
  return timingSafeStringEqual(hashGuestCode(code), getCodeHash());
}

/** Verifies a session cookie value against the configured (or dev-only) token. */
export function verifySessionToken(token) {
  if (!token) return false;
  return timingSafeStringEqual(token, getSessionToken());
}
