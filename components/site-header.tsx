import { siteConfig } from "@/config/site";
import {
  HeroTitle,
  MainMenu,
  MainNavigationMenu,
} from "@/components/nav-components";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="top-0 z-40 w-full bg-transparent">
      <div className="flex flex-col items-center md:container">
        <div className="flex min-h-24 w-full flex-row items-center justify-between">
          <MainMenu items={siteConfig.mainNav} />
          <ThemeToggle />
        </div>
        <HeroTitle />
        <MainNavigationMenu />
      </div>
    </header>
  );
}
