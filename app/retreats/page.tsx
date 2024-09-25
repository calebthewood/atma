import { getRetreats } from "@/actions/retreat-actions";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RetreatItem } from "@/components/retreat-item";

export default async function Page() {
  const retreats = await getRetreats();

  return (
    <div className="h-full px-4 py-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Browse Retreats
          </h2>
          <p className="text-sm text-muted-foreground">
            Finest retreats for all that ailes you
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {retreats.map((r, i) => (
              <RetreatItem
                key={r.name + `${i * 3.7}`}
                retreat={r}
                imgUrl={r.images[0].filePath}
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
      <div className="flex items-center justify-between mt-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Retreats Near You
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
            {retreats.map((r, i) => (
              <RetreatItem
                key={r.name + `${i * 3.7}`}
                retreat={r}
                imgUrl={r.images[0].filePath}
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
      <div className="flex items-center justify-between mt-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            New York Based Retreats
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse retreats situated in and around London
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {retreats
              .filter((r) => r.property.city?.toLowerCase().includes("york"))
              .map((r, i) => (
                <RetreatItem
                  key={r.name + `${i * 3.7}`}
                  retreat={r}
                  imgUrl={r.images[0].filePath}
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
