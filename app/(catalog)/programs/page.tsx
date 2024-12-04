import { Suspense } from "react";
import { Metadata } from "next";
import { getPrograms } from "@/actions/program-actions";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyRetreatItem } from "@/components/retreat-item";

interface ProgramListProps {
  title: string;
  description?: string;
  items: Array<{
    id: string;
    name: string | null;
    property?: { name: string } | null;
  }>;
  className?: string;
}

function ProgramList({
  title,
  description,
  items,
  className,
}: ProgramListProps) {
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
            {items.map((program) => (
              <LazyRetreatItem
                key={program.id}
                id={program.id}
                segment="programs"
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

function ProgramListSkeleton() {
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

export default async function ProgramsPage() {
  const programsResponse = await getPrograms();

  if (!programsResponse.success) {
    throw new Error(programsResponse.error);
  }

  const programs = programsResponse.data ?? [];

  // Get featured programs (first 10)
  const featuredPrograms = programs.slice(0, 10);

  // Get newest programs
  const newPrograms = [...programs]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  // Get programs by property (take first 10 properties)
  const propertyPrograms = programs
    .filter((program) => program.property?.name)
    .slice(0, 10);

  return (
    <div className="space-y-8 px-4 py-6 lg:px-8">
      <Suspense fallback={<ProgramListSkeleton />}>
        <ProgramList
          title="Featured Programs"
          description="Our most popular wellness programs"
          items={featuredPrograms}
        />
      </Suspense>

      <Suspense fallback={<ProgramListSkeleton />}>
        <ProgramList
          title="New Programs"
          description="Latest additions to our wellness collection"
          items={newPrograms}
        />
      </Suspense>

      <Suspense fallback={<ProgramListSkeleton />}>
        <ProgramList
          title="Property Programs"
          description="Programs at our featured properties"
          items={propertyPrograms}
        />
      </Suspense>
    </div>
  );
}
