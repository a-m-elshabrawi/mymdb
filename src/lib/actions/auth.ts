"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type AuthFormState = { error: string } | undefined;

/**
 * Only a same-origin relative path is a safe redirect target. Rejects
 * absolute URLs (no leading "/"), protocol-relative "//evil.com", and the
 * "/\evil.com" backslash variant some browsers still treat as "//".
 */
function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || value.length === 0) {
    return "/";
  }
  if (!/^\/(?!\/|\\)/.test(value)) {
    return "/";
  }
  return value;
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // With email confirmations enabled, Supabase deliberately returns a fake
  // success (a user object, no error) when the email is already registered
  // — the giveaway is an empty `identities` array. That's intentional
  // user-enumeration protection on Supabase's side; we're trading it away
  // here for a signup form that can actually tell the user what happened.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "An account with this email already exists." };
  }

  redirect(safeNextPath(formData.get("next")));
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(safeNextPath(formData.get("next")));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
