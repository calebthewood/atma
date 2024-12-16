import { searchRetreats } from "@/actions/search-actions";

import SearchResultsPage from "@/components/entity/search-components";

export default function RetreatSearchPage() {
  return (
    <SearchResultsPage
      segment="retreats"
      searchFunction={searchRetreats}
      entityLabel={{
        singular: "retreat",
        plural: "retreats",
      }}
    />
  );
}
