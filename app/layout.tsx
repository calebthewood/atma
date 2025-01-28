import "@/styles/globals.css";

import React from "react";
import { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import { fontSans, fontTitle } from "@/lib/fonts/fonts";
import { cn } from "@/lib/utils";
import FooterSection from "@/components/sections/footer-section";
import { SiteHeader } from "@/components/site-header";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "bg-richBeige font-sans antialiased dark:bg-gradient-dark",
          fontSans.variable,
          fontTitle.variable
        )}
      >
        <ThemeProvider attribute="class" enableSystem={false}>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            {children}
          </div>
          <FooterSection />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
