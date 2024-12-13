import { Metadata } from "next";
import { getHosts } from "@/actions/host-actions";
import { getPrograms } from "@/actions/program-actions";
import { getProperties, getPropertyIds } from "@/actions/property-actions";
import { getRetreats } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import HeroCarousel from "@/components/ui/carousel-hero";
import { BookingBar } from "@/components/booking-bar";

import DestinationGrid from "./destination-grid";
import { HomePageLists, ScrollableList } from "./home-page-lists";

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
      title: "Explore Our Retreat Collection",
      description: "",
      items:
        retreats?.data?.map((r) => ({ id: r.id, type: "retreat" as const })) ??
        [],
      aspectRatio: "portrait" as const,
      width: 250,
      height: 330,
      className: "w-[250px]",
    },
    {
      title: "Travel Differently: Wellness Programming",
      description: "",
      items:
        programs?.data?.map((p) => ({ id: p.id, type: "program" as const })) ??
        [],
      aspectRatio: "portrait" as const,
      width: 250,
      height: 330,
      className: "w-[250px]",
    },
    // {
    //   title: "Destinations",
    //   description: "Luxury locations, worldwide.",
    //   items:
    //     properties.map((p) => ({ id: p.id, type: "destination" as const })) ??
    //     [],
    //   aspectRatio: "square" as const,
    //   width: 150,
    //   height: 150,
    //   className: "w-[150px]",
    // },
  ];

  // Travel Differently: Wellness Programming

  return (
    <>
      <BookingBar />
      <div className="flex flex-col gap-y-6 py-6 md:container">
        <HeroSection />
        <ScrollableList {...sections[0]} />
        <DestinationGrid />
        <ScrollableList {...sections[1]} />
        <div className="mx-auto mb-56 mt-12 text-center">
          <h3 className="mb-4 text-4xl">{`Escape the ordinary`}</h3>
          <p className="px-12 text-xl">{`At Atma Reserve, we craft extraordinary travel experiences. Explore our exclusive Hotel Collection or create your bespoke escape with you dedicated Client Advisor. From flights and transfers to unique experiences, let us handle every detail. Whatever your Travel State of Mind, let’s bring your dream journey to life.`}</p>
        </div>
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
