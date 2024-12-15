import React from "react";
import { cn } from "@/lib/utils";

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Shell({ children, className, ...props }: ShellProps) {
  return (
    <div
      className={cn(
        "grid items-start gap-8 px-4 py-6 md:px-8 lg:mx-auto lg:max-w-7xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
