"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { EmblaOptionsType } from 'embla-carousel';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PropType = {
    slides: string[];
    options?: EmblaOptionsType;
};

const ThumbnailCarousel: React.FC<PropType> = (props) => {
    const { slides, options } = props;
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mainApi, setMainApi] = useState<CarouselApi>();
    const [thumbsApi, setThumbsApi] = useState<CarouselApi>();

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

    useEffect(() => {
        if (!mainApi) return;
        onSelect();
        mainApi.on("select", onSelect);
        return () => {
            mainApi.off("select", onSelect);
        };
    }, [mainApi, onSelect]);

    return (
        <div className="max-w-3xl mx-auto">
            <Carousel setApi={setMainApi} opts={options} className="overflow-hidden">
                <CarouselContent className="flex touch-pan-y touch-pinch-zoom -ml-4">
                    {slides.map((img, i) => (
                        <CarouselItem key={i} className="flex-[0_0_100%] min-w-0 pl-4 transform translate-x-0">
                            <div className="relative overflow-hidden h-96 flex items-center justify-center text-4xl font-semibold rounded shadow-[inset_0_0_0_0.2rem_var(--detail-medium-contrast)] select-none">
                                <Image
                                    key={`${i}-${img}`}
                                    fill={true}
                                    src={img}
                                    alt="alt"
                                    className={cn(
                                        "size-auto object-cover transition-all hover:scale-105 aspect-square"
                                    )}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

            <div className="mt-3">
                <Carousel
                    setApi={setThumbsApi}
                    opts={{
                        containScroll: 'keepSnaps',
                        dragFree: true
                    }}
                    className="overflow-hidden"
                >
                    <CarouselContent className="flex flex-row -ml-3">
                        {slides.map((img, idx) => (
                            <CarouselItem key={`thumb-${idx}`} className="flex-[0_0_22%] min-w-0 pl-3 sm:flex-[0_0_15%]">
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
                "relative overflow-hidden size-24 rounded-3xl text-lg font-semibold flex items-center justify-center",
                "shadow-[inset_0_0_0_0.2rem_var(--detail-medium-contrast)]",
                "appearance-none bg-transparent cursor-pointer",
                "touch-manipulation focus:outline-none",
                selected ? "text-[var(--text-body)]" : "text-[var(--detail-high-contrast)]"
            )}
        >
            <Image
                key={img}
                fill={true}
                src={img}
                alt="alt"
                className={cn(
                    " object-cover transition-all hover:scale-105 aspect-square"
                )}
            />
        </Button>
    );
};

export default ThumbnailCarousel;