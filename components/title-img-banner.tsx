import Image from "next/image";

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
      <div className="absolute inset-0 bg-zinc-900" />
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
      <div className="relative -left-10 z-20 w-fit rounded-r bg-primary/20 pl-10 pr-4 text-background/80 backdrop-blur-sm">
        <div className="flex items-center text-lg font-medium">{subtitle}</div>
        <div className="w-min text-nowrap">
          <blockquote className="space-y-2">
            <H1>{title}</H1>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
