import Link from "next/link";
import { getUser } from "@/actions/user-actions";
import { auth, signOut } from "@/auth";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeroTitle, MainNavigationMenu } from "@/components/nav-components";
import { ThemeToggle } from "@/components/theme-toggle";

const baseNav = [
  {
    title: "Home",
    href: "/",
  },
];

// Server action for handling sign out
async function handleSignOut() {
  "use server";
  await signOut();
}

export async function SiteHeader() {
  return (
    <header className={"top-0 z-40 w-full bg-transparent"}>
      <div className="flex flex-col items-center md:container">
        <div className="flex min-h-24 w-full flex-row items-center justify-between">
          <MainMenu />
          <ThemeToggle />
        </div>
        <HeroTitle />
        <MainNavigationMenu />
      </div>
    </header>
  );
}

export async function MainMenu() {
  const session = await auth();

  let navItems = [...baseNav];

  if (session?.user?.email) {
    const res = await getUser({ email: session.user.email });

    if (res.data && ["host", "admin"].includes(res.data.role)) {
      navItems.push({
        title: "Admin",
        href: "/admin",
      });
    }
    navItems.push({
      title: "Sign Out",
      href: "signout",
    });
  } else {
    navItems.push({
      title: "Sign In",
      href: "/authentication",
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden md:block">
        <Menu className="stroke-foreground" strokeWidth={0.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Your Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {navItems.map((item, i) => (
          <DropdownMenuItem key={`main-nav-dmi-${i}`}>
            {item.href !== "signout" ? (
              <Link className="w-full" prefetch href={item.href}>
                {item.title}
              </Link>
            ) : (
              <form action={handleSignOut} className="w-full">
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start p-0 text-left font-normal"
                  type="submit"
                >
                  {item.title}
                </Button>
              </form>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
