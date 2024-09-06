"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun strokeWidth={0.5} className="h-6 w-[1.3rem] dark:hidden" />
      <Moon strokeWidth={0.5} className="hidden size-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
