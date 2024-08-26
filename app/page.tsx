import { Metadata } from "next";
import Image from "next/image";
import { getHosts } from "@/actions/host-actions";
import { getProperties } from "@/actions/property-actions";
import { getRetreats } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/loading-spinner";
import { RetreatItem } from "@/components/retreat-item";

export const metadata: Metadata = {
  title: "atma reserve",
  description: "Unleash your potential",
};

export default async function Page() {
  const session = await auth();
  const hosts = await getHosts();
  const properties = await getProperties();
  const retreats = await getRetreats();

  return (
    <div className="container">
      <div className="h-full px-4 py-6 lg:px-8">
        <Tabs defaultValue="retreats" className="h-full space-y-6">
          <div className="space-between flex items-center">
            <TabsList>
              <TabsTrigger value="retreats" className="relative">
                Retreats
              </TabsTrigger>
              <TabsTrigger value="other" disabled>
                Other
              </TabsTrigger>
              <TabsTrigger value="misc" disabled>
                {" "}
                Options
              </TabsTrigger>
            </TabsList>
            <div className="ml-auto mr-4">
              <Button>{session?.user?.name || "Sign in"}</Button>
            </div>
          </div>
          <TabsContent
            value="retreats"
            className="border-none p-0 outline-none"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Browse Retreats
                </h2>
                <p className="text-sm text-muted-foreground">
                  Top picks for you. Updated daily.
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
            <div className="mt-6 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Destinations
              </h2>
              <p className="text-sm text-muted-foreground">
                Luxury locations, worldwide.
              </p>
            </div>
            <Separator className="my-4" />
            <div className="relative">
              <ScrollArea>
                <div className="flex space-x-4 pb-4">
                  {properties.map((p, i) => (
                    <RetreatItem
                      key={p.name + `${i * 2}`}
                      retreat={p}
                      segment="destinations"
                      className="w-[150px]"
                      aspectRatio="square"
                      width={150}
                      height={150}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            <div className="mt-6 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Partners
              </h2>
              <p className="text-sm text-muted-foreground">
                Resorts, Hotels, and Indepenant partners
              </p>
            </div>
            <Separator className="my-4" />
            <div className="relative">
              <ScrollArea>
                <div className="flex space-x-4 pb-4">
                  {hosts
                    .map((h, i) => (
                      <RetreatItem
                        key={h.name + `${i * 2.3}`}
                        retreat={h}
                        segment="partners"
                        className="w-[150px]"
                        aspectRatio="square"
                        width={150}
                        height={150}
                      />
                    ))
                    .reverse()}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
