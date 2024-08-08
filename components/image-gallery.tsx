"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const images = [
    "/img/iStock-1929812569.jpg",
    "/img/iStock-1812905796.jpg",
    "/img/iStock-1550112895.jpg",
    "/img/iStock-1507078404.jpg",
    "/img/iStock-1490140364.jpg",
    "/img/iStock-1291807006.jpg",
];

export function FakeImageGallery() {
    const [currImg, setCurrImg] = useState(images[0]);
    return (
        <div className="flex flex-row  my-12 mx-auto justify-center gap-6">
            <div className="basis-1/2">
            <div className="overflow-hidden rounded-md h-[450px] w-[700px] relative">
                <Image
                    src={currImg}
                    alt="alt"
                    fill={true}
                    className={cn(
                        "h-auto w-auto object-cover transition-all hover:scale-105"
                    )}
                />
            </div>
            </div>

            <div className="flex flex-row align-end w-80 flex-wrap gap-2">
                {images.map((img, i) => (
                    <div key={`img-${i}`}
                        onClick={() => setCurrImg(img)}
                        className="overflow-hidden rounded-md relative h-36 w-36">
                        <Image
                            fill={true}
                            src={img}
                            alt="alt"
                            // width={150}
                            // height={150}
                            className={cn(
                                "h-auto w-auto object-cover transition-all hover:scale-105 aspect-square",
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}