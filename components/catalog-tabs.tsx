import React from "react";

import {
  CustomTabsTrigger,
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/tabs";

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface CatalogTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
}

export function CatalogTabs({ tabs, defaultTab }: CatalogTabsProps) {
  return (
    <Tabs defaultValue={defaultTab || tabs[0]?.value} className="w-full">
      <TabsList className="h-full w-full justify-evenly rounded border border-richBlack bg-white/20 p-2 py-2 shadow backdrop-blur">
        {tabs.map((tab) => (
          <CustomTabsTrigger
            key={tab.value}
            value={tab.value}
            className="w-min p-0"
          >
            {tab.label}
          </CustomTabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="p-2">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
