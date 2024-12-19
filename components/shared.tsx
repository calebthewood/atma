import React, { HTMLAttributes } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

interface QuickLinkProps extends HTMLAttributes<HTMLDivElement> {
  text: string;
  href: string;
}

export const QuickLink: React.FC<QuickLinkProps> = ({
  text,
  href,
  className,
}) => (
  <Button asChild variant="link" className={cn("text-[#841729]", className)}>
    <Link className="text-sm font-semibold uppercase" href={href}>
      {text}
    </Link>
  </Button>
);
