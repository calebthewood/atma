"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { EmblaOptionsType } from "embla-carousel";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import { ScrollArea } from "./scroll-area";

const TWEEN_FACTOR = 0.9;

type PropType = {
  slides: string[] | undefined;
  options?: EmblaOptionsType;
};

const ThumbnailCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [_, setThumbsApi] = useState<CarouselApi>();
  const parallaxLayers = useRef<(HTMLElement | null)[]>([]);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
  }, [mainApi]);

  const parallaxEffect = useCallback(
    (api: CarouselApi) => {
      if (api === undefined) return;
      const engine = api.internalEngine();
      const scrollProgress = api.scrollProgress();

      api.scrollSnapList().forEach((scrollSnap, index) => {
        const slidesInSnap = engine.slideRegistry[index];
        let diffToTarget = scrollSnap - scrollProgress;

        slidesInSnap.forEach((slideIndex) => {
          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);
                if (sign === -1)
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                if (sign === 1)
                  diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            });
          }

          const translate = diffToTarget * (-1 * TWEEN_FACTOR) * 100;
          const layer = parallaxLayers.current[slideIndex];
          if (layer) {
            layer.style.transform = `translateX(${translate}%)`;
          }
        });
      });
    },
    [mainApi]
  );

  useEffect(() => {
    if (!mainApi) return;

    const onScroll = () => parallaxEffect(mainApi);
    const onResize = () => {
      mainApi.reInit();
      parallaxEffect(mainApi);
    };

    onScroll();
    window.addEventListener("resize", onResize);
    mainApi.on("scroll", onScroll);
    mainApi.on("select", onSelect);

    return () => {
      window.removeEventListener("resize", onResize);
      mainApi.off("scroll", onScroll);
      mainApi.off("select", onSelect);
    };
  }, [mainApi, onSelect, parallaxEffect]);

  if (!slides) return null;

  return (
    <div className="mx-auto max-w-[90rem]">
      <div className="md:flex md:gap-6">
        {/* Main Carousel */}
        <div className="md:w-3/4">
          <Carousel
            setApi={setMainApi}
            opts={{ ...options, loop: true }}
            className="overflow-hidden"
          >
            <CarouselContent className="-ml-4 flex">
              {slides.map((img, i) => (
                <CarouselItem key={i} className="flex-[0_0_100%] pl-4">
                  <div className="h-[19rem] overflow-hidden rounded md:h-[30rem]">
                    <div
                      ref={(el) => {
                        parallaxLayers.current[i] = el;
                      }}
                      className="relative flex size-full justify-center"
                    >
                      <Image
                        src={img}
                        alt={`Slide ${i + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 75vw"
                        className="animate-fade-in object-cover transition-all hover:scale-105"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Thumbnails */}
        <div className="mt-7 md:mt-0 md:w-1/4">
          <div className="md:h-[30rem] md:pr-2">
            {/* Mobile Carousel */}
            <div className="md:hidden">
              <Carousel
                setApi={setThumbsApi}
                opts={{
                  containScroll: "keepSnaps",
                  dragFree: true,
                }}
                className="overflow-hidden"
              >
                <CarouselContent className="-ml-3 flex justify-evenly">
                  {slides.map((img, idx) => (
                    <CarouselItem
                      key={`mobile-thumb-${idx}`}
                      className="flex-[0_0_22%] pl-3 sm:flex-[0_0_15%]"
                    >
                      <Thumb
                        onClick={() => onThumbClick(idx)}
                        selected={idx === selectedIndex}
                        img={img}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Desktop Grid */}
            <ScrollArea className="hidden h-[480px] w-full overflow-hidden md:block">
              <div className="hidden md:grid md:grid-cols-1 md:gap-0 lg:grid-cols-2">
                {slides.map((img, idx) => (
                  <Thumb
                    key={`desktop-thumb-${idx}`}
                    onClick={() => onThumbClick(idx)}
                    selected={idx === selectedIndex}
                    img={img}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

type ThumbProps = {
  selected: boolean;
  img: string;
  onClick: () => void;
};

const Thumb: React.FC<ThumbProps> = (props) => {
  const { selected, img, onClick } = props;

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className={cn(
        "relative aspect-square size-full min-h-24 min-w-24 overflow-hidden rounded-xl p-0",
        "shadow-[inset_0_0_0_0.2rem_var(--detail-medium-contrast)]",
        "cursor-pointer appearance-none bg-transparent",
        "touch-manipulation border-transparent focus:outline-none",
        selected ? "shadow-[inset_0_0_0_0.2rem_var(--text-body)]" : ""
      )}
    >
      <Image
        fill={true}
        src={img}
        alt="Thumbnail"
        className="object-cover transition-all hover:scale-105"
      />
    </Button>
  );
};

export default ThumbnailCarousel;
