"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const images = [
  "/img/iStock-1929812569.jpg",
  "/img/iStock-1812905796.jpg",
  "/img/iStock-1550112895.jpg",
  "/img/iStock-1507078404.jpg",
  "/img/iStock-1490140364.jpg",
  "/img/iStock-1291807006.jpg",
];

function generateSlides() {
  return images.map((img, i) => (
    <Image
      key={`${i}-${img}`}
      fill={true}
      src={img}
      alt="alt"
      className={cn(
        "aspect-square size-auto object-cover transition-all hover:scale-105"
      )}
    />
  ));
}

export function FakeImageGallery() {
  const [currImg, setCurrImg] = useState(images[0]);
  return (
    <div className="mx-auto my-12 flex flex-row justify-center gap-6">
      <div className="basis-1/2">
        <div className="relative h-[450px] w-[700px] overflow-hidden rounded-md">
          <Image
            src={currImg}
            alt="alt"
            fill={true}
            className={cn(
              "size-auto object-cover transition-all hover:scale-105"
            )}
          />
        </div>
      </div>

      <div className="align-end flex w-80 flex-row flex-wrap gap-2">
        {images.map((img, i) => (
          <div
            key={`img-${i}`}
            onClick={() => setCurrImg(img)}
            className="relative size-36 overflow-hidden rounded-md"
          >
            <Image
              fill={true}
              src={img}
              alt="alt"
              // width={150}
              // height={150}
              className={cn(
                "aspect-square size-auto object-cover transition-all hover:scale-105"
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
