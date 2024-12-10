import Image from "next/image";
import { getPropertyById } from "@/actions/property-actions";
import { auth } from "@/auth";
import { Separator } from "@radix-ui/react-separator";
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
import { CatalogTabs } from "@/components/catalog-tabs";
import { LoadingSpinner } from "@/components/loading-spinner";
import { LazyRetreatItem } from "@/components/retreat-item";
import { TitleImageBanner } from "@/components/title-img-banner";
import { H3 } from "@/components/typography";

/** Amenity strings are formatted like 'Amenity Title: Name | Value */
const parseAmenity = (str: string | null | undefined) => {
  if (!str) return ["", ""];
  if (!str.includes(":")) return [str, ""];
  const string = str.split(":")[1];
  return string.split("|");
};

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

  if (!property) {
    return (
      <div className="flex size-full items-center justify-center">
        <LoadingSpinner /> Loading...
      </div>
    );
  }

  const coverImgPath =
    property?.images.sort((a, b) => a.order - b.order)[0]?.filePath ||
    "/img/iStock-1490140364.jpg";

  const [title, _] = property.name.split("|");
  const subtitle = property.type ?? "";

  const slides =
    property.images.length > 0
      ? property.images.map((img) => img.filePath)
      : DEFAULT_SLIDES;

  const focusRetreat = property.retreats[0];

  return (
    <div className="mt-4 h-auto min-h-screen md:container">
      <TitleImageBanner title={title} subtitle={subtitle} href={coverImgPath} />
      <div className="">
        <div className="flex justify-center gap-6 py-12">
          <PlaceList placeList={property.placeList} />
        </div>
        <div className="my-12">
          <ThumbnailCarousel slides={slides} />
        </div>
        <div className="flex flex-col flex-wrap justify-center md:flex-row">
          <div className="w-full max-w-xl flex-1 p-1 text-lg">
            <CatalogTabs tabs={tabsData} defaultTab="healing" />
          </div>
          <div className="mx-16 w-10/12 md:hidden">
            <Separator
              orientation="horizontal"
              className="my-16 h-px w-full bg-primary/80"
            />
          </div>
          <div className="flex-0 mx-8 mb-16 gap-4">
            <H3 className="mb-4 mt-6 border-b font-light">Upcoming Retreat</H3>
            <LazyRetreatItem
              id={focusRetreat?.id}
              segment="retreats"
              className="w-[300px]"
              aspectRatio="portrait"
              width={250}
              height={330}
            />
          </div>
        </div>
        {property.retreats.length > 1 && (
          <div className="relative">
            <H3 className="mb-2 font-light">Other Retreats at this Location</H3>
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
                {property.retreats.map((r, i) => (
                  <LazyRetreatItem
                    key={r.name + `${i * 3.7}`}
                    id={r.id}
                    segment="retreats"
                    className="w-[250px]"
                    aspectRatio="portrait"
                    width={250}
                    height={330}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </div>
      <div className="mb-32"></div>
    </div>
  );
}

function PlaceList({ placeList }: { placeList: string | null | undefined }) {
  // placeList example: HARNN SAMUI AIRPORT | 1.1 miles;Samui Florist Shop | 1.1 miles;SAMUI 333 LATEX | 1.2 miles;Nicky Fashion | 1.2 miles
  const places = placeList
    ? placeList.split(";").map((plc) => plc.split("|"))
    : [
        ["HARNN SAMUI AIRPORT", "1.1 miles"],
        ["Samui Florist Shop", "1.1 miles"],
        ["SAMUI 333 LATEX", "1.2 miles"],
        ["Nicky Fashion", "1.2 miles"],
        ["Royal King International Suits", "1.2 miles"],
      ];
  const icons = [
    <Plane size={48} strokeWidth={0.5} />,
    <BedSingle size={48} strokeWidth={0.5} />,
    <NotepadText size={48} strokeWidth={0.5} />,
    <User size={48} strokeWidth={0.5} />,
    <Hotel size={48} strokeWidth={0.5} />,
    <Flower size={48} strokeWidth={0.5} />,
    <LayoutGrid size={48} strokeWidth={0.5} />,
  ];
  if (placeList === null || placeList === undefined) return <LoadingSpinner />;
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
