"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ClickyCounter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get maxGuests from URL or default to 10
  const maxGuests = parseInt(searchParams.get("maxGuests") || "16");

  // Initialize count state from URL or default to 1
  const [count, setCount] = useState(() => {
    const urlCount = searchParams.get("guests");
    return urlCount ? Math.min(parseInt(urlCount), maxGuests) : 1;
  });

  // Update URL when count changes
  const updateURL = useCallback(
    (newCount: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("guests", newCount.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Handle increment
  const handleIncrement = useCallback(() => {
    if (count < maxGuests) {
      setCount((prev) => prev + 1);
    }
  }, [count, maxGuests]);

  // Handle decrement
  const handleDecrement = useCallback(() => {
    if (count > 1) {
      setCount((prev) => prev - 1);
    }
  }, [count]);

  // Update URL whenever count changes
  useEffect(() => {
    updateURL(count);
  }, [count, updateURL]);

  return (
    <div className="flex w-full items-center justify-between">
      <span className="text-sm font-medium">Guest Count</span>
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDecrement}
          disabled={count <= 1}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-8 text-center text-lg font-bold">{count}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleIncrement}
          disabled={count >= maxGuests}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
