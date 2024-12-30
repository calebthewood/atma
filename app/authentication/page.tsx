import { Metadata } from "next";

import { UserAuthForm } from "./user-auth-form";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function AuthenticationPage() {
  return <UserAuthForm />;
}
