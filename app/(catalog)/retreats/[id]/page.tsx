import { ReactNode, Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRetreatImages } from "@/actions/image-actions";
import {
  getRetreat,
  type RetreatWithRelations,
} from "@/actions/retreat-actions";
import { auth } from "@/auth";

import { cn } from "@/lib/utils";
import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { toast } from "@/components/ui/use-toast";

import { BookingSelector, RetreatDetailCards } from "./retreat-detail-cards";

const DEFAULT_SLIDES = [
  "/img/iStock-1929812569.jpg",
  "/img/iStock-1812905796.jpg",
  "/img/iStock-1550112895.jpg",
  "/img/iStock-1507078404.jpg",
  "/img/iStock-1490140364.jpg",
  "/img/iStock-1291807006.jpg",
];

export default async function RetreatPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const [retreatResponse, images, session] = await Promise.all([
      getRetreat(params.id),
      getRetreatImages(params.id),
      auth(),
    ]);

    if (!retreatResponse.success || !retreatResponse.data) {
      console.error("Failed to fetch retreat:", retreatResponse.error);
      notFound();
    }

    const retreat = retreatResponse.data;
    const [title, subtitle] = retreat.name?.split("|") ?? [];
    const coverImage = retreat.images[0]?.filePath || DEFAULT_SLIDES[4];
    const imageSlides =
      retreat.images.length > 0
        ? retreat.images.map((img) => img.filePath)
        : DEFAULT_SLIDES;
console.log("Retreat, ", retreat)
    return (
      <div className="relative min-h-screen border">
        {/* Fixed Background Image with fade-in */}
        <div className="animate-fade-in fixed inset-0 h-screen w-full">
          <Image
            priority
            alt="destination cover photo"
            src={coverImage}
            fill={true}
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Scrollable Content */}
        <div
          className={cn(
            "relative md:container",
            // "dark:before:to-gradient-richBlack before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-richBeige"
          )}
        >
          {/* Title Section */}
          <div className="mt-56 flex items-end pb-20">
            <GlassCard className="w-full rounded-r py-8 pl-4 md:-left-10 md:max-w-3xl md:pl-10 md:pr-8">
              <div className="flex items-center text-lg font-medium">
                {subtitle}
              </div>
              <h1 className="text-2xl font-medium md:text-4xl">{title}</h1>
            </GlassCard>
          </div>

          {/* Content Section with edge-to-edge gradient */}
          <div className="">
            <div className="container relative mx-auto px-4 py-16">
              <div className="space-y-12">
                {/* Detail Cards */}
                <GlassCard className="rounded-lg p-6">
                  <RetreatDetailCards retreat={retreat} />
                </GlassCard>

                {/* Image Carousel */}
                <Suspense
                  fallback={
                    <div className="h-96 animate-pulse rounded-lg bg-gray-100/20" />
                  }
                >
                  <GlassCard className="rounded-lg p-6">
                    <ThumbnailCarousel slides={imageSlides} />
                  </GlassCard>
                </Suspense>

                {/* Description and Booking Section */}
                <div className="flex flex-col justify-center gap-8 md:flex-row">
                  <GlassCard className="flex-1 rounded-lg p-6">
                    <RetreatDescription copy={retreat.desc} />
                  </GlassCard>

                  <GlassCard className="rounded-lg p-6 md:w-96">
                    <BookingSelector
                      type={retreat.bookingType ?? "Fixed"}
                      userId={session?.user?.id}
                      retreat={retreat}
                    />
                  </GlassCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading retreat page:", error);
    toast({
      title: "Error",
      description: "Failed to load retreat details. Please try again.",
      variant: "destructive",
    });
    notFound();
  }
}

function RetreatDescription({ copy }: { copy: string | null }) {
  if (!copy) return null;

  return (
    <div className="text-lg">
      <p>{copy}</p>
    </div>
  );
}

function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* div adds blue tint */}
      {/* <div className="absolute inset-0 rounded bg-gradient-to-br from-[#004476]/80 via-[#004476]/80 to-[#006fbe]/80 opacity-30" /> */}

      <div className="absolute inset-0 overflow-hidden rounded">
        <div className="absolute inset-0 bg-[url('/img/white-noise-2.webp')] bg-repeat opacity-50" />
        <div className="absolute inset-0 bg-[url('/img/white-noise-1.webp')] bg-repeat opacity-50" />
        <div className="absolute inset-0 rounded bg-gradient-to-br from-white/20 to-white/10 opacity-10" />
      </div>

      <div className="absolute inset-0 rounded border border-white/20 backdrop-blur-sm" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
