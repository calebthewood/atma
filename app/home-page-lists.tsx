"use client";

import { useState } from "react";
import { HostWithImages } from "@/actions/host-actions";
import { PropertiesWithImages } from "@/actions/property-actions";
import { RetreatItems } from "@/actions/retreat-actions";
import { Host, Property, Retreat } from "@prisma/client";

import HeroCarousel from "@/components/ui/carousel-hero";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookingBar } from "@/components/booking-bar";
import { RetreatItem } from "@/components/retreat-item";

interface HomePageListsProps {
  retreats: RetreatItems[];
  properties: PropertiesWithImages[];
  hosts: HostWithImages[];
}

export function HomePageLists({
  retreats,
  properties,
  hosts,
}: HomePageListsProps) {
  const [searchResults, setSearchResults] = useState<
    PropertiesWithImages[] | null
  >(null);
  console.log("hosts", hosts);
  const updateResults = (list: PropertiesWithImages[]) =>
    setSearchResults(list);

  return (
    <>
      <BookingBar updateResults={updateResults} />
      {searchResults ? (
        <SearchResults list={searchResults} />
      ) : (
        <InitialPage
          retreats={retreats}
          properties={properties}
          hosts={hosts}
        />
      )}
    </>
  );
}

function SearchResults({ list }: { list: PropertiesWithImages[] }) {
  return (
    <div className="h-full px-4 py-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Search Results
          </h2>
          <p className="text-sm text-muted-foreground">
            Properties within range
          </p>
        </div>
      </div>
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {list.map((r, i) => (
              <div className="flex flex-col">
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
                <div>{r.address}</div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

const HeroSection = () => {
  const slides = [
    {
      image: "/img/iStock-1929812569.jpg",
      title: "FEATURED RETREAT OR PROGRAM",
      description:
        "10 Days of Yoga and Meditation, leave your boyfriend at home!",
      buttonText: "Explore",
    },
    {
      image: "/img/iStock-1812905796.jpg",
      title: "UPCOMING RETREAT",
      description: "Hopefully they paid us to be featured prominently.",
      buttonText: "Explore",
    },
    // Add more slides as needed
  ];

  return (
    <div className="w-full h-[600px]">
      <HeroCarousel slides={slides} />
    </div>
  );
};

function InitialPage({ retreats, properties, hosts }: HomePageListsProps) {
  return (
    <div className="mt-6">
      <HeroSection />
      <div className="h-full px-4 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Browse Retreats
            </h2>
            <p className="text-sm text-muted-foreground">
              Top picks for you. Updated daily
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
                  imgUrl={p.images[0].filePath}
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
          <h2 className="text-2xl font-semibold tracking-tight">Partners</h2>
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
                    imgUrl={h.images[0].filePath}
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
      </div>
    </div>
  );
}
