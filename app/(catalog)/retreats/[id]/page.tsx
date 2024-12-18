import { notFound } from "next/navigation";
import {
  getPropertyAmenitiesByCategory,
  getPropertyById,
  getPropertyEntityIds,
} from "@/actions/property-actions";
import { getRetreat } from "@/actions/retreat-actions";
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

export default async function RetreatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parameters = await params;

  try {
    const [retreatResponse, session] = await Promise.all([
      getRetreat(parameters?.id),
      auth(),
    ]);

    if (!retreatResponse.success || !retreatResponse.data) {
      console.error("Failed to fetch retreat:", retreatResponse.error);
      notFound();
    }

    const retreat = retreatResponse.data;
    const property = await getPropertyById(retreat.propertyId);
    const images = retreat.property.images;
    const parkingAmenities = await getPropertyAmenitiesByCategory(
      retreat.propertyId,
      "parking-transportation"
    );

    const retreatIds = await getPropertyEntityIds(
      retreat.propertyId,
      "retreat"
    );

    // Handle images from both retreat and property
    const coverImage = images[0]?.filePath || "/img/iStock-1550112895.jpg";
    const imageSlides = images.map((img) => img.filePath);

    return (
      <div className="flex h-auto min-h-screen flex-col gap-16">
        <section id="hero">
          <TitleImageBanner
            name={retreat.property?.name}
            city={retreat.property?.city}
            country={retreat.property?.country}
            address={retreat.property?.address}
            nearestAirport={retreat.property?.nearbyAirport}
            imgHref={coverImage}
            taglist={retreat.property?.tagList}
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
                  Retreat Options
                </h2>
                <EntityInstancesTabs instances={retreat.retreatInstances} />
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
                  type="retreat"
                  userId={session?.user?.id}
                  item={retreat}
                  instances={retreat?.retreatInstances}
                  priceMods={retreat?.priceMods}
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

        {retreatIds.length > 0 && (
          <section id="upcoming-retreats">
            <QuickLink text="See All Retreats" href="/retreats" />
            <h2 className="my-12 w-full text-center text-3xl font-semibold capitalize">
              Other Offerings by {property?.name || ""}
            </h2>
            <PropertyLazyCarousel entityIds={retreatIds} entityType="retreat" />
          </section>
        )}

        <section>
          <SubscriptionSection />
        </section>
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
