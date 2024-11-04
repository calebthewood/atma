import Image from "next/image";
import { getProgramById } from "@/actions/program-actions";
import { getRetreatById } from "@/actions/retreat-actions";
import { auth } from "@/auth";
import { BedSingle, Navigation, NotepadText, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { FixedBooking } from "@/components/booking/fixed-booking";
import { FlexibleBooking } from "@/components/booking/flexible-booking";
import { OpenBooking } from "@/components/booking/open-booking";
import { LoadingSpinner } from "@/components/loading-spinner";
import { TitleImageBanner } from "@/components/title-img-banner";
import { H1 } from "@/components/typography";

const SLIDES = [
  "/img/iStock-1929812569.jpg",
  "/img/iStock-1812905796.jpg",
  "/img/iStock-1550112895.jpg",
  "/img/iStock-1507078404.jpg",
  "/img/iStock-1490140364.jpg",
  "/img/iStock-1291807006.jpg",
];

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const program = await getProgramById(params.id);
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

  // function RenderBookingType({ type }: { type: string }) {
  //   switch (type) {
  //     case "open":
  //       return (
  //         <OpenBooking
  //           userId={session?.user?.id}
  //           retreat={retreat}
  //           events={retreat.retreatInstances}
  //         />
  //       );
  //     case "fixed_range":
  //       return (
  //         <FixedBooking
  //           userId={session?.user?.id}
  //           retreat={retreat}
  //           event={retreat.retreatInstances[0]}
  //         />
  //       );
  //     case "flexible_range":
  //       return (
  //         <FlexibleBooking
  //           userId={session?.user?.id}
  //           retreat={retreat}
  //           events={retreat.retreatInstances}
  //         />
  //       );
  //     default:
  //       return null;
  //   }
  // }

  if (!program) {
    return (
      <>
        <LoadingSpinner /> Loading...
      </>
    );
  }
  // move this default to a general config? maybe not needed even.
  const coverImgPath =
    program?.property?.images[0]?.filePath || "/img/iStock-1490140364.jpg";

  const [title, subtitle] = program?.name?.split("|") ?? [];

  return (
    <div className="mt-4 h-auto min-h-screen">
      <TitleImageBanner title={title} subtitle={subtitle} href={coverImgPath} />
      <div className="container">
        <div className="flex justify-center gap-6 py-12">
          {details.map((d, i) => (
            <RetreatDescCard key={d.name} desc={d} />
          ))}
        </div>
        <div className="my-12">
          <ThumbnailCarousel
            slides={program.property?.images.map((i) => i.filePath)}
          />
        </div>
        <div className="grid grid-cols-12">
          <div className="col-span-4 col-start-2 text-lg">
            <p className="my-4">{program.desc}</p>
          </div>
          <div className="col-span-5 col-start-7 mb-16">
            {/* <RenderBookingType type={retreat.bookingType} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function RetreatDescCard({
  desc,
}: {
  desc: { name: string; icon: any; detail: string };
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
