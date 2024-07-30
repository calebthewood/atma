import { Metadata } from "next";
import Image from "next/image";
import { CirclePlus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { AlbumArtwork } from "@/components/album-artwork";

import { listenNowAlbums, madeForYouAlbums } from "./data/albums";


export const metadata: Metadata = {
  title: "atma reserve",
  description: "Wellness retreat marketplace",
};

export default async function MusicPage() {
  const session = await auth();
  return (
    <div className="hidden md:block">
      <div className="border-t">
        <div className="bg-background">
          <div className="grid grid-cols-5">
            <div className="col-start-2 col-end-5 lg:border">
              <div className="h-full px-4 py-6 lg:px-8">
                <Tabs defaultValue="retreats" className="h-full space-y-6">
                  <div className="space-between flex items-center">
                    <TabsList>
                      <TabsTrigger value="retreats" className="relative">Retreats</TabsTrigger>
                      <TabsTrigger value="other" disabled>Other</TabsTrigger>
                      <TabsTrigger value="misc" disabled> Options</TabsTrigger>
                    </TabsList>
                    <div className="ml-auto mr-4">
                      <Button>
                        {session?.user?.name || 'Sign in'}
                      </Button>
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
                          {listenNowAlbums.map((album) => (
                            <AlbumArtwork
                              key={album.name}
                              album={album}
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
                          {madeForYouAlbums.map((album) => (
                            <AlbumArtwork
                              key={album.name}
                              album={album}
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
                          {madeForYouAlbums.map((album) => (
                            <AlbumArtwork
                              key={album.name}
                              album={album}
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
                  </TabsContent>

                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}