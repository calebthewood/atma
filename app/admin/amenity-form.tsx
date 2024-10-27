"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Amenity,
  AmenityType,
  EntityType,
  getAmenitiesByType,
  getEntityAmenities,
  updateEntityAmenity,
} from "@/actions/amenity";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

type AmenitiesFormProps = {
  recordId: string;
  recordType: EntityType;
  amenityType: AmenityType;
};

export function AmenitiesForm({
  recordId,
  recordType,
  amenityType,
}: AmenitiesFormProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
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
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allAmenities, entityAmenities] = await Promise.all([
          getAmenitiesByType(amenityType),
          getEntityAmenities(recordType, recordId, amenityType),
        ]);

        setAmenities(allAmenities);
        setSelectedAmenities(new Set(entityAmenities.map((a) => a.id)));
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
        setLoading(false);
      }
    };

    loadData();
  }, [recordId, recordType, amenityType]);

  const handleToggle = async (amenityId: string) => {
    try {
      const action = selectedAmenities.has(amenityId)
        ? "disconnect"
        : "connect";
      await updateEntityAmenity(recordType, recordId, amenityId, action);

      setSelectedAmenities((prev) => {
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
        description: "Failed to update amenity",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">
          Loading amenities...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  if (amenities.length === 0) {
    return (
      <div className="rounded-md bg-muted p-4">
        <div className="text-sm text-muted-foreground">No amenities found</div>
      </div>
    );
  }

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
                        checked={selectedAmenities.has(amenity.id)}
                        onCheckedChange={() => handleToggle(amenity.id)}
                      />
                      <span className="">{amenity.name}</span>
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
