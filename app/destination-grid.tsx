import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const content = {
  asia: {
    title: "Asia",
    description: "200 hotels, 345 local flights and 234 bus providers",
    href: "/img/asia-card-bg.png",
    alt: "scenic asian landscape",
  },
  usa: {
    title: "USA",
    description: "Unleash your sense of adventure during a fitness retreat",
    href: "/img/usa-card-bg.png",
    alt: "scenic usa landscape",
  },
  southAmerica: {
    title: "South America",
    description:
      "Connect and align during an ayuverdic retreat in the mountains",
    href: "/img/coastline-card-bg.png",
    alt: "scenic usa landscape",
  },
  europe: {
    title: "Europe",
    description: "Step into an oasis with stunning views",
    href: "/img/coastline-card-bg.png",
    alt: "scenic european landscape",
  },
};

export default function DestinationGrid() {
  return (
    <div className="">
      <h2 className="mb-4 text-4xl tracking-tight">
        Discover New Destinations{" "}
      </h2>
      <div className="grid h-[600px] w-full grid-cols-4 grid-rows-5 gap-4">
        {/* Large item (2x2) */}
        <div className="col-span-2 row-span-3 h-full w-full">
          <ImageCard
            className="h-full w-full"
            imgHref={content.usa.href}
            imgAlt={content.usa.alt}
            title={content.usa.title}
            description={content.usa.description}
            buttonText="Explore More"
          />
        </div>

        {/* Bottom two items (1x2 each) */}
        <div className="col-span-1 col-start-1 row-span-2 h-full w-full">
          <ImageCard
            className="h-full w-full"
            imgHref={content.europe.href}
            imgAlt={content.europe.alt}
            title={content.europe.title}
            description={content.europe.description}
            buttonText="View"
          />
        </div>
        <div className="col-span-1 col-start-2 row-span-2 h-full w-full">
          <ImageCard
            className="h-full w-full"
            imgHref={content.southAmerica.href}
            imgAlt={content.southAmerica.alt}
            title={content.southAmerica.title}
            description={content.southAmerica.description}
            buttonText="View"
          />
        </div>

        <div className="col-span-2 col-start-3 row-span-5 row-start-1 h-full w-full">
          <ImageCard
            className="h-full w-full"
            imgHref={content.asia.href}
            imgAlt={content.asia.alt}
            title={content.asia.title}
            description={content.asia.description}
            buttonText="Explore More"
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
                variant={"outline"}
                className="basis-1/3 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                {buttonText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
