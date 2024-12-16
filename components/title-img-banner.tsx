import Image from "next/image";

export function TitleImageBanner({
  name,
  city,
  country,
  address,
  nearestAirport,
  imgHref,
}: {
  name: string;
  city: string | undefined | null;
  country: string | undefined | null;
  address: string | undefined | null;
  nearestAirport: string | undefined | null;
  imgHref: string;
}) {
  const line1 = name;
  const line2 = country ? `${city}, ${country}` : city;
  const line3 = nearestAirport ? `${address} / ${nearestAirport}` : address;
  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold capitalize">{line1}</h1>
        <p className="uppercase/60 mt-2 text-xs font-medium">{line2}</p>
        <p className="mt-2 text-sm font-medium">{line3}</p>
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg md:aspect-[21/9]">
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
