import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { googleSignIn, sendgridSignIn } from "@/actions/auth-actions";

import { cn } from "@/lib/utils";

import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function GoogleSignInButton() {
  return (
    <Button onClick={googleSignIn} variant="outline" className="w-full">
      <Icons.google className="mr-2 size-4" />
      Google
    </Button>
  );
}

export function EmailSignIn() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    router.push("/authentication?view=loading");
    try {
      const email = formData.get("email") as string;
      const result = await sendgridSignIn(formData);

      if (result.error) {
        router.push(`/authentication?view=error&msg=${result.error}`);
      } else {
        router.push(`/authentication?view=success&msg=${email}`);
      }
    } catch (error) {
      router.push("/authentication?view=error&msg=Something went wrong");
    }
  }

  return (
    <form action={handleSubmit}>
      <div className="grid gap-2">
        <div className="grid gap-1">
          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <Input
            icon="mail"
            id="email"
            name="email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            required
          />
          <Button type="submit">Sign in with Email</Button>
        </div>
      </div>
    </form>
  );
}
