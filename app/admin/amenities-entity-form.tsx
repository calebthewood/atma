"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAmenitiesByType,
  getEntityAmenities,
  updateEntityAmenity,
} from "@/actions/amenity";
import type { Amenity as PrismaAmenity } from "@prisma/client";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

export type EntityType = "property" | "host" | "retreat" | "program";
export type AmenityType = "activity" | "amenity";

type AmenitiesFormProps = {
  recordId: string;
  recordType: EntityType;
  amenityType: AmenityType;
};

type Amenity = Pick<
  PrismaAmenity,
  "id" | "type" | "categoryValue" | "categoryName" | "name" | "value"
>;

export function AmenitiesEntityForm({
  recordId,
  recordType,
  amenityType,
}: AmenitiesFormProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [connectedAmenityIds, setConnectedAmenityIds] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  // Group amenities by category
  const amenitiesByCategory = useMemo(() => {
    const grouped = new Map<string, Amenity[]>();
    amenities.forEach((amenity) => {
      const category = amenity.categoryName ?? "Other";
      const existing = grouped.get(category) || [];
      grouped.set(category, [...existing, amenity]);
    });
    return grouped;
  }, [amenities]);

  useEffect(() => {
    loadData();
  }, [recordId, recordType, amenityType]);

  const loadData = async () => {
    try {
      setError(null);

      // Fetch all amenities of the specified type and the ones connected to this entity
      const [allAmenities, connectedAmenities] = await Promise.all([
        getAmenitiesByType(amenityType),
        getEntityAmenities(recordType, recordId, amenityType),
      ]);

      setAmenities(allAmenities);
      setConnectedAmenityIds(new Set(connectedAmenities.map((a) => a.id)));
    } catch (err) {
      let errorMessage = "Failed to load amenities";
      if (err instanceof z.ZodError) {
        errorMessage = `Invalid input: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
    }
  };

  const handleToggle = async (amenityId: string) => {
    try {
      const action = connectedAmenityIds.has(amenityId)
        ? "disconnect"
        : "connect";

      await updateEntityAmenity(recordType, recordId, amenityId, action);

      // Update local state
      setConnectedAmenityIds((prev) => {
        const next = new Set(prev);
        if (action === "connect") {
          next.add(amenityId);
        } else {
          next.delete(amenityId);
        }
        return next;
      });

      toast({
        title: "Success",
        description: `${action === "connect" ? "Added" : "Removed"} amenity successfully`,
      });
    } catch (err) {
      console.error("Error updating amenity:", err);
      toast({
        title: "Error",
        description: "Failed to update amenity connection",
        variant: "destructive",
      });

      // Refresh data in case of error to ensure UI is in sync
      loadData();
    }
  };

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  if (amenities.length === 0) return null;

  return (
    <div className="space-y-6">
      {Array.from(amenitiesByCategory.entries()).map(([category, items]) => (
        <Card key={category}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-medium">{category}</h3>
              <div className="grid grid-cols-2 gap-4 rounded bg-white/20 p-4 backdrop-blur lg:grid-cols-3">
                {items.map((amenity) => (
                  <div key={amenity.id}>
                    <label className="flex flex-row items-center space-x-3 space-y-0 text-sm font-normal">
                      <Checkbox
                        checked={connectedAmenityIds.has(amenity.id)}
                        onCheckedChange={() => handleToggle(amenity.id)}
                      />
                      <span>{amenity.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
