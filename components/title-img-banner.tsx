import Image from "next/image";

import { GlassCard } from "./glass-card";
import { H1 } from "./typography";

export function TitleImageBanner({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="relative flex h-3/4 min-h-[500px] flex-col justify-end bg-muted p-10 text-white dark:border-r">
      {/* <div className="absolute inset-0 bg-zinc-900" /> */}
      <Image
        priority
        // placeholder="blur"
        sizes="100vw"
        alt="destination cover photo"
        src={href}
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
        fill={true}
      />
      <GlassCard className="-left-10 z-20 rounded-r py-1 pl-10 pr-8">
        <div className="flex items-center text-lg font-medium text-white">
          {subtitle}
        </div>
        <div className="text-nowrap">
          <blockquote className="space-y-2">
            <H1 className="text-white text-6xl mb-1">
              {title}
            </H1>
          </blockquote>
        </div>
      </GlassCard>
    </div>
  );
}
