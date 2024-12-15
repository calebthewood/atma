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

const buttonClasses =
  "h-12 pb-0 w-full rounded rounded-b-none border-b-2 border-transparent border-b-black bg-transparent text-left shadow-none px-0";

export function PurposeCombobox() {
  const [open, setOpen] = useState(false);
  const [purpose, setPurpose] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

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
            PURPOSES
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-4">
        Something to go here.
      </PopoverContent>
    </Popover>
  );
}
