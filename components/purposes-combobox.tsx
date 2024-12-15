"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const buttonClasses =
  "h-12 pb-0 w-full rounded rounded-b-none border-b-2 border-transparent border-b-black bg-transparent text-left shadow-none px-0";

export function PurposeCombobox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    const purposes = searchParams.get("purpose")?.split(",") || [];
    return purposes.filter(Boolean);
  });

  const categories = [
    "Ayurveda",
    "Couples & Relationships",
    "Creative & Artistic",
    "Detox & Cleanse",
    "Detoxification",
    "Emotional Healing",
    "Family & Group Wellness",
    "Fitness & Active",
    "Healthy Aging",
    "Holistic Wellness & Longevity",
    "Hydrotherapy",
    "Luxury Adventure",
    "Medical Wellness",
    "Meditation",
    "Mental Health & Emotional Wellness",
    "Mindfulness",
    "Motherhood",
    "Nutrition & Wellness Coaching",
    "Optimal Weight",
    "Relaxation",
    "Sleep & Restorative Wellness",
    "Spa",
    "Spiritual & Self-Discovery",
    "Traditional Healing",
    "Therapeutic Fasting",
  ];

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedItems.length > 0) {
      params.set("purpose", selectedItems.join(","));
    } else {
      params.delete("purpose");
    }
    router.replace(`?${params.toString()}`);
  }, [selectedItems, router, searchParams]);

  const toggleItem = (item: string) => {
    setSelectedItems((current) => {
      if (current.includes(item)) {
        return current.filter((i) => i !== item);
      }
      return [...current, item];
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={buttonClasses}
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-base">PURPOSE</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search purposes..."
            className="h-9 border-transparent"
          />
          <CommandList>
            <CommandEmpty>No purpose found.</CommandEmpty>
            {selectedItems.length > 0 && (
              <>
                <CommandGroup heading="Selected">
                  {selectedItems.map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={() => toggleItem(item)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {item}
                      <X
                        className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(item);
                        }}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup heading="All Purposes">
              {categories
                .filter((category) => !selectedItems.includes(category))
                .map((category) => (
                  <CommandItem
                    key={category}
                    value={category}
                    onSelect={() => {
                      toggleItem(category);
                      setOpen(true);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                    {category}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
