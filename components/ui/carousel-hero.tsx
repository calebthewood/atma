'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import Fade from 'embla-carousel-fade';
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Image from 'next/image';

const HeroCarousel = ({ slides }) => {
    const [api, setApi] = useState(null);
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
        <div className="relative w-full h-full">
            <Carousel
                setApi={setApi}
                className="w-full h-full"
                opts={{
                    loop: true,
                }}
                plugins={[Fade()]}
            >
                <CarouselContent>
                    {slides.map((slide, index) => (
                        <CarouselItem key={index} className="w-full h-full">
                            <div className="relative w-full h-[600px]">
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    priority
                                    sizes="100vw"
                                    style={{
                                        objectFit: 'cover',
                                    }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end items-center p-8 pb-24">
                                    <h2 className="text-3xl font-title text-white mb-4">{slide.title}</h2>
                                    <p className="text-xl text-white mb-6">{slide.description}</p>
                                    <Button
                                    size='lg'
                                    variant="default"
                                    className="text-richBlack bg-white/70 border-white hover:bg-white hover:text-black transition-colors">
                                        {slide.buttonText}
                                    </Button>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="absolute top-4 right-4 flex space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white rounded bg-opacity-20 hover:bg-opacity-30 transition-opacity"
                        onClick={scrollPrev}
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white rounded bg-opacity-20 hover:bg-opacity-30 transition-opacity"
                        onClick={scrollNext}
                    >
                        <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                </div>
            </Carousel>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-white text-sm">
                    {current} / {count}
                </span>
            </div>
        </div>
    );
};


export default HeroCarousel;
