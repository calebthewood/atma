"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProgramInstance, RetreatInstance } from "@prisma/client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EntityInstancesTabsProps = {
  instances: ProgramInstance[] | RetreatInstance[];
};

const EntityInstancesTabs = ({ instances }: EntityInstancesTabsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Early return if no instances

  // Create tab data from instances
  const tabsData = instances.map((instance) => ({
    value: instance.id,
    label: `${instance.duration} Nights`,
    content: instance.itinerary,
  }));

  // Set initial instance in URL if not present
  useEffect(() => {
    if (!searchParams.get("instance") && tabsData.length > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("instance", tabsData[0].value);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router, tabsData]);

  // Get current instance from URL or default to first instance
  const currentInstance = searchParams.get("instance") || tabsData[0].value;

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("instance", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

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
  if (!instances?.length) return null;
  return (
    <Tabs
      value={currentInstance}
      onValueChange={handleTabChange}
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
