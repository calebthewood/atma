import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRetreatImages } from "@/actions/image-actions";
import { getRetreatWithPrice } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { LoadingSpinner } from "@/components/loading-spinner";
import { TitleImageBanner } from "@/components/title-img-banner";

import { BookingSelector, RetreatDetailCards } from "./retreat-detail-cards";

const DEFAULT_SLIDES = [
  "/img/iStock-1929812569.jpg",
  "/img/iStock-1812905796.jpg",
  "/img/iStock-1550112895.jpg",
  "/img/iStock-1507078404.jpg",
  "/img/iStock-1490140364.jpg",
  "/img/iStock-1291807006.jpg",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RetreatPage(props: PageProps) {
  const params = await props.params;

  const [retreat, images, session] = await Promise.all([
    getRetreatWithPrice(params.id),
    getRetreatImages(params.id),
    auth(),
  ]);

  if (!retreat) {
    notFound();
  }

  const [title, subtitle] = retreat.name?.split("|") ?? [];
  const coverImage = images[0]?.filePath || DEFAULT_SLIDES[4];
  const imageSlides =
    images.length > 0 ? images.map((img) => img.filePath) : DEFAULT_SLIDES;
  console.log("Booking type   ", retreat.bookingType);
  return (
    <div className="mt-4 h-auto min-h-screen">
      <TitleImageBanner title={title} subtitle={subtitle} href={coverImage} />
      <div className="p-0 md:container">
        <RetreatDetailCards />

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <div className="my-12">
            <ThumbnailCarousel slides={imageSlides} />
          </div>
        </Suspense>

        <div className="flex flex-row flex-wrap justify-center gap-x-4">
          <RetreatDescription copy={retreat.desc} />
          <div className="mb-16 max-w-md">
            <BookingSelector
              type={retreat.bookingType}
              userId={session?.user?.id}
              retreat={retreat}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RetreatDescription({ copy }: { copy: string | null }) {
  if (copy === null) return null;
  return (
    <div className="max-w-lg text-lg">
      <p className="my-4 p-2">{copy}</p>
    </div>
  );
}
