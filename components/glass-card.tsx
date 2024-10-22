import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative inline-block max-w-fit", className)}>
      <div className="absolute inset-0 rounded bg-gradient-to-br from-[#004476] via-[#004476] to-[#006fbe] opacity-30"></div>

      <div className="absolute inset-0 overflow-hidden rounded">
        <div className="absolute inset-0 bg-[url('/img/white-noise-2.webp')] bg-repeat opacity-50"></div>
        <div className="absolute inset-0 bg-[url('/img/white-noise-1.webp')] bg-repeat opacity-50"></div>

        <div className="absolute inset-0 rounded bg-gradient-to-br from-white/75 to-white/30 opacity-10"></div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-sm rounded-l-none border border-white/70 border-l-transparent backdrop-blur-sm"></div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
