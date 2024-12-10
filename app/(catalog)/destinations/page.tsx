import { getPropertyIds } from "@/actions/property-actions";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LazyRetreatItem } from "@/components/retreat-item";

export default async function Page() {
  const properties = await getPropertyIds();

  return (
    <div className="container h-full py-6 md:px-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Browse Destinations
          </h2>
          <p className="text-sm text-muted-foreground">
            Retreats held at the finest locales around the world.
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {properties.map((r, i) => (
              <LazyRetreatItem
                key={i + r.id}
                id={r.id}
                segment="destinations"
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
      <div className="mt-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Destinations Near You
          </h2>
          <p className="text-sm text-muted-foreground">
            This is not currently implemented.
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {properties.map((r, i) => (
              <LazyRetreatItem
                key={i * 1.23 + r.id}
                id={r.id}
                segment="destinations"
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
      {/* <div className="mt-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            London Based Destinations
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse Properties situated in and around London
          </p>
        </div>
      </div> */}
      <Separator className="my-4" />
      <div className="relative">
        {/* <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {properties
              .filter((p) => p.city?.toLowerCase().includes("london"))
              .map((r, i) => (
                <LazyRetreatItem
                  key={i + r.id}
                  id={r.id}
                  segment="destinations"
                  className="w-[250px]"
                  aspectRatio="portrait"
                  width={250}
                  height={330}
                />
              ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea> */}
      </div>
    </div>
  );
}
