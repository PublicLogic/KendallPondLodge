"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  GUIDEBOOK_COOKIE_NAME,
  GuidebookConfigError,
  getSessionToken,
  verifyGuestCode,
} from "@/lib/guidebook-auth.mjs";

function safeNext(value: FormDataEntryValue | null): string {
  const candidate = typeof value === "string" ? value : "/guidebook";
  return candidate.startsWith("/guidebook") && !candidate.startsWith("//") ? candidate : "/guidebook";
}

export async function unlockGuidebook(formData: FormData): Promise<void> {
  const nextPath = safeNext(formData.get("next"));
  const code = String(formData.get("code") ?? "").trim().toUpperCase();

  let valid: boolean;
  try {
    valid = verifyGuestCode(code);
  } catch (error) {
    if (error instanceof GuidebookConfigError) {
      redirect(`/guidebook/access?error=config&next=${encodeURIComponent(nextPath)}`);
    }
    throw error;
  }

  if (!valid) {
    redirect(`/guidebook/access?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  const store = await cookies();
  store.set(GUIDEBOOK_COOKIE_NAME, getSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(nextPath);
}

export async function lockGuidebook(): Promise<void> {
  const store = await cookies();
  store.delete(GUIDEBOOK_COOKIE_NAME);
  redirect("/");
}
