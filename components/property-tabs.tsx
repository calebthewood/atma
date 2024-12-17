import { PropertyWithRelations } from "@/actions/property-actions";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PropertyTabs = ({
  property,
}: {
  property: PropertyWithRelations | null;
}) => {
  const tabsData = [
    {
      value: "amenity-healing",
      label: "Spa Services",
      content: property?.amenityHealing,
    },
    {
      value: "amenity-cuisine",
      label: "Cuisine",
      content: property?.amenityCuisine,
    },
    {
      value: "amenity-activity",
      label: "Activities",
      content: property?.amenityActivity,
    },
    {
      value: "amenity-facility",
      label: "Facilities",
      content: property?.amenityFacility,
    },
  ];

  // Filter out tabs with falsy content
  const availableTabs = tabsData.filter((tab) => tab.content);

  // If no tabs have content, don't render anything
  if (availableTabs.length === 0) return null;

  const defaultValue = availableTabs[0]?.value;

  return (
    <Tabs defaultValue={defaultValue} className="mx-auto w-full max-w-3xl">
      <TabsList className="mb-4 w-full flex-wrap justify-evenly bg-transparent">
        {availableTabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="min-w-32 border-b border-primary bg-transparent py-2 text-sm font-semibold uppercase leading-none text-[#494846]/80 data-[state=active]:bg-transparent data-[state=active]:text-[#841729] data-[state=active]:shadow-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {availableTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="min-h-64">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PropertyTabs;
