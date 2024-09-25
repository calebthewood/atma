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

const TWEEN_FACTOR = 0.9;

type PropType = {
  slides: string[];
  options?: EmblaOptionsType;
};

const ThumbnailCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbsApi, setThumbsApi] = useState<CarouselApi>();
  const parallaxLayers = useRef<(HTMLElement | null)[]>([]);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbsApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbsApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
    thumbsApi.scrollTo(mainApi.selectedScrollSnap());
  }, [mainApi, thumbsApi]);

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

  return (
    <div className="max-w-3xl mx-auto">
      <Carousel
        setApi={setMainApi} //@ts-ignore
        opts={{ ...options, loop: true }}
        className="overflow-hidden"
      >
        <CarouselContent className="flex -ml-4">
          {slides.map((img, i) => (
            <CarouselItem key={i} className="pl-1 flex-[0_0_80%]">
              <div className="rounded h-[19rem] overflow-hidden">
                <div
                  ref={(el) => {
                    parallaxLayers.current[i] = el;
                  }}
                  className="relative size-full flex justify-center"
                >
                  <Image
                    src={img}
                    alt={`Slide ${i + 1}`}
                    fill
                    className="object-cover max-w-none flex-[0_0_calc(115%+2rem)] transition-all hover:scale-105 "
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div className="mt-7">
        <Carousel
          setApi={setThumbsApi}
          opts={{
            containScroll: "keepSnaps",
            dragFree: true,
          }}
          className="overflow-hidden"
        >
          <CarouselContent className="flex -ml-3">
            {slides.map((img, idx) => (
              <CarouselItem
                key={`thumb-${idx}`}
                className="pl-3 flex-[0_0_22%] sm:flex-[0_0_15%]"
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
        "relative overflow-hidden size-24 rounded-xl p-0",
        "shadow-[inset_0_0_0_0.2rem_var(--detail-medium-contrast)]",
        "appearance-none bg-transparent cursor-pointer",
        "touch-manipulation focus:outline-none",
        selected ? "shadow-[inset_0_0_0_0.2rem_var(--text-body)]" : ""
      )}
    >
      <Image
        fill={true}
        src={img}
        alt="Thumbnail"
        className="object-cover transition-all hover:scale-105 "
      />
    </Button>
  );
};

export default ThumbnailCarousel;
