import Image from "next/image";

import { getCountryName } from "@/lib/utils";

import { Badge } from "./ui/badge";

export function TitleImageBanner({
  name,
  city,
  country,
  address,
  nearestAirport,
  imgHref,
  taglist,
}: {
  name: string;
  city: string | undefined | null;
  country: string | undefined | null;
  address: string | undefined | null;
  nearestAirport: string | undefined | null;
  imgHref: string;
  taglist: string | undefined | null;
}) {
  const line1 = name;
  const line2 = country ? `${city}, ${getCountryName(country)}` : city;
  const line3 = nearestAirport ? `${address} / ${nearestAirport}` : address;
  const tags = taglist
    ?.split("|")
    .filter((a) => a.length > 1)
    .slice(0, 3);
  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold capitalize">{line1}</h1>
        <div className="flex flex-col justify-between md:flex-row md:items-end">
          <div>
            <p className="uppercase/60 mt-2 text-xs font-medium">{line2}</p>
            <p className="mt-2 text-sm font-medium">{line3}</p>
          </div>
          <div className="mt-2 flex flex-row space-x-4">
            {tags?.map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="h-min cursor-default rounded-full px-3 py-2 text-center text-xs font-medium"
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="relative aspect-[16/9] w-full animate-fade-in overflow-hidden rounded-lg md:aspect-[21/9]">
        <Image
          priority
          alt={name}
          src={imgHref}
          fill
          sizes="(max-width: 768px) 100vw, 90vw"
          className="border-px rounded border-muted object-cover"
          quality={90}
        />
      </div>
    </div>
  );
}
