import { ProgramInstance, RetreatInstance } from "@prisma/client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EntityInstancesTabsProps = {
  instances: ProgramInstance[] | RetreatInstance[];
};

const EntityInstancesTabs = ({ instances }: EntityInstancesTabsProps) => {
  // If no instances, don't render anything
  if (!instances?.length) return null;

  // Create tab data from instances
  const tabsData = instances.map((instance) => ({
    value: instance?.id,
    label: `${instance.duration} Nights`,
    content: instance.itinerary,
  }));

  // Format itinerary content into bullet points
  const formatItinerary = (content: string) => {
    return content
      .split(";")
      .filter(Boolean)
      .map((item, index) => (
        <li key={index} className="mb-2">
          {item.trim()}
        </li>
      ));
  };

  return (
    <Tabs
      defaultValue={tabsData[0]?.value}
      className="mx-auto w-full max-w-3xl"
    >
      <TabsList className="mb-4 w-full flex-wrap justify-evenly bg-transparent">
        {tabsData.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="min-w-32 border-b border-primary bg-transparent py-2 text-sm font-semibold uppercase leading-none text-[#494846]/80 data-[state=active]:bg-transparent data-[state=active]:text-[#841729] data-[state=active]:shadow-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabsData.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="min-h-64">
          <ul className="list-disc pl-6">{formatItinerary(tab.content)}</ul>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default EntityInstancesTabs;
