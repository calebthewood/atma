import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const content = {
  asia: {
    title: "Asia",
    description: "200 hotels, 345 local flights and 234 bus providers",
    href: "/img/asia-card-bg.png",
    alt: "scenic asian landscape",
    buttonText: "Explore More",
    buttonLink:
      "http://localhost:3000/search?place=Japan&lat=36.204824&lon=138.252924",
  },
  usa: {
    title: "USA",
    description: "Unleash your sense of adventure during a fitness retreat",
    href: "/img/usa-card-bg.png",
    alt: "scenic usa landscape",
    buttonText: "Explore More",
    buttonLink:
      "http://localhost:3000/search?guests=2&place=USA&lat=38.7945952&lon=-106.5348379",
  },
  southAmerica: {
    title: "South America",
    description:
      "Connect and align during an ayuverdic retreat in the mountains",
    href: "/img/coastline-card-bg.png",
    alt: "scenic usa landscape",
    buttonText: "View",
    buttonLink:
      "http://localhost:3000/search?place=Brazil&lat=-14.235004&lon=-51.92528",
  },
  europe: {
    title: "Europe",
    description: "Step into an oasis with stunning views",
    href: "/img/coastline-card-bg.png",
    alt: "scenic european landscape",
    buttonText: "View",
    buttonLink:
      "http://localhost:3000/search?place=Italy&lat=41.87194&lon=12.56738",
  },
};

export default function DestinationGrid() {
  return (
     <div className="container mx-auto px-4">
      <h2 className="mb-4 text-4xl tracking-tight">
        Discover New Destinations{" "}
      </h2>
      {/* Grid container with responsive classes */}
      <div className="grid gap-4 md:h-[600px] md:grid-cols-4 md:grid-rows-5">
        {/* First large item - spans full width on mobile, 2 cols on desktop */}
        <div className="h-[300px] md:col-span-2 md:row-span-3 md:h-full">
          <ImageCard
            className="h-full w-full"
            imgHref={content.usa.href}
            imgAlt={content.usa.alt}
            title={content.usa.title}
            description={content.usa.description}
            buttonText={content.usa.buttonText}
            buttonLink={content.usa.buttonLink}
          />
        </div>

        {/* Two smaller items - stack on mobile, side by side on desktop */}
        <div className="h-[300px] md:col-span-1 md:col-start-1 md:row-span-2 md:h-full">
          <ImageCard
            className="h-full w-full"
            imgHref={content.europe.href}
            imgAlt={content.europe.alt}
            title={content.europe.title}
            description={content.europe.description}
            buttonText={content.europe.buttonText}
            buttonLink={content.europe.buttonLink}
          />
        </div>
        <div className="h-[300px] md:col-span-1 md:col-start-2 md:row-span-2 md:h-full">
          <ImageCard
            className="h-full w-full"
            imgHref={content.southAmerica.href}
            imgAlt={content.southAmerica.alt}
            title={content.southAmerica.title}
            description={content.southAmerica.description}
            buttonText={content.southAmerica.buttonText}
            buttonLink={content.southAmerica.buttonLink}
          />
        </div>

        {/* Last large item - full width on mobile, right side on desktop */}
        <div className="h-[400px] md:col-span-2 md:col-start-3 md:row-span-5 md:row-start-1 md:h-full">
          <ImageCard
            className="h-full w-full"
            imgHref={content.asia.href}
            imgAlt={content.asia.alt}
            title={content.asia.title}
            description={content.asia.description}
            buttonText={content.asia.buttonText}
            buttonLink={content.asia.buttonLink}
          />
        </div>
      </div>
    </div>
  );
}

interface ImageCardProps {
  height?: number;
  width?: number;
  className?: string;
  imgHref: string;
  imgAlt: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

function ImageCard({
  height,
  width,
  imgHref,
  imgAlt,
  title,
  description,
  buttonText,
  className,
  buttonLink,
  ...props
}: ImageCardProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0">
        <Image
          src={imgHref}
          alt={imgAlt}
          fill
          className="object-cover transition-all duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="space-y-2 text-white">
          <h3 className="text-2xl font-semibold leading-tight">{title}</h3>
          <div className="flex items-center">
            <p className="basis-2/3 text-sm font-medium text-white/80">
              {description}
            </p>
            {buttonText && (
              <Button
                asChild
                variant={"outline"}
                className="basis-1/3 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30 transition-all drop-shadow-sm hover:drop-shadow-2xl"
              >
                <Link prefetch href={buttonLink}>
                  {buttonText}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
