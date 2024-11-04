import { Metadata } from "next";
import { getHosts } from "@/actions/host-actions";
import { getProperties, getPropertyIds } from "@/actions/property-actions";
import { getRetreatIds, getRetreats } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import { BookingBar } from "@/components/booking-bar";

import { HomePageLists } from "./home-page-lists";

export const metadata: Metadata = {
  title: "atma reserve",
  description: "Unleash your potential",
};

export default async function Page() {
  const session = await auth();
  const hosts = await getHosts();
  const properties = await getPropertyIds();
  const retreats = await getRetreatIds();

  return (
    <>
      <BookingBar />
      <HomePageLists
        retreats={retreats}
        properties={properties}
        hosts={hosts}
      />
    </>
  );
}
