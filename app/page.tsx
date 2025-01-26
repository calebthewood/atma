import { Metadata } from "next";
import { getPrograms } from "@/actions/program-actions";

import { BookingBar } from "@/components/booking-bar";
import DestinationSection from "@/components/sections/destination-section";
import ProgramSection from "@/components/sections/program-section";
import RetreatSection from "@/components/sections/retreat-section";
import SubscriptionSection from "@/components/sections/subscription-section";

export const metadata: Metadata = {
  title: "atma reserve",
  description: "Unleash your potential",
};

export default async function Page() {
  const programs = await getPrograms();

  return (
    <>
      <BookingBar />
      <div className="tracking-wideset flex flex-col font-semibold md:gap-y-6 md:py-6">
        <ProgramSection programs={programs.data?.slice(0, 3) ?? []} />
        <DestinationSection />
        <RetreatSection />
        <SubscriptionSection />
      </div>
    </>
  );
}
