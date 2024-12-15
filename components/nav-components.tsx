"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { NavItem } from "@/types/nav";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      <p className="text-center text-sm font-thin uppercase leading-relaxed tracking-wider text-black">
        {`THE WORLD'S DESTINATION FOR FINEST RETREATS`}
      </p>
    </Link>
  );
}

export function MainMenu({ items }: MainMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden md:block">
        <Menu className="stroke-foreground" strokeWidth={0.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Your Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items?.map((item, i) =>
          item?.href ? (
            <DropdownMenuItem key={`main-nav-dmi-${i}`}>
              <Link prefetch href={item?.href}>
                {item.title}
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem>{item.title}</DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MainNavigationMenu() {
  const paths = usePathname().split("/");
  const path = paths[1];
  const navMenuLinkStyle = cn(
    "px-1 sm:px-2 md:px-12",
    "bg-transparent text-center text-xl font-bold uppercase leading-relaxed text-black",
    "opacity-50 hover:opacity-100 transition-all"
  );

  return (
    <NavigationMenu className="my-16 w-full">
      <NavigationMenuList className="w-full justify-evenly">
        <div className="text-center text-xl font-normal uppercase leading-relaxed text-black opacity-70">
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
  React.ElementRef<"a">,
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
