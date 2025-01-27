import { Metadata } from "next";
import { getSpotlightPrograms } from "@/actions/program-actions";
import { getSpotlightRetreats } from "@/actions/retreat-actions";

import { BookingBar } from "@/components/booking-bar";
import DestinationSection from "@/components/sections/destination-section";
import ProgramSection from "@/components/sections/program-section";
import RetreatSection from "@/components/sections/retreat-section";
import SubscriptionSection from "@/components/sections/subscription-section";

export const metadata: Metadata = {
  title: "atma reserve",
  description: "Unleash your potential",
};

const spotlightPrograms = [
  "cm4to2s5o000psp27s1514k64",
  "cm4vyrtnt000psps2ukgk0392",
  "cm4u899n30000spgq24up4v2n",
];

const spotlightRetreats = [
  "cm5vsll0h002ispq64cinsj3y",
  "cm5x3owe200g8spq604ipnaey",
];

export default async function Page() {
  const [programs, retreats] = await Promise.all([
    getSpotlightPrograms(spotlightPrograms),
    getSpotlightRetreats(spotlightRetreats),
  ]);

  return (
    <>
      <BookingBar />
      <div className="tracking-wideset flex flex-col font-semibold md:gap-y-6 md:py-6">
        <ProgramSection programs={programs} />
        <DestinationSection />
        <RetreatSection retreats={retreats} />
        <SubscriptionSection />
      </div>
    </>
  );
}
