import * as React from "react";
import { googleSignIn, sendgridSignIn } from "@/actions/auth-actions";

import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface EmailSignInProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onLoading?: () => void;
}

export function GoogleSignInButton() {
  return (
    <Button onClick={googleSignIn} variant="outline" className="w-full">
      <Icons.google className="mr-2 size-4" />
      Google
    </Button>
  );
}

export function EmailSignIn({
  onSuccess,
  onError,
  onLoading,
}: EmailSignInProps) {
  async function handleSubmit(formData: FormData) {
    onLoading?.();

    try {
      const email = formData.get("email") as string;
      const result = await sendgridSignIn(formData);

      if (result.error) {
        onError?.(result.error);
      } else {
        onSuccess?.(email);
      }
    } catch (error) {
      console.log(error);
      onError?.("Something went wrong");
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
