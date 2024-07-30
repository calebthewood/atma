"use server";
import { signIn, } from "@/auth.ts";

export async function googleSignIn() {
  await signIn("google", { provider: 'google', redirectTo: "/", redirect: true });
};