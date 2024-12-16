import { searchPrograms } from "@/actions/search-actions";

import SearchResultsPage from "@/components/entity/search-components";

export default function ProgramSearchPage() {
  return (
    <SearchResultsPage
      segment="programs"
      searchFunction={searchPrograms}
      entityLabel={{
        singular: "program",
        plural: "programs",
      }}
    />
  );
}
