import Link from "next/link";
import { getProgram } from "@/actions/program-actions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { H3 } from "@/components/typography";
import { PriceModForm } from "@/app/admin/price-form";
import { ImageManagement } from "@/app/admin/property/image-management";

import { ProgramForm } from "../../program-form";

export default async function Page(props: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const params = await props.params;
  const result = await getProgram(params.id);

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  const tabs = [
    {
      value: "general",
      label: "General",
      href: `/admin/program/${params.id}/general`,
    },
    {
      value: "images",
      label: "Images",
      href: `/admin/program/${params.id}/images`,
    },
    {
      value: "prices",
      label: "Pricing",
      href: `/admin/program/${params.id}/prices`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <H3>Edit Program</H3>
        <p className="text-sm text-muted-foreground">Edit existing program.</p>
      </div>
      <Tabs defaultValue={params.slug} className="w-full max-w-2xl">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} asChild value={tab.value}>
              <Link href={tab.href} className="relative" scroll={false}>
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Manage the main program details and settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramForm program={result.program} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Upload, reorder, or remove program images.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageManagement recordId={params.id} recordType="program" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle>Price Modifications</CardTitle>
              <CardDescription>
                Manage price adjustments and special rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriceModForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
