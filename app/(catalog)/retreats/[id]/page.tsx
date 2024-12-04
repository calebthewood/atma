import { ReactNode, Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRetreatImages } from "@/actions/image-actions";
import {
  getAllPriceMods,
  getRetreatPriceMods,
} from "@/actions/price-mod-actions";
import { getRetreat } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { CardTitle } from "@/components/ui/card";
import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { toast } from "@/components/ui/use-toast";
import { FixedBooking } from "@/components/booking/fixed-booking";
import { CatalogTabs } from "@/components/catalog-tabs";
import { RetreatInstancesList } from "@/app/admin/retreat/retreat-instance-table";

import { BookingSelector, RetreatDetailCards } from "./retreat-detail-cards";
import RetreatInstances from "./retreat-instance-list";

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
  params: Promise<{ id: string }>;
}) {
  const parameters = await params;

  try {
    const [retreatResponse, images, session, priceMods] = await Promise.all([
      getRetreat(parameters.id),
      getRetreatImages(parameters.id),
      auth(),
      getRetreatPriceMods(parameters.id),
    ]);

    if (!retreatResponse.success || !retreatResponse.data) {
      console.error("Failed to fetch retreat:", retreatResponse.error);
      notFound();
    }

    const retreat = retreatResponse.data;

    const [title, subtitle] = retreat.name?.split("|") ?? [];
    const coverImage = images[0]?.filePath || DEFAULT_SLIDES[3];
    const imageSlides =
      retreat.images.length > 0
        ? retreat.images.map((img) => img.filePath)
        : DEFAULT_SLIDES;

    const tabsData = [
      {
        value: "keyBenefits",
        label: "Benefits",
        content: <div>{retreat?.keyBenefits}</div>,
      },
      {
        value: "programApproach",
        label: "Approach",
        content: <div>{retreat?.programApproach}</div>,
      },
      {
        value: "whoIsthisFor",
        label: "Who is this for?",
        content: <div>{retreat?.whoIsthisFor}</div>,
      },
    ];
    return (
      <div className="relative min-h-screen border">
        {/* Fixed Background Image with fade-in */}
        <div className="fixed inset-0 h-screen w-full animate-fade-in">
          <Image
            priority
            alt="destination cover photo"
            src={coverImage}
            fill={true}
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div className="bg-richWhite/40 absolute inset-0 dark:bg-richBlack/40" />
        </div>

        {/* Scrollable Content */}
        <div
          className={cn(
            "relative md:container"
            // "dark:before:to-gradient-richBlack before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-richBeige"
          )}
        >
          {/* Title Section */}
          <div className="mt-56 flex items-end pb-20">
            <GlassCard className="w-full rounded-r py-8 pl-4 md:-left-10 md:max-w-3xl md:pl-10 md:pr-8 xl:left-0">
              <div className="flex items-center text-lg font-medium">
                {subtitle}
              </div>
              <h1 className="text-2xl font-medium md:text-4xl">{title}</h1>
            </GlassCard>
          </div>

          {/* Content Section with edge-to-edge gradient */}
          <div className="">
            <div className="container relative mx-auto py-16">
              <div className="space-y-12">
                {/* Detail Cards */}
                <GlassCard className="rounded-lg p-6">
                  <RetreatDetailCards retreat={retreat} />
                </GlassCard>

                {/* Image Carousel */}
                <Suspense
                  fallback={
                    <div className="h-96 w-full animate-pulse rounded-lg bg-gray-100/20" />
                  }
                >
                  <GlassCard className="rounded-lg p-6">
                    <ThumbnailCarousel slides={imageSlides} />
                  </GlassCard>
                </Suspense>

                {/* Description and Booking Section */}
                <div className="relative mx-auto">
                  <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Left Column - Content */}
                    <div className="flex w-full flex-col gap-y-6 lg:w-2/3">
                      <GlassCard className="rounded-lg p-6">
                        <CardTitle className="mb-2 text-3xl font-light">
                          Overview
                        </CardTitle>
                        <RetreatDescription copy={retreat.desc} />
                      </GlassCard>

                      <GlassCard className="w-full">
                        <CatalogTabs
                          tabs={tabsData}
                          defaultTab="whoIsthisFor"
                        />
                      </GlassCard>

                      <GlassCard className="rounded-lg p-6">
                        <RetreatInstances
                          instances={retreat.retreatInstances}
                        />
                      </GlassCard>
                    </div>

                    {/* Right Column - Booking */}
                    <div className="w-full lg:w-1/3">
                      <div className="sticky top-24">
                        {/* <GlassCard className="rounded-lg p-6"> */}
                        <FixedBooking
                          type="retreat"
                          userId={session?.user?.id}
                          item={retreat}
                          instances={retreat.retreatInstances}
                          priceMods={priceMods.data ?? []}
                        />
                        {/* </GlassCard> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-96"></div>
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
    <div
      className={cn(
        "relative rounded border bg-white/20 p-4 shadow backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
