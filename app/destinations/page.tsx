import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RetreatItem } from "@/components/retreat-item";
import { getProperties } from "@/actions/property-actions";
import { Separator } from "@/components/ui/separator";

export default async function Page() {
  const properties = await getProperties();

  return (
    <div className="h-full px-4 py-6 lg:px-8">
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
              <RetreatItem
                key={r.name + `${i * 3.7}`}
                retreat={r}
                imgUrl={r.images[0].filePath}
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
      <div className="flex items-center justify-between mt-8">
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
              <RetreatItem
                key={r.name + `${i * 3.7}`}
                retreat={r}
                imgUrl={r.images[0].filePath}
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
      <div className="flex items-center justify-between mt-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            London Based Destinations
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse Properties situated in and around London
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {properties.filter(p => p.city?.toLowerCase().includes('london')).map((r, i) => (
              <RetreatItem
                key={r.name + `${i * 3.7}`}
                retreat={r}
                imgUrl={r.images[0].filePath}
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
    </div>

  );
}
