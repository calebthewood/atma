import React from "react";
import { PropertyWithBasicRelations } from "@/actions/property-actions";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type Amenity = {
  id: string;
  type: string;
  categoryValue: string | null;
  categoryName: string | null;
  name: string;
  value: string;
};

type PropertyAmenity = {
  amenity: Amenity;
  propertyId: string;
  amenityId: string;
};

type PropertyPoliciesProps = {
  property: PropertyWithBasicRelations;
  amenities: PropertyAmenity[];
  className?: string;
};

const PolicySection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8 max-w-56">
    <h3 className="mb-4 text-lg font-semibold">{title}</h3>
    {children}
  </div>
);

const PolicyItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const BooleanIndicator = ({ value }: { value: boolean | null | undefined }) => {
  if (value === null || value === undefined) return null;
  return <span className="ml-2">{value ? "YES" : "NO"}</span>;
};

const formatTime = (time: string | null | undefined) => {
  return <span className="ml-2">{time ? time : "Not specified"}</span>;
};

export default function PropertyPolicies({
  property,
  amenities,
  className,
}: PropertyPoliciesProps) {
  return (
    <Card className="w-full border-none shadow-none">
      <CardContent
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        <PolicySection title="Check-in Information">
          <PolicyItem
            label="Check-in Time"
            value={formatTime(property?.checkInTime)}
          />
          <PolicyItem
            label="Check-out Time"
            value={formatTime(property?.checkOutTime)}
          />
          <PolicyItem
            label="Front Desk Hours"
            value={property?.frontDeskHours || "Not specified"}
          />
        </PolicySection>

        <PolicySection title="Children">
          <PolicyItem
            label="Children Allowed"
            value={<BooleanIndicator value={property?.childrenAllowed} />}
          />
        </PolicySection>

        <PolicySection title="Pet Policy">
          <PolicyItem
            label="Pets Allowed"
            value={<BooleanIndicator value={property?.petsAllowed} />}
          />
          <PolicyItem
            label="Service Animals Allowed"
            value={<BooleanIndicator value={property?.serviceAnimalsAllowed} />}
          />
        </PolicySection>
        {amenities.length > 0 && (
          <PolicySection title="Parking & Transportation">
            {amenities.map((pa) => (
              <PolicyItem
                key={pa.amenityId}
                label={pa.amenity.name}
                value={""}
              />
            ))}
          </PolicySection>
        )}
      </CardContent>
    </Card>
  );
}
