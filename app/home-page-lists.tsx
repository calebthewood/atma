"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LazyRetreatItem } from "@/components/retreat-item";

type ListItem = {
  id: string;
  type: "retreat" | "program" | "destination" | "host";
};

interface ScrollableListProps {
  title: string;
  description?: string;
  items: ListItem[];
  aspectRatio?: "portrait" | "square" | "landscape";
  width: number;
  height: number;
  className?: string;
}

export function ScrollableList({
  title,
  description,
  items,
  aspectRatio,
  width,
  height,
  className,
}: ScrollableListProps) {
  const getSegment = (type: ListItem["type"]) => {
    const segmentMap = {
      retreat: "retreats",
      program: "programs",
      destination: "destinations",
      host: "hosts",
    };
    return segmentMap[type];
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-4xl leading-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {items.map((item, index) => (
              <LazyRetreatItem
                key={`${item.type}-${item.id}-${index}`}
                id={item.id}
                segment={getSegment(item.type)}
                className={className ?? `w-[${width}px] h-auto `}
                aspectRatio={aspectRatio}
                width={width}
                height={height}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

interface HomePageListsProps {
  sections: {
    title: string;
    description?: string;
    items: ListItem[];
    aspectRatio?: "portrait" | "square" | "landscape";
    width: number;
    height: number;
    className?: string;
  }[];
}

export function HomePageLists({ sections }: HomePageListsProps) {
  return (
    <div className="mt-6">
      <div className="h-full px-4 py-6 lg:px-8">
        {sections.map((section, index) => (
          <div key={index} className="mb-8">
            <ScrollableList {...section} />
          </div>
        ))}
      </div>
    </div>
  );
}
