import { Suspense } from "react";
import { Metadata } from "next";

import { LoadingSpinner } from "@/components/loading-spinner";

import { UserAuthForm } from "./user-auth-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in using your email to book",
};

export default function AuthenticationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-x-4">
          <LoadingSpinner /> Loading
        </div>
      }
    >
      <UserAuthForm />
    </Suspense>
  );
}
