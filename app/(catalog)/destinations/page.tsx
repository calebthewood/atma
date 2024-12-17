import { getGroupedDestinations } from "@/actions/location-actions";

import DestinationPage from "./components";

export default async function Page() {
  const initDestinations = await getGroupedDestinations();
  return <DestinationPage destinations={initDestinations} />;
}
