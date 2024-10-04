"use select";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GuestSelectProps {
  guestCount: number | undefined;
  handleGuests: (val: string) => void;
  minGuests: number;
  maxGuests: number;
}

export function GuestSelect({
  guestCount,
  handleGuests,
  minGuests,
  maxGuests,
}: GuestSelectProps) {
  const arrayRange = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, index) => {
      const value = start + index * step;
      const name = value === 1 ? "Guest" : "Guests";
      return { name: `${value} ${name}`, value: String(value) };
    });

  const guests = arrayRange(minGuests, maxGuests, 1);

  return (
    <Select onValueChange={handleGuests}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="How many guests?" />
      </SelectTrigger>
      <SelectContent>
        {guests.map((g) => (
          <SelectItem key={g.name} value={g.value}>
            {g.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function GuestPlaceholder() {
  return (
    <div className="w-full text-start">
      <div className="font-title text-xs">{"GUESTS"}</div>
      <div className="font-tagline font-light text-xs text-richBeige/70">
        {"SELECT GUESTS"}
      </div>
    </div>
  );
}
