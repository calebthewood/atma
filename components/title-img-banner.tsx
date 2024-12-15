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
    <div className="bg-muted relative flex h-3/4 min-h-[500px] flex-col justify-end p-0 text-white md:p-10 dark:border-r">
      <Image
        priority
        alt="destination cover photo"
        src={href}
        fill={true}
        sizes="100vw"
        className="w-full bg-contain md:bg-cover"
        // style={{
        //   objectFit: "cover",
        //   objectPosition: "center",
        //   width: "100%",
        // }}
      />
      <GlassCard className="z-20 w-full rounded-r py-1 pl-4 md:-left-10 md:pl-10 md:pr-8">
        <div className="flex items-center text-lg font-medium text-white">
          {subtitle}
        </div>
        <div className=" ">
          <blockquote className="space-y-2">
            <H1 className="mb-1 text-4xl text-white md:text-6xl">{title}</H1>
          </blockquote>
        </div>
      </GlassCard>
    </div>
  );
}
