"use client";

import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { H3, Lead } from "@/components/typography";

import {
  AmenityType,
  EntityType,
  getAmenitiesByType,
  getEntityAmenities,
  updateEntityAmenity,
} from "../../actions/amenity";
import { Amenity } from "@prisma/client";

interface AmenityCheckboxesProps {
  entityId: string;
  entityType: EntityType;
  amenityType: AmenityType;
}

export const AmenityCheckboxes = ({
  entityId,
  entityType,
  amenityType,
}: AmenityCheckboxesProps) => {
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
      const existing = grouped.get(amenity.categoryName ?? "") || [];
      grouped.set(amenity.categoryName ?? "", [...existing, amenity]);
    });
    return grouped;
  }, [amenities]);

  // Load amenities and current selections
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate inputs before making server calls
        if (!entityId) throw new Error("Entity ID is required");

        const [allAmenities, entityAmenities] = await Promise.all([
          getAmenitiesByType(amenityType),
          getEntityAmenities(entityType, entityId, amenityType),
        ]);

        if (allAmenities.data) {
          setAmenities(allAmenities.data);
        }
        if (entityAmenities.data) {
          setSelectedAmenities(new Set(entityAmenities.data.map((a) => a?.id)));
        }
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
  }, [entityId, entityType, amenityType]);

  const handleToggle = async (amenityId: string) => {
    try {
      const action = selectedAmenities.has(amenityId)
        ? "disconnect"
        : "connect";

      await updateEntityAmenity(entityType, entityId, amenityId, action);

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
      let errorMessage = "Failed to update amenity";
      if (err instanceof z.ZodError) {
        errorMessage = `Invalid input: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      console.error("Error updating amenity:", err);
      toast({
        title: "Error",
        description: errorMessage,
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
    <>
      <H3>Amenities</H3>
      <Lead className="text-sm">
        Amenities can be set on Property, Program, or Retreat
      </Lead>
      <div className="space-y-6">
        {Array.from(amenitiesByCategory.entries()).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h3 className="font-medium">{category}</h3>
            <div className="grid grid-cols-2 gap-4 rounded bg-white/20 p-4 backdrop-blur md:grid-cols-2">
              {items.map((amenity) => (
                <div key={amenity?.id}>
                  <label className="flex flex-row items-center space-x-3 space-y-0 text-sm font-normal">
                    <Checkbox
                      checked={selectedAmenities.has(amenity?.id)}
                      onCheckedChange={() => handleToggle(amenity?.id)}
                      aria-label={`Toggle ${amenity.name}`}
                    />
                    <span className="text-nowrap">{amenity.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
