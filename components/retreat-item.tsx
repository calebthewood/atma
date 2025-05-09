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
import { Host, Program, Property, Retreat } from "@prisma/client";
import { CirclePlus } from "lucide-react";

import { cn, getCountryName } from "@/lib/utils";
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

const imagePaths = [
  "/img/iStock-1929812569.jpg",
  "/img/iStock-1812905796.jpg",
  "/img/iStock-1550112895.jpg",
  "/img/iStock-1507078404.jpg",
  "/img/iStock-1490140364.jpg",
  "/img/iStock-1291807006.jpg",
  "/img/iStock-1250509758.jpg",
  "/img/iStock-1439793956.jpg",
  "/img/empty-hallway-background.jpg",
  "/img/indoor-design-luxury-resort.jpg",
  "/img/people-exercising-practicing-sports-with-use-foam-roller.jpg",
  "/img/recovery-center-outside-lush-stunning-spa-nature-mauritiusisland.jpg",
  "/img/wellness-practices-self-care-world-health-day.jpg",
  "/img/woman-sits-pool-with-palm-trees-background.jpg",
];
const rIsx = 2;
interface RetreatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  retreat: Retreat | Host | Property | Program;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  imgUrl: string | undefined;
  segment?: string;
}

export function RetreatItem({
  retreat,
  aspectRatio = "portrait",
  width,
  height,
  className,
  imgUrl,
  segment,
  ...props
}: RetreatCardProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Link href={`/${segment}/${retreat?.id}`}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="animate-fade-in overflow-hidden rounded-md">
              <Image
                src={imgUrl || imagePaths[rIsx]}
                alt={retreat.name || "n/a"}
                width={width}
                height={height}
                className={cn(
                  "size-full object-cover transition-all hover:scale-105",
                  aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
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
    </div>
  );
}

interface LazyRetreatCardProps {
  id: string;
  aspectRatio?: "portrait" | "landscape" | "square";
  width: number;
  height: number;
  className?: string;
  segment: string; //"retreats" | "destinations" | "programs" | "hosts";
}
type ItemType =
  | RetreatWithAllRelations
  | PropertyWithAllRelations
  | ProgramWithAllRelations;

export function LazyRetreatItem({
  id,
  aspectRatio = "portrait",
  width,
  height,
  className,
  segment,
  ...props
}: LazyRetreatCardProps) {
  const [item, setItem] = useState<ItemType | null | undefined>();
  const [image, setImage] = useState<string>(imagePaths[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchItem(id: string) {
      setIsLoading(true);
      try {
        let response;
        switch (segment) {
          case "retreats":
            response = await getRetreat(id);
            if (response.ok && response.data) {
              setItem(response.data);
              const img = response?.data?.property?.images[0]?.filePath;
              if (img) {
                setImage(img);
              }
            }
            break;
          case "destinations":
            response = await getProperty(id);
            if (response.ok && response.data) {
              setItem(response.data);
              const img = response?.data?.images[0]?.filePath;
              if (img) {
                setImage(img);
              }
            }
            break;
          case "programs":
            response = await getProgram(id);
            if (response.ok && response.data) {
              setItem(response.data);
              const img = response?.data?.property?.images[0]?.filePath;
              if (img) {
                setImage(img);
              }
            }
            break;
        }
      } catch (error) {
        console.log(`Error fetching ${segment}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItem(id);
  }, [id, segment]);

  if (isLoading || !item) {
    return (
      <div className={cn("flex flex-col space-y-3", className)}>
        <Skeleton
          className={cn(
            "rounded-xl",
            aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
            `h-[${height}px] w-[${width}px]`
          )}
        />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }
  // Type guards
  const isRetreat = (item: ItemType): item is RetreatWithAllRelations => {
    return "retreatInstances" in item;
  };

  const isProgram = (item: ItemType): item is ProgramWithAllRelations => {
    return "duration" in item;
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
  };

  return (
    <div
      className={cn(
        "group relative m-2 overflow-hidden rounded shadow-sm",
        className
      )}
      style={{ height: `${height}px` }}
      {...props}
    >
      <Link prefetch href={`/${segment}/${id}`} className="absolute inset-0">
        <ContextMenu>
          <ContextMenuTrigger>
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 animate-fade-in">
              <Image
                src={image || "/img/iStock-1507078404.jpg"}
                alt={displayData.name}
                width={width}
                height={height}
                className="size-full object-cover transition-all duration-300 group-hover:scale-105"
              />
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex h-auto flex-col justify-between px-4 py-6">
              <div className="space-y-2 text-richBeige">
                <h3 className="text-2xl font-medium leading-tight">
                  {displayData.name}
                </h3>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">
                  {displayData.city && displayData.country
                    ? `${displayData.city}, ${getCountryName(displayData.country)}`
                    : "Location unavailable"}
                </p>
              </div>
            </div>
          </ContextMenuTrigger>

          {/* Context Menu */}
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
                  Add to Collection
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem>
              View{" "}
              {isRetreat(item)
                ? "Retreat"
                : isProgram(item)
                  ? "Program"
                  : "Destination"}
            </ContextMenuItem>
            <ContextMenuItem>Visit Partner Page</ContextMenuItem>
            <ContextMenuItem>View Similar</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Like</ContextMenuItem>
            <ContextMenuItem>Share</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Link>
    </div>
  );
}
