"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Slide {
  image: string;
  title: string | null;
  desc: string;
}

const HeroCarousel = ({ slides }: { slides: Slide[] }) => {
  const [api, setApi] = useState<UseEmblaCarouselType[1] | null>(null);

  const scrollPrev = useCallback(() => api && api.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api && api.scrollNext(), [api]);

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          loop: true,
          align: "center",
          containScroll: "trimSnaps",
        }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="mx-4 basis-full lg:basis-3/4">
              <div className="relative flex flex-col items-center">
                <div className="relative h-[436px] w-80 overflow-hidden rounded-lg md:w-[821px]">
                  <Image
                    src={slide.image}
                    alt={slide.title || "cover image"}
                    fill
                    className="animate-fade-in object-cover"
                    priority={index === 0}
                  />
                </div>
                <div className="mt-6 flex w-full flex-col items-start space-y-2 px-px">
                  <h2 className="text-lg font-semibold capitalize leading-[17.16px] text-black">
                    {slide.title}
                  </h2>
                  <p className="text-sm font-medium uppercase leading-[13.33px] text-black/60">
                    {slide.desc}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute right-8 top-8 flex space-x-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-10 rounded-full border border-[#786018]/20 bg-[#841729] text-white transition-colors hover:bg-[#841729]/80"
            onClick={scrollPrev}
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-10 rounded-full border border-[#786018]/20 bg-[#841729] text-white transition-colors hover:bg-[#841729]/80"
            onClick={scrollNext}
          >
            <ArrowRightIcon className="size-5" />
          </Button>
        </div>
      </Carousel>
    </div>
  );
};

export default HeroCarousel;
