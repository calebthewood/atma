"use client";

import { RetreatWithRelations } from "@/actions/retreat-actions";
import {
  BedSingle,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  NotepadText,
  User,
  Users,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FixedBooking } from "@/components/booking/fixed-booking";
import { FlexibleBooking } from "@/components/booking/flexible-booking";
import { OpenBooking } from "@/components/booking/open-booking";

// ============================================================================
// Types
// ============================================================================

interface DetailCardProps {
  name: string;
  icon: React.ReactNode;
  value: string;
}

interface RetreatDetailCardsProps {
  retreat: RetreatWithRelations;
}

interface BookingSelectorProps {
  type: string | null;
  userId?: string;
  retreat: RetreatWithRelations;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatGroupSize(min: number | null, max: number | null): string {
  if (!min && !max) return "Contact for details";
  if (!max || max < 0) return `${min || 1}+ guests`;
  if (min === max) return `${min} guests`;
  return `${min || 1} - ${max} guests`;
}

function formatLocation(
  city: string | null | undefined,
  country: string | null | undefined
): string {
  if (!city && !country) return "Contact for details";
  return [city, country].filter(Boolean).join(", ");
}

// ============================================================================
// Components
// ============================================================================

function DetailCard({ name, icon, value }: DetailCardProps) {
  return (
    <Card className="w-[250px]">
      <CardHeader>
        <CardDescription className="mx-auto p-4">{icon}</CardDescription>
        <CardTitle className="mx-auto font-light">{name}</CardTitle>
      </CardHeader>
      <CardFooter className="justify-center">
        <p className="text-center text-sm text-muted-foreground">{value}</p>
      </CardFooter>
    </Card>
  );
}

export function RetreatDetailCards({ retreat }: RetreatDetailCardsProps) {
  const details = [
    {
      name: "Date",
      icon: <Calendar className="h-6 w-6" />,
      value: retreat?.date?.toLocaleDateString() ?? "Flexible Dates",
    },
    {
      name: "Duration",
      icon: <Clock className="h-6 w-6" />,
      value: retreat?.duration || "Contact for details",
    },
    {
      name: "Group Size",
      icon: <Users className="h-6 w-6" />,
      value: formatGroupSize(retreat?.minGuests, retreat?.maxGuests),
    },
    {
      name: "Room Type",
      icon: <BedSingle className="h-6 w-6" />, // @ts-ignore
      value: retreat.property?.rooms?.[0]?.type || "Contact for details",
    },
    {
      name: "Location",
      icon: <MapPin className="h-6 w-6" />,
      value: formatLocation(retreat.property?.city, retreat.property?.country),
    },
    {
      name: "Transportation",
      icon: <Navigation className="h-6 w-6" />,
      value: retreat?.transportationAndParking || "Contact for details",
    },
    {
      name: "Excursions",
      icon: <NotepadText className="h-6 w-6" />,
      value: "Available - Contact for details",
    },
    {
      name: "Guide",
      icon: <User className="h-6 w-6" />,
      value: retreat?.host?.name || "Contact for details",
    },
  ];

  return (
    <ScrollArea className="my-6 w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4 bg-blend-darken">
        {details.map((detail) => (
          <DetailCard key={detail.name} {...detail} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function BookingSelector({
  type,
  userId,
  retreat,
}: BookingSelectorProps) {
  if (!type) return null;

  const bookingTypes = {
    Open: () => (
      <OpenBooking
        userId={userId}
        retreat={retreat}
        events={retreat.retreatInstances}
      />
    ),
    Fixed: () => (
      <FixedBooking
        userId={userId} // @ts-ignore
        retreat={retreat}
        event={retreat.retreatInstances[0]}
      />
    ),
    Flexible: () => (
      <FlexibleBooking
        userId={userId}
        retreat={retreat}
        events={retreat.retreatInstances}
      />
    ),
  } as const;

  const BookingComponent = bookingTypes[type as keyof typeof bookingTypes];
  return BookingComponent ? <BookingComponent /> : null;
}
