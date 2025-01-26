import {
  getProperty,
  getPropertyAmenities,
  getPropertyEntityIds,
} from "@/actions/property-actions";

import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { LoadingSpinner } from "@/components/loading-spinner";
import PropertyPolicies from "@/components/property-policies";
import { PropertyTabs } from "@/components/property-tabs";
import SubscriptionSection from "@/components/sections/subscription-section";
import { QuickLink } from "@/components/shared";
import { TitleImageBanner } from "@/components/title-img-banner";
import PropertyLazyCarousel from "@/components/upcoming-carousel";
import { getCountryName } from "@/lib/utils";

const DEFAULT_SLIDES = [
  "/img/iStock-1929812569.jpg",
  "/img/iStock-1812905796.jpg",
  "/img/iStock-1550112895.jpg",
  "/img/iStock-1507078404.jpg",
  "/img/iStock-1490140364.jpg",
  "/img/iStock-1291807006.jpg",
];

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const propertyRes = await getProperty(params?.id);
  const amenities = await getPropertyAmenities(params?.id);
  const parkingAmenities = amenities.data?.filter(
    (a) => a.amenityId === "parking-transportation"
  );
  const programIdRes = await getPropertyEntityIds(params?.id, "program");
  const programIds = programIdRes.data || [];
  const retreatIdRes = await getPropertyEntityIds(params?.id, "retreat");
  const retreatIds = retreatIdRes.data || [];
  // const session = await auth();

  if (!propertyRes.ok || !propertyRes.data || !params) {
    return (
      <div className="flex size-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const property = propertyRes.data;

  const coverImgPath = property
    ? property.images.sort((a, b) => a.order - b.order)[0]?.filePath
    : "/img/iStock-1490140364.jpg";

  const slides =
    property.images.length > 0
      ? property.images.map((img) => img.filePath)
      : DEFAULT_SLIDES;

  const overview = property?.descList ?? "Oops! No overview found.";
  const specialty = property?.descShort ?? "";
  const specialtyList = specialty.split(specialty.includes(";") ? ";" : ".");

  return (
    <div className="flex h-auto min-h-screen flex-col gap-6 md:gap-16 px-2">
      <section id="hero">
        <TitleImageBanner
          name={property?.name}
          city={property?.city}
          country={property?.country}
          address={property?.address}
          nearestAirport={property?.nearbyAirport}
          imgHref={coverImgPath}
          taglist={property?.tagList}
        />
      </section>

      <section id="overview">
        <SpecialtyOverview overview={overview} specialtyList={specialtyList} />
      </section>

      <section id="gallery">
        <h2 className="mb-5 text-2xl font-semibold">Gallery</h2>
        <ThumbnailCarousel slides={slides} />
      </section>

      <section id="offerings">
        <h2 className="mb-5 text-2xl font-semibold">Offerings</h2>
        <PropertyTabs property={property} />
      </section>

      <section id="practical-information">
        <h2 className="mb-5 text-2xl font-semibold">Practical Information</h2>
        <PropertyPolicies
          property={property}
          amenities={parkingAmenities ?? []}
        />
      </section>

      {programIds.length > 0 && (
        <section id="upcoming-programs">
          <QuickLink text="See All Programs" href="/programs" />
          <h2 className="my-12 w-full text-center text-3xl font-semibold">
            Exclusive Wellness Programs
          </h2>
          <PropertyLazyCarousel entityIds={programIds} entityType="program" />
        </section>
      )}

      {retreatIds.length > 0 && (
        <section id="upcoming-retreats">
          <QuickLink text="See All Retreats" href="/retreats" />
          <h2 className="my-12 w-full text-center text-3xl font-semibold">
            Upcoming Retreats
          </h2>
          <PropertyLazyCarousel entityIds={retreatIds} entityType="retreat" />
        </section>
      )}

      <section>
        <SubscriptionSection />
      </section>
    </div>
  );
}

const SpecialtyOverview = ({
  overview,
  specialtyList,
}: {
  overview: string;
  specialtyList: string[];
}) => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
    <div>
      <h2 className="text-2xl font-semibold">Overview</h2>
      <p className="text-sm font-normal">{overview}</p>
    </div>
    <div>
      <h2 className="text-2xl font-semibold">Specialty</h2>
      <ul className="list-disc text-sm font-normal">
        {specialtyList.map(
          (line, i) =>
            line && (
              <li key={`line-${i}`} className="my-2 ml-4">
                {line}
              </li>
            )
        )}
      </ul>
    </div>
  </div>
);
