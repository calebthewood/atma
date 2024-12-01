"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getProgram,
  type ActionResponse,
  type ProgramWithRelations,
} from "@/actions/program-actions";
import {
  getPropertyWithId,
  PropertyWithRelations,
} from "@/actions/property-actions";
import { getRetreat, RetreatWithRelations } from "@/actions/retreat-actions";
import { Host, Program, Property, Retreat } from "@prisma/client";
import { CirclePlus } from "lucide-react";

import { cn } from "@/lib/utils";
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
const rIsx = 0;
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
            <div className="overflow-hidden rounded-md">
              <Image
                src={imgUrl ?? imagePaths[rIsx]}
                alt={retreat.name || "n/a"}
                width={width}
                height={height}
                className={cn(
                  "size-auto object-cover transition-all hover:scale-105",
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
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{retreat.name}</h3>
        {/* <p className="text-xs text-muted-foreground">{retreat?.desc}</p> */}
      </div>
    </div>
  );
}

interface LazyRetreatCardProps {
  id: string;
  aspectRatio?: "portrait" | "square";
  width: number;
  height: number;
  className?: string;
  segment: "retreats" | "destinations" | "programs" | "hosts";
}
type ItemType =
  | RetreatWithRelations
  | PropertyWithRelations
  | ProgramWithRelations;

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
            if (response.success) setItem(response.retreat);
            break;
          case "destinations":
            response = await getPropertyWithId(id);
            if (response.success) setItem(response.property);
            break;
          case "programs":
            response = await getProgram(id); // Using the new getProgram action
            if (response.success && response.data) {
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

  if (isLoading) {
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

  if (!item) return null;

  // Type guards
  const isRetreat = (item: ItemType): item is RetreatWithRelations => {
    return "retreatInstances" in item;
  };

  const isProgram = (item: ItemType): item is ProgramWithRelations => {
    return "duration" in item;
  };

  // Get display data based on item type
  const displayData = {
    name: item.name || "Unnamed",
    image:
      item.images[0]?.filePath ||
      imagePaths[Math.floor(Math.random() * imagePaths.length)],
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
    <div className={cn("space-y-3", className)} {...props}>
      <Link href={`/${segment}/${id}`}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="overflow-hidden rounded-md">
              <Image
                src={displayData.image}
                alt={displayData.name}
                width={width}
                height={height}
                className={cn(
                  "size-auto object-cover transition-all hover:scale-105",
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
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{displayData.name}</h3>
        <p className="text-xs text-muted-foreground">
          {displayData.city && displayData.country
            ? `${displayData.city}, ${displayData.country}`
            : "Location unavailable"}
        </p>
      </div>
    </div>
  );
}
