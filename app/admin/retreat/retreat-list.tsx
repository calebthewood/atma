"use client";

import { useEffect, useState } from "react";
import { getRetreats } from "@/actions/retreat-actions"; // Adjust this import path as needed
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Define the Retreat type based on your Prisma schema
type Retreat = {
    id: string;
    name: string;
    date: string;
    duration: string;
    host: {
        name: string;
        id: string
    };
    property: {
        name: string;
        id: string
    };
};

function RetreatListItem({ retreat }: { retreat: Retreat; }) {
    return (
        <TableRow>
            <TableCell>{retreat.name}</TableCell>
            <TableCell>{new Date(retreat.date).toLocaleDateString()}</TableCell>
            <TableCell>{retreat.duration}</TableCell>
            <TableCell>{retreat.host.name}</TableCell>
            <TableCell>{retreat.property.name}</TableCell>
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
                const fetchedRetreats = await getRetreats();
                setRetreats(fetchedRetreats);
                setError(null);
            } catch (error) {
                console.error("Error fetching retreats:", error);
                setError("Failed to fetch retreats. Please try again later.");
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
                    <RetreatListItem key={retreat.id} retreat={retreat} />
                ))}
            </TableBody>
        </Table>
    );
}