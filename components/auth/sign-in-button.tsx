

import { Button } from "../ui/button";
import { Icons } from "../icons";
import { googleSignIn } from "@/actions/auth-actions";


export function GoogleSignInButton({ isLoading }: { isLoading: boolean; }) {
    return (
        <form
        className="w-full"
            action={async () => await googleSignIn()}
        >
            <Button variant="outline" type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.google className="mr-2 h-4 w-4" />
                )}{" "}
                Google
            </Button>
        </form>
    );
}