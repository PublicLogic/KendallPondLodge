"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  OWNER_COOKIE_NAME,
  OWNER_SESSION_TTL_SECONDS,
  OwnerConfigError,
  getOwnerSessionToken,
  verifyOwnerCode,
} from "@/lib/owner-auth.mjs";

function safeNext(value: FormDataEntryValue | null): string {
  const candidate = typeof value === "string" ? value : "/owner";
  return /^\/owner(?:\/|\?|$)/.test(candidate) && !/[\\\r\n]/.test(candidate) ? candidate : "/owner";
}

export async function unlockOwner(formData: FormData): Promise<void> {
  const nextPath = safeNext(formData.get("next"));
  const code = String(formData.get("code") ?? "").trim();

  let valid: boolean;
  try {
    valid = verifyOwnerCode(code);
  } catch (error) {
    if (error instanceof OwnerConfigError) {
      redirect(`/owner/access?error=config&next=${encodeURIComponent(nextPath)}`);
    }
    throw error;
  }

  if (!valid) {
    redirect(`/owner/access?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  const store = await cookies();
  store.set(OWNER_COOKIE_NAME, getOwnerSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OWNER_SESSION_TTL_SECONDS,
  });

  redirect(nextPath);
}

export async function lockOwner(): Promise<void> {
  const store = await cookies();
  store.delete(OWNER_COOKIE_NAME);
  redirect("/owner/access");
}
