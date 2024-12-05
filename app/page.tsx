import { Metadata } from "next";
import { getHosts } from "@/actions/host-actions";
import { getPrograms } from "@/actions/program-actions";
import { getProperties, getPropertyIds } from "@/actions/property-actions";
import { getRetreats } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import HeroCarousel from "@/components/ui/carousel-hero";
import { BookingBar } from "@/components/booking-bar";

import { HomePageLists } from "./home-page-lists";

export const metadata: Metadata = {
  title: "atma reserve",
  description: "Unleash your potential",
};

export default async function Page() {
  const session = await auth();
  const [hosts, properties, retreats, programs] = await Promise.all([
    await getHosts(),
    await getPropertyIds(),
    await getRetreats(),
    await getPrograms(),
  ]);

  const sections = [
    {
      title: "Browse Retreats",
      description: "Top picks for you. Updated on the regular.",
      items:
        retreats?.data?.map((r) => ({ id: r.id, type: "retreat" as const })) ??
        [],
      aspectRatio: "portrait" as const,
      width: 250,
      height: 330,
      className: "w-[250px]",
    },
    {
      title: "Special Programmes",
      description: "Curated programs just for you.",
      items:
        programs?.data?.map((p) => ({ id: p.id, type: "program" as const })) ??
        [],
      aspectRatio: "portrait" as const,
      width: 250,
      height: 330,
      className: "w-[250px]",
    },
    {
      title: "Destinations",
      description: "Luxury locations, worldwide.",
      items:
        properties.map((p) => ({ id: p.id, type: "destination" as const })) ??
        [],
      aspectRatio: "square" as const,
      width: 150,
      height: 150,
      className: "w-[150px]",
    },
  ];

  return (
    <>
      <BookingBar />
      <div className="container flex flex-col gap-y-6 py-6">
        <HeroSection />
        <HomePageLists sections={sections} />
      </div>
    </>
  );
}

const HeroSection = () => {
  const slides = [
    {
      image: "/img/iStock-1929812569.jpg",
      title: "FEATURED RETREAT OR PROGRAM",
      desc: "10 Days of Yoga and Meditation, leave your boyfriend at home!",
      buttonText: "Explore",
    },
    {
      image: "/img/iStock-1812905796.jpg",
      title: "UPCOMING RETREAT",
      desc: "Hopefully they paid us to be featured prominently.",
      buttonText: "Explore",
    },
    // Add more slides as needed
  ];

  return (
    <div className="h-[600px] w-full">
      <HeroCarousel slides={slides} />
    </div>
  );
};
