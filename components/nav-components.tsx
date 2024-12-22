"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavItem } from "@/types/nav";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { Separator } from "./ui/separator";

interface MainMenuProps {
  items?: NavItem[];
}

export function HeroTitle() {
  return (
    <Link href="/" className="max-w-xl hover:brightness-200">
      <h1 className="font-broad mb-4 flex w-full justify-between text-3xl transition-all hover:scale-[97%] sm:px-0">
        <span className="tracking-widester ml-1 font-normal">ATMA</span>
        <span className="tracking-widester font-semibold">RESERVE</span>
      </h1>
      <p className="text-center text-xs font-thin uppercase leading-relaxed tracking-wider md:text-sm">
        {`THE WORLD'S DESTINATION FOR FINEST RETREATS`}
      </p>
    </Link>
  );
}

export function MainNavigationMenu() {
  const paths = usePathname().split("/");
  const path = paths[1];
  const navMenuLinkStyle = cn(
    "px-1 sm:px-2 md:px-12",
    "bg-transparent text-center text-base md:text-xl font-bold uppercase leading-relaxed",
    "opacity-50 transition-all hover:opacity-100"
  );
  const isDashboard = paths.includes("admin");
  return (
    <NavigationMenu className={cn("my-16 w-full", isDashboard && "hidden")}>
      <NavigationMenuList className="w-full justify-evenly">
        <div className="hidden text-center text-xl font-normal uppercase leading-relaxed opacity-70 md:block">
          BROWSE BY
        </div>
        <NavigationMenuItem>
          <Link href="/destinations" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                navMenuLinkStyle,
                path === "destinations" && "opacity-100"
              )}
            >
              DESTINATIONS
            </NavigationMenuLink>
          </Link>
          <Separator
            className={cn(
              "mx-auto h-0.5 w-0 bg-richBlack transition-all duration-300 dark:bg-richBeige",
              path === "destinations" && "w-4 opacity-100"
            )}
          />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/retreats" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                navMenuLinkStyle,
                path === "retreats" && "opacity-100"
              )}
            >
              RETREATS
            </NavigationMenuLink>
          </Link>
          <Separator
            className={cn(
              "mx-auto h-0.5 w-0 bg-richBlack transition-all duration-300 dark:bg-richBeige",
              path === "retreats" && "w-4 opacity-100"
            )}
          />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/programs" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                navMenuLinkStyle,
                path === "programs" && "opacity-100"
              )}
            >
              PROGRAMS
            </NavigationMenuLink>
          </Link>
          <Separator
            className={cn(
              "mx-auto h-0.5 w-0 bg-richBlack transition-all duration-300 dark:bg-richBeige",
              path === "programs" && "w-4 opacity-100"
            )}
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
