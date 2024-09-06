import Link from "next/link";

import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import {
  HeroTitle,
  MainNav,
  MainNavigationMenu,
} from "@/components/nav-components";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="bg-transparent  top-0 z-40 w-full">
      <div className="container flex items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <nav className="flex flex-1 items-center justify-center space-x-4">
          <div className="flex flex-col items-center justify-center">
            <HeroTitle />

            <MainNavigationMenu />
          </div>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
