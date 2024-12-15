"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ClickyCounter } from "../counter";

const buttonClasses =
  "h-12 pb-0 w-full rounded rounded-b-none border-b-2 border-transparent border-b-black bg-transparent text-left shadow-none px-0";

export function GuestCombobox() {
  const [open, setOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const guestParam = searchParams.get("guests");
    if (guestParam) {
      setGuestCount(parseInt(guestParam, 10));
    }
  }, [searchParams]);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (guestCount > 0) {
      current.set("guests", guestCount.toString());
    } else {
      current.delete("guests");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${window.location.pathname}${query}`, { scroll: false });
  }, [guestCount, router, searchParams]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={buttonClasses}
        >
          <span className="flex w-full items-center justify-between text-base">
            {guestCount > 0
              ? `${guestCount} GUEST${guestCount > 1 ? "S" : ""}`
              : "GUESTS"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-4">
        <ClickyCounter />
      </PopoverContent>
    </Popover>
  );
}
