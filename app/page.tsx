import { Metadata } from "next";
import { getHosts } from "@/actions/host-actions";
import { getProperties } from "@/actions/property-actions";
import { getRetreats } from "@/actions/retreat-actions";
import { auth } from "@/auth";

import { HomePageLists } from "./home-page-lists";

export const metadata: Metadata = {
  title: "atma reserve",
  description: "Unleash your potential",
};

export default async function Page() {
  const session = await auth();
  const hosts = await getHosts();
  const properties = await getProperties();
  const retreats = await getRetreats();

  return (
    <HomePageLists retreats={retreats} properties={properties} hosts={hosts} />
  );
}
