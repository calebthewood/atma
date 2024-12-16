"use server";

import { signIn } from "@/auth.ts";

export async function googleSignIn(): Promise<void> {
  await signIn("google", {
    provider: "google",
    redirectTo: "/",
    redirect: true,
  });
}
