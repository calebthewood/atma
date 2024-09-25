"use client";

import { useEffect, useState } from "react";
import {
  getProperties,
  PropertiesWithImages,
} from "@/actions/property-actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function PropertyListItem({ property }: { property: PropertiesWithImages }) {
  return (
    <TableRow>
      <TableCell>{property.name}</TableCell>
      <TableCell>{property.email}</TableCell>
      <TableCell>{property.address}</TableCell>
      <TableCell>{property.type}</TableCell>
      <TableCell>{property.host.name}</TableCell>
    </TableRow>
  );
}

export function PropertyList() {
  const [properties, setProperties] = useState<PropertiesWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        setIsLoading(true);
        const fetchedProperties = await getProperties();
        setProperties(fetchedProperties);
        setError(null);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setError("Failed to fetch properties. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProperties();
  }, []);

  if (isLoading) {
    return <div>Loading properties...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Host Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <PropertyListItem key={property.id} property={property} />
        ))}
      </TableBody>
    </Table>
  );
}
