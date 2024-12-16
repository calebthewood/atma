"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { useSearchURL } from "@/hooks/use-search-params";

import { Button } from "./button";

type variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | null
  | undefined;

export default function SearchButton({
  text = "SEARCH",
  variant = "outline",
  className,
}: {
  text?: string;
  variant?: variant;
  className?: string;
}) {
  const searchUrl = useSearchURL();
  return (
    <Button
      asChild
      variant={variant}
      className={cn(
        "w-full rounded-full text-base uppercase text-[#9b1025]",
        className
      )}
    >
      <Link href={searchUrl}>{text}</Link>
    </Button>
  );
}
