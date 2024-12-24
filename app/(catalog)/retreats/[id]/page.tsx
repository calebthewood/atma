import { notFound } from "next/navigation";
import {
  getProperty,
  getPropertyAmenities,
  getPropertyEntityIds,
} from "@/actions/property-actions";
import { getRetreat } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { toast } from "@/components/ui/use-toast";
import { FixedBooking } from "@/components/booking/fixed-booking";
import EntityInstancesTabs from "@/components/program-tabs";
import PropertyPolicies from "@/components/property-policies";
import { EntityTabs } from "@/components/property-tabs";
import SubscriptionSection from "@/components/sections/subscription-section";
import { QuickLink } from "@/components/shared";
import { TitleImageBanner } from "@/components/title-img-banner";
import PropertyLazyCarousel from "@/components/upcoming-carousel";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  try {
    const [retreatResponse, session] = await Promise.all([
      getRetreat(id),
      auth(),
    ]);

    if (!retreatResponse.data) {
      throw new Error(retreatResponse.message);
    }
    const retreat = retreatResponse.data;

    const propertyRes = await getProperty(retreatResponse.data.propertyId);
    if (!propertyRes.data) {
      throw new Error(propertyRes.message);
    }

    const property = propertyRes.data;
    const propertyImages = property?.images || [];
    const retreatImages =
      retreat.images.length > 0 ? retreat.images : propertyImages;

    const amenities = await getPropertyAmenities(id);
    const parkingAmenities = amenities.data?.filter(
      (a) => a.amenityId === "parking-transportation"
    );
    const programIdRes = await getPropertyEntityIds(
      retreat.propertyId,
      "program"
    );
    const retreatIds = programIdRes.data || [];
    const coverImage =
      retreatImages[0]?.filePath || "/img/iStock-1550112895.jpg";
    const imageSlides = propertyImages.map((img) => img.filePath);

    return (
      <div className="flex h-auto min-h-screen flex-col gap-16">
        <section id="hero">
          <TitleImageBanner
            name={retreat?.name ?? ""}
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
                <EntityTabs entity={retreat} />
              </section>

              {retreat.retreatInstances.length > 0 && (
                <section id="section2">
                  <h2 className="mb-5 text-2xl font-semibold capitalize">
                    Retreat Options
                  </h2>
                  <EntityInstancesTabs instances={retreat.retreatInstances} />
                </section>
              )}

              <section id="practical-information">
                <h2 className="mb-5 text-2xl font-semibold capitalize">
                  Practical Information
                </h2>
                <PropertyPolicies
                  property={property}
                  amenities={parkingAmenities || []}
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
