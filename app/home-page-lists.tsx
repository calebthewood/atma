'use client';
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RetreatItem } from "@/components/retreat-item";
import { Host, Property, Retreat } from "@prisma/client";
import { BookingBar } from "@/components/booking-bar";

interface HomePageListsProps {
    retreats: Retreat[];
    properties: Property[];
    hosts: Host[];
}

export function HomePageLists({ retreats, properties, hosts }: HomePageListsProps) {
    const [searchResults, setSearchResults] = useState<Property[] | null>(null);

    const updateResults = (list: Property[]) => setSearchResults(list);

    return (
        <>
            <BookingBar updateResults={updateResults} />
            {searchResults
                ? <SearchResults list={searchResults} />
                : <InitialPage retreats={retreats} properties={properties} hosts={hosts} />}
        </>
    );
}

function SearchResults({ list }: { list: Property[]; }) {

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


function InitialPage({ retreats, properties, hosts }: HomePageListsProps) {
    return (
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
    );
}