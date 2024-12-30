"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftCircle, MailCheck, MailX } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  EmailSignIn,
  GoogleSignInButton,
} from "@/components/auth/sign-in-button";
import { LoadingSpinner } from "@/components/loading-spinner";

// interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type AuthView = "signin" | "success" | "loading" | "error";
type AuthMessage = string | null;

export function UserAuthForm() {
  const [view, setView] = React.useState<AuthView>("signin");
  const [message, setMessage] = React.useState<AuthMessage>(null);

  const resetView = () => {
    setView("signin");
    setMessage(null);
  };

  return (
    <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {(view === "error" || view === "success") && (
        <Button
          variant="ghost"
          className="absolute right-4 top-4 h-8 w-8 p-0 md:right-8 md:top-8"
          onClick={resetView}
        >
          <ArrowLeftCircle className="size-6 stroke-1" />
        </Button>
      )}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <Image
          alt=""
          className="object-cover"
          src="/stock-images/jared-rice-NTyBbu66_SI-unsplash.jpg"
          fill={true}
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          ATMA
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;atma is literally the coolest thing, such retreat, much
              relax, V. love.&rdquo;
            </p>
            <footer className="text-sm">Scarlett Iu</footer>
          </blockquote>
        </div>
      </div>
      <div className="relative lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to continue
            </p>
          </div>
          <div className={cn("grid gap-6")}>
            {view === "signin" && (
              <>
                <EmailSignIn
                  onSuccess={(msg) => {
                    setView("success");
                    setMessage(msg);
                  }}
                  onError={(msg) => {
                    setView("error");
                    setMessage(msg);
                  }}
                  onLoading={() => setView("loading")}
                />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <GoogleSignInButton />
              </>
            )}

            {view === "success" && (
              <div className="flex flex-col items-center gap-2 text-center">
                <MailCheck className="h-8 w-8 text-green-500" />
                <h3 className="text-xl font-semibold">Check your email</h3>
                <p className="text-muted-foreground">{message}</p>
              </div>
            )}

            {view === "loading" && (
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Authenticating...</p>
              </div>
            )}

            {view === "error" && (
              <div className="flex flex-col items-center gap-2 text-center">
                <MailX className="h-8 w-8 text-destructive" />
                <h3 className="text-xl font-semibold">Authentication Error</h3>
                <p className="text-muted-foreground">{message}</p>
              </div>
            )}
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
