import React from "react";
import { CountryProperties } from "@/actions/location-actions";

import { getCountryName } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RetreatItem } from "@/components/retreat-item";

const TabbedSearchResults = ({ results }: { results: CountryProperties[] }) => {
  // Create a "All" tab plus a tab for each country
  const countries: string[] = [...new Set(results.map((r) => r.country))];

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4 w-full flex-wrap justify-evenly bg-transparent">
        <TabsTrigger
          value="all"
          className="min-w-32 bg-transparent text-sm font-semibold uppercase leading-none text-[#494846]/80 data-[state=active]:text-[#841729] data-[state=active]:shadow-none"
        >
          All
        </TabsTrigger>
        {countries.map((country) => (
          <TabsTrigger
            key={country}
            value={country}
            className="min-w-32 bg-transparent text-sm font-semibold uppercase leading-none text-[#494846]/80 data-[state=active]:text-[#841729] data-[state=active]:shadow-none"
          >
            {getCountryName(country)}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* All Countries Tab Content */}
      <TabsContent value="all" className="min-h-96">
        <div className="flex flex-wrap gap-8">
          {results.map((countryGroup, i) => (
            <div
              key={`${countryGroup.country}-${i}-tab`}
              className="flex flex-col rounded bg-card p-4"
            >
              <h3 className="mb-4 text-xl font-semibold">
                {getCountryName(countryGroup.country)}
                <span className="ml-2 text-sm font-normal">
                  {`${countryGroup.properties.length} destination${countryGroup.properties.length > 1 ? "s" : ""}`}
                </span>
              </h3>
              <div className="flex flex-wrap gap-4">
                {countryGroup.properties.map((property, i) => (
                  <div
                    key={property?.id + `${i * 3.7}`}
                    className="flex flex-col"
                  >
                    <RetreatItem
                      retreat={property}
                      imgUrl={property.images?.[0]?.filePath}
                      segment="destinations"
                      className="w-[300px]"
                      aspectRatio="square"
                      width={300}
                      height={300}
                    />
                    <div className="mt-2 w-[290px] overflow-hidden text-ellipsis text-sm text-muted-foreground">
                      {property.address}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Individual Country Tab Contents */}
      {countries.map((country) => (
        <TabsContent key={country} value={country} className="min-h-96">
          <div className="flex flex-wrap gap-4">
            {results
              .find((r) => r.country === country)
              ?.properties.map((property, i) => (
                <div
                  key={property?.id + `${i * 3.7}`}
                  className="flex flex-col"
                >
                  <RetreatItem
                    retreat={property}
                    imgUrl={property.images?.[0]?.filePath}
                    segment="destinations"
                    className="w-[300px]"
                    aspectRatio="square"
                    width={300}
                    height={300}
                  />
                  <div className="mt-2 w-[290px] overflow-hidden text-ellipsis text-sm text-muted-foreground">
                    {property.address}
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TabbedSearchResults;
