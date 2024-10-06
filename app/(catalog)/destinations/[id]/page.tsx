import Image from "next/image";
import { getPropertyById } from "@/actions/property-actions";
import { auth } from "@/auth";
import { BedSingle, Navigation, NotepadText, User } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { CatalogTabs } from "@/components/catalog-tabs";
import { LoadingSpinner } from "@/components/loading-spinner";
import { H1 } from "@/components/typography";



export default async function Page({ params }: { params: { id: string; }; }) {
  const property = await getPropertyById(params.id);
  const session = await auth();
  const details = [
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
  ];

  const tabsData = [
    {
      value: "healing",
      label: "Healing",
      content: <div>{property?.amenityHealing}</div>,
    },
    {
      value: "cuisine",
      label: "Cuisine",
      content: <div>{property?.amenityCuisine}</div>,
    },
    {
      value: "activity",
      label: "Activity",
      content: <div>{property?.amenityActivity}</div>,
    },
    {
      value: "facility",
      label: "Amenities",
      content: <div>{property?.amenityFacility}</div>,
    },
  ];
  // function RenderBookingType({ type }: { type: string; }) {
  //   switch (type) {
  //     case "open":
  //       return (
  //         <OpenBooking
  //           userId={session?.user?.id}
  //           retreat={property}
  //           events={property.retreatInstances}
  //         />
  //       );
  //     case "fixed_range":
  //       return (
  //         <FixedBooking
  //           userId={session?.user?.id}
  //           retreat={property}
  //           event={property.retreatInstances[0]}
  //         />
  //       );
  //     case "flexible_range":
  //       return (
  //         <FlexibleBooking
  //           userId={session?.user?.id}
  //           retreat={property}
  //           events={property.retreatInstances}
  //         />
  //       );
  //     default:
  //       return null;
  //   }
  // }

  if (!property) {
    return (
      <>
        <LoadingSpinner /> Loading...
      </>
    );
  }

  const coverImgPath =
    property?.coverImg ||
    property?.images[0].filePath ||
    "/img/iStock-1490140364.jpg"; // move this default to a general config? maybe not needed even.
  return (
    <div className="mt-4 h-auto min-h-screen">
      <div className="relative flex h-3/4 min-h-[500px] flex-col justify-end bg-muted p-10 text-white dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <Image
          priority
          // placeholder="blur"
          sizes="100vw"
          alt="destination cover photo"
          src={coverImgPath}
          style={{
            objectFit: "cover",
            objectPosition: "center"
          }}
          fill={true}
        />
        <div className="relative -left-10 z-20 w-1/2 rounded-r bg-primary/10 pl-10 pr-4 backdrop-blur-sm">
          <div className="flex items-center text-lg font-medium">
            {property.descShort}
          </div>
          <div className="w-min text-nowrap">
            <blockquote className="space-y-2">
              <H1>{property.name}</H1>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="flex justify-center gap-6 py-12">
          {details.map((d, i) => (
            <RetreatDescCard key={d.name} desc={d} />
          ))}
        </div>
        <div className="my-12">
          <ThumbnailCarousel slides={property.images.map(img => img.filePath)} />
        </div>
        <div className="grid grid-cols-12">
          <div className="col-span-4 col-start-2 text-lg">
            <CatalogTabs tabs={tabsData} defaultTab="healing" />
          </div>
          <div className="col-span-5 col-start-7 mb-16">
            {/* <RenderBookingType type={property.bookingType} /> */}

            <AspectRatio
              ratio={3 / 4}
              className="rounded border bg-[url('/img/gifnoise.gif')] opacity-20"
            >
              <div className="size-full rounded bg-white/20 p-2 shadow backdrop-blur"></div>
            </AspectRatio>
          </div>
        </div>
      </div>
    </div>
  );
}

function RetreatDescCard({
  desc,
}: {
  desc: { name: string; icon: any; detail: string; };
}) {
  return (
    <Card className="w-56">
      <CardHeader>
        <CardDescription className="mx-auto p-4">{desc.icon}</CardDescription>
        <CardTitle className="mx-auto font-light">{desc.name}</CardTitle>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="justify-center">
        <p className="text-center">{desc.detail}</p>
      </CardFooter>
    </Card>
  );
}
