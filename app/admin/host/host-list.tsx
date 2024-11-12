"use client";

import { useEffect, useState } from "react";
import { getHosts } from "@/actions/host-actions"; // Adjust the import path as needed
import { Host } from "@prisma/client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { HostListItem } from "./host-list-item"; // Adjust the import path as needed

export function HostList() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHosts() {
      try {
        setIsLoading(true);
        const fetchedHosts = await getHosts();
        setHosts(fetchedHosts);
        setError(null);
      } catch (error) {
        console.error("Error fetching hosts:", error);
        setError("Failed to fetch hosts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHosts();
  }, []);

  if (isLoading) {
    return <div>Loading hosts...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">
            <span className="sr-only">Profile Picture</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead className="hidden md:table-cell">Phone</TableHead>
          <TableHead className="hidden md:table-cell">ID</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {hosts.map((host) => (
          <HostListItem key={host.id} host={host} />
        ))}
      </TableBody>
    </Table>
  );
}
