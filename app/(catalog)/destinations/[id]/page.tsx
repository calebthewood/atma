import Image from "next/image";
import { getPropertyById } from "@/actions/property-actions";
import { auth } from "@/auth";
import {
  BedSingle,
  Flower,
  Hotel,
  LayoutGrid,
  NotepadText,
  Plane,
  User,
} from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ThumbnailCarousel from "@/components/ui/carousel-thumbnail";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FixedBooking } from "@/components/booking/fixed-booking";
import { FlexibleBooking } from "@/components/booking/flexible-booking";
import { OpenBooking } from "@/components/booking/open-booking";
import { CatalogTabs } from "@/components/catalog-tabs";
import { LoadingSpinner } from "@/components/loading-spinner";
import { TitleImageBanner } from "@/components/title-img-banner";

/** Amenity strings are formatted like 'Amenity Title: Name | Value */
const parseAmenity = (str: string | null | undefined) => {
  if (!str) return ["", ""];
  if (!str.includes(":")) return [str, ""];
  const string = str.split(":")[1];
  return string.split("|");
};

export default async function Page({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id);
  const session = await auth();

  const tabsData = [
    {
      value: "healing",
      label: "Healing",
      content: <div>{property?.amenityHealing}</div>,
    },
    {
      value: "cuisine",
      label: "Cuisine",
      content: <div>{property?.amenityCuisine}</div>,
    },
    {
      value: "activity",
      label: "Activity",
      content: <div>{property?.amenityActivity}</div>,
    },
    {
      value: "facility",
      label: "Amenities",
      content: <div>{property?.amenityFacility}</div>,
    },
  ];
  function RenderBookingType({ type }: { type: string }) {
    switch (type) {
      case "open":
        return (
          <OpenBooking
            userId={session?.user?.id}
            retreat={property}
            events={property.retreatInstances}
          />
        );
      case "fixed_range":
        return (
          <FixedBooking
            userId={session?.user?.id}
            retreat={property}
            event={property.retreatInstances[0]}
          />
        );
      case "flexible_range":
        return (
          <FlexibleBooking
            userId={session?.user?.id}
            retreat={property}
            events={property.retreatInstances}
          />
        );
      default:
        return null;
    }
  }

  if (!property) {
    return (
      <>
        <LoadingSpinner /> Loading...
      </>
    );
  }

  const coverImgPath =
    property?.images.sort((a, b) => a.order - b.order)[0]?.filePath ||
    "/img/iStock-1490140364.jpg";

  const [title, subtitle] = property.name.split("|");

  return (
    <div className="mt-4 h-auto min-h-screen">
      <TitleImageBanner title={title} subtitle={subtitle} href={coverImgPath} />
      <div className="container">
        <div className="flex justify-center gap-6 py-12">
          <PlaceList placeList={property.placeList} />
        </div>
        <div className="my-12">
          <ThumbnailCarousel
            slides={property.images.map((img) => img.filePath)}
          />
        </div>
        <div className="flex flex-col flex-wrap justify-center md:flex-row">
          <div className="max-w-xl flex-1 text-lg">
            <CatalogTabs tabs={tabsData} defaultTab="healing" />
          </div>
          <div className="flex-0 mx-8 mb-16 w-96">
            <RenderBookingType type={property.bookingType} />

            <AspectRatio ratio={3 / 4} className="w-[340px]">
              <div className="relative h-[540px] w-[340px]">
                <div className="absolute inset-0 rounded bg-gradient-to-br from-[#004476] via-[#004476] to-[#006fbe] opacity-10"></div>

                {/* <div className="absolute rounded inset-0 bg-[url('/img/iStock-1291807006.jpg')] bg-cover bg-center opacity-70 mix-blend-overlay"></div> */}

                <div className="absolute inset-0 overflow-hidden rounded">
                  <div className="absolute inset-0 bg-[url('/img/white-noise-2.webp')] opacity-20"></div>
                  <div className="absolute inset-0 bg-[url('/img/white-noise-1.webp')] opacity-20"></div>

                  <div className="absolute inset-0 rounded bg-gradient-to-br from-white/75 to-white/30 opacity-20 backdrop-blur-sm"></div>

                  <div className="relative z-10 p-6 text-white">
                    {/* children */}
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-0 rounded border border-white/75 backdrop-blur"></div>
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceList({ placeList }: { placeList: string | null | undefined }) {
  // placeList example: HARNN SAMUI AIRPORT | 1.1 miles;Samui Florist Shop | 1.1 miles;SAMUI 333 LATEX | 1.2 miles;Nicky Fashion | 1.2 miles
  const places = placeList?.split(";").map((plc) => plc.split("|"));
  const icons = [
    <Plane size={48} strokeWidth={0.5} />,
    <BedSingle size={48} strokeWidth={0.5} />,
    <NotepadText size={48} strokeWidth={0.5} />,
    <User size={48} strokeWidth={0.5} />,
    <Hotel size={48} strokeWidth={0.5} />,
    <Flower size={48} strokeWidth={0.5} />,
    <LayoutGrid size={48} strokeWidth={0.5} />,
  ];
  if (!placeList) return <LoadingSpinner />;
  /* HARNN SAMUI AIRPORT | 1.1 miles;Samui Florist Shop | 1.1 miles;SAMUI 333 LATEX | 1.2 miles;Nicky Fashion | 1.2 miles;Royal King International Suits | 1.6 miles;Outlet Village SaMui | 1.7 miles;Classic International suits | 1.9 miles;Oscars Fashion | 1.9 miles;Central Festival (FESTIVAL SAMUI) | 2.1 miles;セントラルフェスティバル サムイ | 2.1 miles;Samui Party Pro | 2.2 miles;Living Plaza | 2.3 miles;Paul's Fashion | 2.3 miles;Big C Supercenter - Samui | 2.7 miles;Makro | 2.8 miles;Modern Suit | 2.9 miles;Tommy's master tailor | 3.0 miles;Fisherman's Village Walking Street | 3.0 miles;Ash Tailor Samui | 3.6 miles;Walking street Maenam | 5.5 miles;Yodyut Muaythai | 1250  ft;Baan Jakawan | 1550  ft;Lamborghini Villa | 1650  ft;Koh Samui Events | 2100  ft;Rock beach | 2200  ft;Samui Crocodile Farm | 3600  ft;Art-samui | 3700  ft;Seatran Discovery Company Limited | 1.1 miles;Bangrak Market | 1.1 miles;Choengmon Beach | 1.1 miles;Wat Plai Laem | 1.2 miles;Wat Laem Suwannaram | 1.2 miles;Hat Bang Rak beach | 1.4 miles;Samui Pier Beach front Resort | 1.4 miles;Wat Phra Yai | 1.5 miles;Chaweng Boxing Stadium | 1.9 miles;Fisherman's Village | 3.2 miles;Bo Phut Beach | 3.4 miles;Chaweng Beach | 4.0 miles;Samui Island | 5.4 miles;The Love Kitchen | 100  ft;Coffee bear cafè | 800  ft;Fisherman's Reggae Bar | 800  ft;Pui Relax Restaurant & Bar | 1850  ft;THE COCOON - SAMUI VIEWPOINT | 2600  ft;Seoul korean restaurant | 3000  ft;BAY LEAF Restaurant & Bar Choengmon kohsamui | 3350  ft;Krua Choeng Mon - Thai Restaurant | 3650  ft;DAWN Korean Restaurant | 3800  ft;Burger House Samui 24 Hours Delivery and Restaurant | 3900  ft;Panya Cafe | 4050  ft;DAO Sushi | 4300  ft;Krua thai | 4400  ft;The Jumping Bean Samui | 4600  ft;หนานหยวน เชิงมน Nanyuan Noodle ( Choengmon beach) | 4650  ft;The Mother Restaurant | 5000  ft;Carnival Beach Village - Beach Club | 1.0 mile;Supattra Thai Dining | 1.0 mile;Mr. Eung Seafood | 1.0 mile;Khao Horm | 1.1 miles*/
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4 bg-blend-darken">
        {places?.map(([name, value], i) => (
          <Card key={`place-list-${i}`} className="w-56">
            <CardHeader>
              <CardDescription className="mx-auto p-4">
                {icons[i % icons.length]}
              </CardDescription>
              <CardTitle className="mx-auto text-balance text-center font-light">
                {name.split("-")[0]}
              </CardTitle>
            </CardHeader>
            {/* <CardContent></CardContent> */}
            <CardFooter className="flex-col justify-center">
              <p className="text-center">{value}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function RetreatDescCard({
  desc,
}: {
  desc: { name: string; icon: any; detail: string };
}) {
  const [amenity, value] = parseAmenity(desc.detail);
  return (
    <Card className="w-56">
      <CardHeader>
        <CardDescription className="mx-auto p-4">{desc.icon}</CardDescription>
        <CardTitle className="mx-auto font-light">{desc.name}</CardTitle>
      </CardHeader>
      {/* <CardContent></CardContent> */}
      <CardFooter className="flex-col justify-center">
        <p className="text-center">{amenity}</p>
        <p className="text-center">{value}</p>
      </CardFooter>
    </Card>
  );
}
