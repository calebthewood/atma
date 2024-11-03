import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRetreatImages } from "@/actions/image-actions";
import { getRetreatWithPrice } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { LoadingSpinner } from "@/components/loading-spinner";
import { BookingSelector } from "./retreat-detail-cards";
import { RetreatDetailCards } from "./retreat-detail-cards";
import { TitleImageBanner } from "@/components/title-img-banner";

const DEFAULT_SLIDES = [
  "/img/iStock-1929812569.jpg",
  "/img/iStock-1812905796.jpg",
  "/img/iStock-1550112895.jpg",
  "/img/iStock-1507078404.jpg",
  "/img/iStock-1490140364.jpg",
  "/img/iStock-1291807006.jpg",
] as const;

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

  return (
    <div className="mt-4 h-auto min-h-screen">
      <TitleImageBanner title={title} subtitle={subtitle} href={coverImage} />
      <div className="container">
        <RetreatDetailCards />

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <div className="my-12">
            <ThumbnailCarousel slides={imageSlides} />
          </div>
        </Suspense>

        <div className="flex flex-row gap-x-4">
          <RetreatDescription />
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

function RetreatDescription() {
  return (
    <div className="text-lg">
      <p className="my-4">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga iste,
        repudiandae ipsam exercitationem reiciendis ea cumque corporis magni
        ipsum architecto nobis? Nihil libero rem cum dolorem quas ratione a
        fuga.
      </p>
      <p className="my-4">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga iste,
        repudiandae ipsam exercitationem reiciendis ea cumque corporis magni
        ipsum architecto nobis? Nihil libero rem cum dolorem quas ratione a
        fuga.
      </p>
    </div>
  );
}
