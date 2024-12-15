import { Suspense } from "react";
import { getRetreats } from "@/actions/retreat-actions";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyRetreatItem } from "@/components/retreat-item";

interface RetreatListProps {
  title: string;
  description?: string;
  items: Array<{
    id: string;
    name: string | null;
    property: {
      images: Array<{ filePath: string }>;
    };
  }>;
  className?: string;
}

function RetreatList({
  title,
  description,
  items,
  className,
}: RetreatListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {items.map((retreat) => (
              <LazyRetreatItem
                key={retreat.id}
                id={retreat.id}
                segment="retreats"
                className="w-[250px]"
                aspectRatio="portrait"
                width={250}
                height={330}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

function RetreatListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-portrait h-[330px] w-[250px] rounded-lg"
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

export default async function RetreatsPage() {
  const retreatsResponse = await getRetreats();

  if (!retreatsResponse.success) {
    throw new Error(retreatsResponse.error);
  }

  const retreats = retreatsResponse.data ?? [];
  const popularRetreats = retreats.slice(0, 10);
  const newRetreats = [...retreats]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  // Filter for NY retreats - assuming city is part of the property data
  const nyRetreats = retreats
    .filter((retreat) => retreat.property?.city?.toLowerCase().includes("york"))
    .slice(0, 10);

  return (
    <div className="container space-y-8 px-4 py-6 lg:px-8">
      <Suspense fallback={<RetreatListSkeleton />}>
        <RetreatList
          title="Popular Retreats"
          description="Most booked retreats this month" //@ts-ignore
          items={popularRetreats}
        />
      </Suspense>

      <Suspense fallback={<RetreatListSkeleton />}>
        <RetreatList
          title="New Arrivals"
          description="Fresh wellness experiences to explore" //@ts-ignore
          items={newRetreats}
        />
      </Suspense>

      {nyRetreats.length > 0 && (
        <Suspense fallback={<RetreatListSkeleton />}>
          <RetreatList
            title="New York Retreats"
            description="Wellness experiences in the Big Apple" //@ts-ignore
            items={nyRetreats}
          />
        </Suspense>
      )}
    </div>
  );
}
