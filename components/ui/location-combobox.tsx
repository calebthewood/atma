"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Plus, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";


const frameworks = [
    {
        value: "next.js",
        label: "Next.js",
    },
    {
        value: "sveltekit",
        label: "SvelteKit",
    },
    {
        value: "nuxt.js",
        label: "Nuxt.js",
    },
    {
        value: "remix",
        label: "Remix",
    },
    {
        value: "astro",
        label: "Astro",
    },
];

export function LocationCombobox() {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] pl-2 justify-between bg-transparent border-transparent"
                >
                    {value
                        ? frameworks.find((framework) => framework.value === value)?.label
                        : <Placeholder title='LOCATION' subtitle='CITY, COUNTRY OR PROPERTY' />}
                    {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function Placeholder({ title, subtitle }: { title: string; subtitle: string; }) {
    return (
        <div className="w-full text-start">
            <div className="font-title text-xs">{title}</div>
            <div className="font-tagline font-light text-xs text-rich-white/70">{subtitle}</div>
        </div>
    );
}

export function GuestCombobox() {
    const [open, setOpen] = useState(false);
    const [guestCount, setGuestCount] = useState(0);

    const incrementGuests = () => setGuestCount(prev => prev + 1);
    const decrementGuests = () => setGuestCount(prev => Math.max(0, prev - 1));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] pl-2 justify-between bg-transparent border-transparent"
                >
                    {guestCount > 0 ? (
                        <span className="flex flex-col items-start">
                            <span className="text-sm font-medium">GUESTS</span>
                            <span className="text-xs">{guestCount} guest{guestCount !== 1 ? 's' : ''}</span>
                        </span>
                    ) : (
                        <Placeholder title='GUESTS' subtitle='ADD GUESTS' />
                    )}
                    {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Guest Count</span>
                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={decrementGuests}
                            disabled={guestCount === 0}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-bold">{guestCount}</span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={incrementGuests}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}