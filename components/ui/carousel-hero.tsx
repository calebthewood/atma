"use client";

import React, { ReactNode, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Fade from "embla-carousel-fade";
import { UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const HeroCarousel = ({ slides }: { slides: { [val: string]: string }[] }) => {
  const [api, setApi] = useState<UseEmblaCarouselType[1] | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const scrollPrev = useCallback(() => api && api.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api && api.scrollNext(), [api]);

  return (
    <div className="relative size-full">
      <Carousel
        setApi={setApi}
        className="size-full"
        opts={{
          loop: true,
        }}
        plugins={[Fade()]}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="size-full">
              <div className="relative h-[600px] w-full">
                <Image
                  src={slide?.image}
                  alt={slide?.title}
                  fill
                  priority
                  sizes="100vw"
                  style={{
                    objectFit: "cover",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-end bg-black/50 p-8 pb-24">
                  <h2 className="mb-4 font-title text-2xl text-white md:text-3xl">
                    {slide.title}
                  </h2>
                  <p className="mb-6 text-xl text-white">{slide.description}</p>
                  <Button
                    size="lg"
                    variant="default"
                    className="border-white bg-white/70 text-richBlack transition-colors hover:bg-white hover:text-black"
                  >
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute right-4 top-4 flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded bg-white/20 transition-opacity hover:bg-white/30"
            onClick={scrollPrev}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded bg-white/20 transition-opacity hover:bg-white/30"
            onClick={scrollNext}
          >
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </Carousel>
      <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1">
        <span className="text-sm text-white">
          {current} / {count}
        </span>
      </div>
    </div>
  );
};

export default HeroCarousel;
