"use client";

import { useEffect, useState } from "react";
import { getRetreats } from "@/actions/retreat-actions"; // Adjust this import path as needed

import { Host, Property, Retreat } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

type ExtendedRetreat = Retreat & {
  host: Host;
  property: Property;
};

type RetreatListItem = Pick<
  ExtendedRetreat,
  "id" | "name" | "date" | "duration"
> & {
  host: Pick<Host, "id" | "name">;
  property: Pick<Property, "id" | "name">;
};

function RetreatListItem({ retreat }: { retreat: Retreat }) {
  return (
    <TableRow>
      <TableCell>{retreat.name}</TableCell>
      {/* <TableCell>{new Date(retreat.date).toLocaleDateString()}</TableCell> */}
      <TableCell>{retreat.duration}</TableCell>
      {/* <TableCell>{retreat.host.name}</TableCell>
      <TableCell>{retreat.property.name}</TableCell> */}
    </TableRow>
  );
}

export function RetreatList() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRetreats() {
      try {
        setIsLoading(true);
        const response = await getRetreats();
        if (response.success && response.data) {
          setRetreats(response.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load programs",
            variant: "destructive",
          });
        }
        setError(null);
      } catch (error) {
        console.error("Error fetching retreats:", error);
        setError("Failed to fetch retreats. Please try again later.");
        console.error("Error fetching programs:", error);
        toast({
          title: "Error",
          description: "Failed to load programs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchRetreats();
  }, []);

  if (isLoading) {
    return <div>Loading retreats...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Host Name</TableHead>
          <TableHead>Property Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {retreats.map((retreat) => (
          <RetreatListItem key={retreat?.id} retreat={retreat} />
        ))}
      </TableBody>
    </Table>
  );
}
