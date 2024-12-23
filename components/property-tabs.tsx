import React from "react";
import { PropertyWithBasicRelations } from "@/actions/property-actions";
import { Program, Retreat } from "@prisma/client";



import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";





interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode | string;
}

export const PropertyTabs = ({
  property,
}: {
  property: PropertyWithBasicRelations;
}) => {
  const tabsData = [
    {
      value: "amenity-healing",
      label: "Spa Services",
      content: property?.amenityHealing ?? "",
    },
    {
      value: "amenity-cuisine",
      label: "Cuisine",
      content: property?.amenityCuisine ?? "",
    },
    {
      value: "amenity-activity",
      label: "Activities",
      content: property?.amenityActivity ?? "",
    },
    {
      value: "amenity-facility",
      label: "Facilities",
      content: property?.amenityFacility ?? "",
    },
  ];

  // Filter out tabs with falsy content
  const availableTabs = tabsData.filter((tab) => tab.content);
  // If no tabs have content, don't render anything
  if (availableTabs.length === 0) return null;

  return <TabsComponent tabs={availableTabs} />;
};

export function EntityTabs({ entity }: { entity: Program | Retreat | null }) {
  const BenefitsList = () => (
    <ul>
      {entity?.keyBenefits.split(";").map((kb, i) => (
        <li className="mx-10 list-disc pl-6" key={`key-benefit-${i}`}>
          {kb}
        </li>
      ))}
    </ul>
  );

  const tabsData = [
    {
      value: "desc",
      label: "Overview",
      content: entity?.desc ?? "",
    },
    {
      value: "keyBenefits",
      label: "Key Benefits",
      content: <BenefitsList />,
    },
    {
      value: "programApproach",
      label: "Program Approach",
      content: entity?.programApproach ?? "",
    },
    {
      value: "whoIsthisFor",
      label: "Who is this for?",
      content: entity?.whoIsthisFor ?? "",
    },
  ];

  // Filter out tabs with falsy content
  const availableTabs = tabsData.filter((tab) => tab.content);
  // If no tabs have content, don't render anything
  if (availableTabs.length === 0) return null;

  return <TabsComponent tabs={availableTabs} />;
}

const TabsComponent: React.FC<{ tabs: TabItem[] }> = ({ tabs }) => (
  <Tabs defaultValue={tabs[0].value} className="mx-auto w-full max-w-3xl">
    <TabsList className="mb-4 w-full flex-wrap justify-evenly bg-transparent">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="min-w-32 border-b border-primary bg-transparent py-5 text-sm font-semibold uppercase leading-none text-[#494846]/80 data-[state=active]:bg-transparent data-[state=active]:text-[#841729] data-[state=active]:shadow-none md:py-2"
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>

    {tabs.map((tab) => (
      <TabsContent
        key={tab.value}
        value={tab.value}
        className="pt:16 min-h-64 px-2 md:px-10 md:pt-2"
      >
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
);
