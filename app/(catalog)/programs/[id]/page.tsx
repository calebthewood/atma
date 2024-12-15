import { ReactNode, Suspense } from "react";

import { notFound } from "next/navigation";
import { getProgram } from "@/actions/program-actions";
import { auth } from "@/auth";

import { cn } from "@/lib/utils";
import { CardTitle } from "@/components/ui/card";
import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { toast } from "@/components/ui/use-toast";
import { FixedBooking } from "@/components/booking/fixed-booking";
import { CatalogTabs } from "@/components/catalog-tabs";
import { TitleImageBanner } from "@/components/title-img-banner";

const DEFAULT_SLIDES = [
  "/img/iStock-1929812569.jpg",
  "/img/iStock-1812905796.jpg",
  "/img/iStock-1550112895.jpg",
  "/img/iStock-1507078404.jpg",
  "/img/iStock-1490140364.jpg",
  "/img/iStock-1291807006.jpg",
];

function ProgramDescription({ copy }: { copy: string | null }) {
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

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parameters = await params;

  try {
    const [programResponse, session] = await Promise.all([
      getProgram(parameters.id),
      auth(),
    ]);

    if (!programResponse.success || !programResponse.data) {
      console.error("Failed to fetch program:", programResponse.error);
      notFound();
    }

    const program = programResponse.data;
    // const images = await fetchImages(retreat.propertyId, "property");
    const images = program.property.images;

    const [title, subtitle] = program.name?.split("|") ?? [];

    // Handle images from both program and property
    const coverImage = images[0]?.filePath || DEFAULT_SLIDES[0];
    let imageSlides = images.map((img) => img.filePath);

    imageSlides.unshift(imageSlides.pop() || "");

    const tabsData = [
      {
        value: "keyBenefits",
        label: "Benefits",
        content: <div>{program?.keyBenefits}</div>,
      },
      {
        value: "programApproach",
        label: "Approach",
        content: <div>{program?.programApproach}</div>,
      },
      {
        value: "whoIsthisFor",
        label: "Who is this for?",
        content: <div>{program?.whoIsthisFor}</div>,
      },
    ];

    return (
      <div className="relative mt-6 min-h-screen md:container">
        <TitleImageBanner title={title} subtitle={subtitle} href={coverImage} />

        {/* Content Section */}
        <div>
          <div className="container relative mx-auto py-16">
            <div className="space-y-12">
              {/* Image Carousel */}
              <Suspense
                fallback={
                  <div className="h-96 w-full animate-pulse rounded-lg bg-gray-100/20" />
                }
              >
                {imageSlides.length > 0 && (
                  <GlassCard className="rounded-lg p-6">
                    <ThumbnailCarousel slides={imageSlides} />
                  </GlassCard>
                )}
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
                      <ProgramDescription copy={program.desc} />
                    </GlassCard>

                    <GlassCard className="w-full">
                      <CatalogTabs tabs={tabsData} defaultTab="whoIsthisFor" />
                    </GlassCard>
                  </div>

                  {/* Right Column - Booking */}
                  <div className="w-full lg:w-1/3">
                    <div className="sticky top-24">
                      <FixedBooking
                        type="program"
                        userId={session?.user?.id}
                        item={program}
                        instances={program.programs}
                        priceMods={program.priceMods}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading program page:", error);
    toast({
      title: "Error",
      description: "Failed to load program details. Please try again.",
      variant: "destructive",
    });
    notFound();
  }
}
