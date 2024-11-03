import React from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ClickyCounterProps {
  incrementor: (val: any) => void;
  decrementor: (val: any) => void;
  count: number;
}

export function ClickyCounter({
  incrementor,
  decrementor,
  count,
}: ClickyCounterProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">Guest Count</span>
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={decrementor}
          disabled={count === 0}
        >
          <Minus className="size-4" />
        </Button>
        <span className="text-lg font-bold">{count}</span>
        <Button size="sm" variant="outline" onClick={incrementor}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
