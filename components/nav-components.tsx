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
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Icons } from "@/components/icons";

import { Separator } from "./ui/separator";

interface MainNavProps {
  items?: NavItem[];
}

export function HeroTitle() {
  return (
    <Link href="/" className="W-[373] mt-16 hover:brightness-200 hover:">
      <h1 className="w-full flex justify-between font-title text-6xl leading-6 tracking-[100%] hover:scale-90 transition-all">
        <span>A</span>
        <span>T</span>
        <span>M</span>
        <span>A</span>
      </h1>
      <p className="leading-[56px] font-tagline">
        THE WORLD&apos;S DESTINATION FOR FINEST RETREATS
      </p>
    </Link>
  );
}

export function MainNav({ items }: MainNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className="stroke-rich-white" strokeWidth={0.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Your Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items?.map((item) =>
          item?.href ? (
            <DropdownMenuItem>
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
  console.log("path", paths);
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/destinations" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent font-title text-xs leading-6 opacity-50 hover:opacity-100",
                path === "destinations" && "opacity-100"
              )}
            >
              DESTINATIONS
            </NavigationMenuLink>
          </Link>
          <Separator
            className={cn(
              "h-0.5 w-0 bg-rich-white transition-all mx-auto duration-300",
              path === "destinations" && "w-4 opacity-100"
            )}
          />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/retreats" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent font-title text-xs leading-6 opacity-50 hover:opacity-100",
                path === "retreats" && "opacity-100"
              )}
            >
              RETREATS
            </NavigationMenuLink>
          </Link>
          <Separator
            className={cn(
              "h-0.5 w-0 bg-rich-white transition-all mx-auto duration-300",
              path === "retreats" && "w-4 opacity-100"
            )}
          />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/special-programmes" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent font-title text-xs leading-6 opacity-50 hover:opacity-100",
                path === "special-programmes" && "opacity-100"
              )}
            >
              SPECIAL PROGRAMMES
            </NavigationMenuLink>
          </Link>
          <Separator
            className={cn(
              "h-0.5 w-0 bg-rich-white transition-all mx-auto duration-300",
              path === "special-programmes" && "w-4 opacity-100"
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
