"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getProgram,
  type ProgramWithAllRelations,
} from "@/actions/program-actions";
import {
  getProperty,
  PropertyWithAllRelations,
} from "@/actions/property-actions";
import { getRetreat, RetreatWithAllRelations } from "@/actions/retreat-actions";
import { PriceMod } from "@prisma/client";
import { format } from "date-fns";
import { CirclePlus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";

type PropertyLazyCarouselProps = {
  entityIds: string[];
  entityType: "retreat" | "program";
};

export default function PropertyLazyCarousel({
  entityIds,
  entityType,
}: PropertyLazyCarouselProps) {
  if (!entityIds || entityIds.length <= 1) return null;

  const segment = entityType === "retreat" ? "retreats" : "programs";

  return (
    <div className="relative w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {entityIds.map((id, i) => (
            <CarouselItem
              key={`${id}-${i}-plc`}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <NewLazyRetreatItem
                id={id}
                segment={segment}
                className="size-[250px] md:size-[300px] lg:size-[330px] xl:size-[380px]"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselPrevious />
        <CarouselNext /> */}
      </Carousel>
    </div>
  );
}

type ItemType =
  | RetreatWithAllRelations
  | PropertyWithAllRelations
  | ProgramWithAllRelations;

interface LazyCardProps {
  id: string;
  segment: string;
  className?: string;
}

const formatCurrency = (priceMods: PriceMod[] | undefined) => {
  if (!priceMods || priceMods.length === 0) return "Price on request";
  const basePrice = priceMods.find((mod) => mod.type === "BASE_PRICE");
  if (!basePrice) return "Price on request";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(basePrice.value);
};

export function NewLazyRetreatItem({ id, segment, className }: LazyCardProps) {
  const [item, setItem] = useState<ItemType | null | undefined>();
  const [date, setDate] = useState<{ to: Date; from: Date }>();
  const [image, setImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchItem(id: string) {
      segment += segment.endsWith("s") ? "" : "s";
      setIsLoading(true);
      try {
        let response;

        switch (segment) {
          case "retreats":
            response = await getRetreat(id);

            if (response.ok && response.data) {
              const rImgs = response.data.images;
              const pImgs = response.data.property.images;
              const img = rImgs.length > 0 ? rImgs[0] : pImgs[0];
              setImage(img?.filePath || "/img/iStock-1490140364.jpg");
              setItem(response.data);
              if (response.data.retreatInstances.length > 0) {
                const inst = response.data.retreatInstances[0];
                setDate({
                  to: inst.endDate,
                  from: inst.startDate,
                });
              }
            }
            break;
          case "destinations":
            response = await getProperty(id);
            if (response.ok) {
              setItem(response.data);
              setImage(
                response?.data?.images[0]?.filePath ||
                  "/img/iStock-1490140364.jpg"
              );
            }
            break;
          case "programs":
            response = await getProgram(id);
            if (response.ok && response.data) {
              const rImgs = response.data.images;
              const pImgs = response.data.property.images;
              const img = rImgs.length > 0 ? rImgs[0] : pImgs[0];
              setImage(img?.filePath || "/img/iStock-1490140364.jpg");
              setItem(response.data);
            }
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${segment}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItem(id);
  }, [id, segment]);

  if (isLoading || !item) {
    return (
      <div className={cn("flex flex-col space-y-3", className)}>
        <Skeleton className="h-[300px] w-[300px] rounded-xl" />
        <div className="space-y-2 px-2">
          <Skeleton className="h-4 w-[223px]" />
          <Skeleton className="h-3 w-[150px]" />
          <Skeleton className="h-3 w-[180px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
    );
  }

  // Type guards
  const isRetreat = (item: ItemType): item is RetreatWithAllRelations => {
    return "retreatInstances" in item;
  };

  const isProgram = (item: ItemType): item is ProgramWithAllRelations => {
    return "programs" in item;
  };

  // Get display data based on item type
  const displayData = {
    name: item.name || "Unnamed",
    city: isRetreat(item)
      ? item.property.city
      : isProgram(item)
        ? item.property?.city
        : item.city,
    country: isRetreat(item)
      ? item.property.country
      : isProgram(item)
        ? item.property?.country
        : item.country,
    priceMods: isRetreat(item) || isProgram(item) ? item?.priceMods : undefined,
  };
  console.log("item: ", item);
  return (
    <div className={cn("flex flex-col")}>
      <Link href={`/${segment}/${item?.id}`}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn("relative overflow-hidden rounded-md", className)}
            >
              <Image
                fill
                src={image}
                alt={item.name || "n/a"}
                className={cn(
                  "object-cover transition-all hover:scale-105",
                  "aspect-square"
                )}
              />
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-40">
            <ContextMenuItem>Add to Schedule</ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Add to Wishlist</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem>
                  <CirclePlus className="mr-2 size-4" />
                  New Item
                </ContextMenuItem>
                <ContextMenuSeparator />

                <ContextMenuItem>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="mr-2 size-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3" />
                  </svg>
                  Put somethin handy here?
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem>View Retreat</ContextMenuItem>
            <ContextMenuItem>Visit Partner Page</ContextMenuItem>
            <ContextMenuItem>View Similar</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Like</ContextMenuItem>
            <ContextMenuItem>Share</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Link>
      <div className="mt-4 flex w-60 max-w-[300px] flex-col gap-1 text-wrap px-px md:w-full">
        <h4 className="text-lg font-semibold capitalize leading-[17.16px]">
          {displayData.name}
        </h4>
        <div className="text-[10px] font-medium uppercase leading-[15px] opacity-60">
          {displayData.city && displayData.country
            ? `${displayData.city}, ${displayData.country}`
            : displayData.country ||
              displayData.city ||
              "Location not specified"}
        </div>
        {date && (
          <div className="text-[10px] font-medium uppercase leading-[15px] opacity-60">
            {format(date.from, "MMM d, yyyy")}
            {" → "}
            {format(date.to, "MMM d, yyyy")}
          </div>
        )}
        <div className="text-[10px] font-medium uppercase leading-[15px] opacity-60">
          From {formatCurrency(displayData.priceMods)}
        </div>
      </div>
    </div>
  );
}
