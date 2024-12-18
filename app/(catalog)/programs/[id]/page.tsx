import { notFound } from "next/navigation";
import { getProgram } from "@/actions/program-actions";
import {
  getPropertyAmenitiesByCategory,
  getPropertyById,
  getPropertyEntityIds,
} from "@/actions/property-actions";
import { auth } from "@/auth";

import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { toast } from "@/components/ui/use-toast";
import { FixedBooking } from "@/components/booking/fixed-booking";
import EntityInstancesTabs from "@/components/program-tabs";
import PropertyPolicies from "@/components/property-policies";
import PropertyTabs from "@/components/property-tabs";
import SubscriptionSection from "@/components/sections/subscription-section";
import { QuickLink } from "@/components/shared";
import { TitleImageBanner } from "@/components/title-img-banner";
import PropertyLazyCarousel from "@/components/upcoming-carousel";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parameters = await params;

  try {
    const [programResponse, session] = await Promise.all([
      getProgram(parameters?.id),
      auth(),
    ]);

    if (!programResponse.success || !programResponse.data) {
      console.error("Failed to fetch program:", programResponse.error);
      notFound();
    }

    const program = programResponse.data;
    const property = await getPropertyById(program.propertyId);
    const images = program.property.images;
    const parkingAmenities = await getPropertyAmenitiesByCategory(
      program.propertyId,
      "parking-transportation"
    );

    const programIds = await getPropertyEntityIds(
      program.propertyId,
      "program"
    );
    // Handle images from both program and property
    const coverImage = images[0]?.filePath || "/img/iStock-1550112895.jpg";
    let imageSlides = images.map((img) => img.filePath);

    imageSlides.unshift(imageSlides.pop() || "");

    return (
      <div className="flex h-auto min-h-screen flex-col gap-16">
        <section id="hero">
          <TitleImageBanner
            name={program?.property?.name}
            city={program?.property?.city}
            country={program?.property?.country}
            address={program?.property?.address}
            nearestAirport={program?.property?.nearbyAirport}
            imgHref={coverImage}
            taglist={program?.property?.tagList}
          />
        </section>

        <div className="h-auto flex-col gap-y-16">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - spans 8 columns */}
            <div className="col-span-12 space-y-16 lg:col-span-8">
              <section id="offerings">
                <h2 className="mb-5 text-2xl font-semibold capitalize">
                  Highlights
                </h2>
                <PropertyTabs property={property} />
              </section>

              <section id="section2">
                <h2 className="mb-5 text-2xl font-semibold capitalize">
                  Program Options
                </h2>
                <EntityInstancesTabs instances={program?.programs} />
              </section>

              <section id="practical-information">
                <h2 className="mb-5 text-2xl font-semibold capitalize">
                  Practical Information
                </h2>
                <PropertyPolicies
                  property={property}
                  amenities={parkingAmenities}
                  className="lg:grid-cols-2"
                />
              </section>
            </div>

            {/* Right Column - spans 4 columns */}
            <div className="col-span-12 lg:col-span-4">
              <aside className="sticky top-24">
                <FixedBooking
                  type="program"
                  userId={session?.user?.id}
                  item={program}
                  instances={program?.programs}
                  priceMods={program?.priceMods}
                />
              </aside>
            </div>
          </div>
        </div>
        <section id="gallery">
          <h2 className="mb-10 text-center text-3xl font-semibold capitalize">
            Meet {property?.name}
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-sm font-normal capitalize">
            {property?.descShort}
          </p>
          <ThumbnailCarousel slides={imageSlides} />
        </section>

        {programIds.length > 0 && (
          <section id="upcoming-programs">
            <QuickLink text="See All Programs" href="/programs" />
            <h2 className="my-12 w-full text-center text-3xl font-semibold capitalize">
              Other Offerings by
            </h2>
            <PropertyLazyCarousel entityIds={programIds} entityType="program" />
          </section>
        )}

        <section>
          <SubscriptionSection />
        </section>
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
