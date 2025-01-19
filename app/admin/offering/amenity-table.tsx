"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAmenity, getAmenitiesByType } from "@/actions/amenity";
import type { Amenity } from "@prisma/client";
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AmenityListItemProps = {
  amenity: Amenity;
  onEdit?: (amenity: Amenity) => void;
  onDelete?: (amenity: Amenity) => void;
};

function AmenityListItem({ amenity, onEdit, onDelete }: AmenityListItemProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{amenity.name}</TableCell>
      <TableCell>{amenity.value}</TableCell>
      <TableCell>{amenity.type}</TableCell>
      <TableCell>{amenity.categoryName || "Uncategorized"}</TableCell>
      <TableCell>{amenity.custom ? "Yes" : "No"}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit?.(amenity)}
          className="size-8 p-0"
        >
          <span className="sr-only">Edit</span>
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (
              window.confirm("Are you sure you want to delete this amenity?")
            ) {
              onDelete?.(amenity);
            }
          }}
          className="size-8 p-0"
        >
          <span className="sr-only">Delete</span>
          <Trash className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function AmenityList() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"activity" | "amenity">("activity");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Amenity>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    value: true,
    type: true,
    category: true,
    custom: true,
  });

  const router = useRouter();

  useEffect(() => {
    fetchAmenities();
  }, [type]);

  async function fetchAmenities() {
    try {
      setIsLoading(true);
      const fetchedAmenities = await getAmenitiesByType(type);
      if (fetchedAmenities.data) {
        setAmenities(fetchedAmenities.data);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      setError("Failed to fetch amenities. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredAmenities = amenities
    .filter(
      (amenity) =>
        amenity.name.toLowerCase().includes(search.toLowerCase()) ||
        amenity.value.toLowerCase().includes(search.toLowerCase()) ||
        (amenity.categoryName?.toLowerCase() || "").includes(
          search.toLowerCase()
        )
    )
    .sort((a, b) => {
      const aValue = (a[sortField] || "").toString().toLowerCase();
      const bValue = (b[sortField] || "").toString().toLowerCase();
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const handleEdit = (amenity: Amenity) => {
    router.push(`/admin/offerings/${amenity?.id}`);
  };

  const handleDelete = async (amenity: Amenity) => {
    try {
      await deleteAmenity(amenity?.id);
      await fetchAmenities();
    } catch (error) {
      console.error("Error deleting amenity:", error);
      setError("Failed to delete amenity. Please try again later.");
    }
  };

  const handleSort = (field: keyof Amenity) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (isLoading) {
    return <div>Loading amenities...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search amenities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={type}
            onValueChange={(value) => setType(value as "activity" | "amenity")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activity">Activity</SelectItem>
              <SelectItem value="amenity">Amenity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(visibleColumns).map(([key, value], i) => (
              <DropdownMenuCheckboxItem
                key={i + key}
                className="capitalize"
                checked={value}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, [key]: checked }))
                }
              >
                {key}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.name && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("name")}>
                  Name
                  <CaretSortIcon className="ml-2 size-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.value && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("value")}>
                  Value
                  <CaretSortIcon className="ml-2 size-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.type && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("type")}>
                  Type
                  <CaretSortIcon className="ml-2 size-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.category && (
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("categoryName")}
                >
                  Category
                  <CaretSortIcon className="ml-2 size-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.custom && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("custom")}>
                  Custom
                  <CaretSortIcon className="ml-2 size-4" />
                </Button>
              </TableHead>
            )}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAmenities.map((amenity, i) => (
            <AmenityListItem
              key={i + amenity?.id}
              amenity={amenity}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
