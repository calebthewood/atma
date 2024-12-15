import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AmenityForm } from "../amenity-form";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const amenity = await prisma.amenity.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          propertyAmenities: true,
          hostAmenities: true,
          retreatAmenities: true,
          programAmenities: true,
        },
      },
    },
  });

  if (!amenity) {
    notFound();
  }

  const totalConnections =
    amenity._count.propertyAmenities +
    amenity._count.hostAmenities +
    amenity._count.retreatAmenities +
    amenity._count.programAmenities;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Amenity</h1>
        <p className="text-muted-foreground">
          Update the details for {amenity.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Edit the basic details of this amenity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AmenityForm amenity={amenity} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Current usage of this amenity across different entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Total Connections</h4>
                  <p className="text-2xl font-bold">{totalConnections}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Properties</span>
                    <span className="font-medium">
                      {amenity._count.propertyAmenities}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Hosts</span>
                    <span className="font-medium">
                      {amenity._count.hostAmenities}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Retreats</span>
                    <span className="font-medium">
                      {amenity._count.retreatAmenities}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Programs</span>
                    <span className="font-medium">
                      {amenity._count.programAmenities}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Destructive actions for this amenity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                disabled={totalConnections > 0}
                title={
                  totalConnections > 0
                    ? "Cannot delete amenity with active connections"
                    : "Delete this amenity"
                }
              >
                Delete Amenity
              </Button>
              {totalConnections > 0 && (
                <p className="text-muted-foreground mt-2 text-sm">
                  Remove all connections before deleting this amenity
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
