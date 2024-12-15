import { Host } from "@prisma/client"; // Make sure to import the Host type
import { MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";

interface HostListItemProps {
  host: Host;
}

export function HostListItem({ host }: HostListItemProps) {
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Avatar>
          <AvatarImage src={host.profilePic || ""} />
          <AvatarFallback>{host.name?.[0]}</AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="text-nowrap font-medium">{host.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{host.type}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{host.email}</TableCell>
      <TableCell className="hidden md:table-cell">{host.phone}</TableCell>
      <TableCell className="hidden md:table-cell">{host.id}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
