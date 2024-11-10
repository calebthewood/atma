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

interface MainNavProps {
  items?: NavItem[];
}

export function HeroTitle() {
  return (
    <Link href="/" className="hover: mt-16 hover:brightness-200">
      <h1 className="flex w-full justify-between px-2 font-title text-6xl transition-all hover:scale-[97%] sm:px-0">
        <span className="flex size-14 flex-col items-center justify-center pl-2 md:size-16">
          A
        </span>
        <span className="flex size-14 flex-col items-center justify-center md:size-16">
          T
        </span>
        <span className="flex size-14 flex-col items-center justify-center md:size-16">
          M
        </span>
        <span className="flex size-14 flex-col items-center justify-center md:size-16">
          A
        </span>
      </h1>
      <p className="font-tagline text-sm leading-10 md:leading-[56px]">
        THE WORLD&apos;S DESTINATION FOR FINEST RETREATS
      </p>
    </Link>
  );
}

export function MainNav({ items }: MainNavProps) {
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
              <Link href={item?.href}>{item.title}</Link>
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

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/destinations" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "px-1 sm:px-2 md:px-4",
                "bg-transparent font-title text-xs leading-6 opacity-50 hover:opacity-100",
                path === "destinations" && "opacity-100"
              )}
            >
              DESTINATIONS
            </NavigationMenuLink>
          </Link>
          <Separator
            className={cn(
              "mx-auto h-0.5 w-0 bg-richBeige transition-all duration-300",
              path === "destinations" && "w-4 opacity-100"
            )}
          />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/retreats" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "px-1 sm:px-2 md:px-4",
                "bg-transparent font-title text-xs leading-6 opacity-50 hover:opacity-100",
                path === "retreats" && "opacity-100"
              )}
            >
              RETREATS
            </NavigationMenuLink>
          </Link>
          <Separator
            className={cn(
              "mx-auto h-0.5 w-0 bg-richBeige transition-all duration-300",
              path === "retreats" && "w-4 opacity-100"
            )}
          />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/programs" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "px-1 sm:px-2 md:px-4",
                "bg-transparent font-title text-xs leading-6 opacity-50 hover:opacity-100",
                path === "programs" && "opacity-100"
              )}
            >
              <span className="hidden md:inline-block">SPECIAL PROGRAMMES</span>
              <span className="md:hidden">PROGRAMMES</span>
            </NavigationMenuLink>
          </Link>
          <Separator
            className={cn(
              "mx-auto h-0.5 w-0 bg-richBeige transition-all duration-300",
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
