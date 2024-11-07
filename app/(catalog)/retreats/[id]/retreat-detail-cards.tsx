import { RetreatWithPrice } from "@/actions/retreat-actions";
import { RetreatInstance } from "@prisma/client";
import { BedSingle, Navigation, NotepadText, User } from "lucide-react";

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

const RETREAT_DETAILS = [
  {
    name: "Room Type",
    icon: <BedSingle />,
    detail: "",
  },
  {
    name: "Excursions",
    icon: <NotepadText />,
    detail: "",
  },
  {
    name: "Transportation",
    icon: <Navigation />,
    detail: "Car & Boat",
  },
  {
    name: "Tour Guide",
    icon: <User />,
    detail: "Not Included",
  },
] as const;

interface DetailCardProps {
  name: string;
  icon: React.ReactNode;
  detail: string;
}

function DetailCard({ name, icon, detail }: DetailCardProps) {
  return (
    <Card className="md:w-42 w-42">
      <CardHeader>
        <CardDescription className="mx-auto p-4">{icon}</CardDescription>
        <CardTitle className="mx-auto font-light">{name}</CardTitle>
      </CardHeader>
      <CardFooter className="justify-center">
        <p className="text-center">{detail}</p>
      </CardFooter>
    </Card>
  );
}

export function RetreatDetailCards() {
  return (
    <ScrollArea className="my-6 w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4 bg-blend-darken">
        {RETREAT_DETAILS.map((detail) => (
          <DetailCard key={detail.name} {...detail} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

interface BookingSelectorProps {
  type: string | null;
  userId?: string;
  retreat: RetreatWithPrice & { retreatInstances: RetreatInstance[] };
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
        userId={userId}
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
