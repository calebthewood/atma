"use client";

import { useState } from "react";
import { updateUser } from "@/actions/user-actions";
import { User } from "@prisma/client";
import { ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserListItemProps {
  user: User;
}

export function UserListItem({ user }: UserListItemProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(user.role);

  const handleChange = async (role: string) => {
    if (role === value) return;
    const res = await updateUser(user.id, { role });
    if (res) setValue(res.role);
  };

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={user.image || ""} />
          <AvatarFallback>
            {user.fname?.[0]}
            {user.lname?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{user.username}</p>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="ml-auto w-28 justify-end">
            {value}{" "}
            <ChevronDown className="text-muted-foreground ml-2 size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="end">
          <Command>
            <CommandInput placeholder="Select new role..." />
            <CommandList>
              <CommandEmpty>No roles found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="user"
                  className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
                  onSelect={(currentValue) => {
                    handleChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <p>User</p>
                  <p className="text-muted-foreground text-sm">
                    Can view and book retreats.
                  </p>
                </CommandItem>
                <CommandItem
                  value="admin"
                  className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
                  onSelect={(currentValue) => {
                    handleChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <p>Admin</p>
                  <p className="text-muted-foreground text-sm">
                    Can view, comment and edit.
                  </p>
                </CommandItem>
                <CommandItem
                  value="host"
                  className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
                  onSelect={(currentValue) => {
                    handleChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <p>Host</p>
                  <p className="text-muted-foreground text-sm">
                    Can create, edit retreats.
                  </p>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
