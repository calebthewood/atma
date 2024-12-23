import { googleSignIn } from "@/actions/auth-actions";

import { Icons } from "../icons";
import { Button } from "../ui/button";

export function GoogleSignInButton({ isLoading }: { isLoading: boolean }) {
  return (
    <form className="w-full" action={googleSignIn}>
      <Button
        variant="outline"
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 size-4" />
        )}{" "}
        Google
      </Button>
    </form>
  );
}
