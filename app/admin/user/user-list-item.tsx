import { ChevronDown } from "lucide-react";
import { User } from "@prisma/client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
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
    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
                <Avatar>
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>{user.fname?.[0]}{user.lname?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        {user.role}{" "}
                        <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end">
                    <Command>
                        <CommandInput placeholder="Select new role..." />
                        <CommandList>
                            <CommandEmpty>No roles found.</CommandEmpty>
                            <CommandGroup>
                                <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                    <p>User</p>
                                    <p className="text-sm text-muted-foreground">
                                        Can view and book retreats.
                                    </p>
                                </CommandItem>
                                <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                    <p>Admin</p>
                                    <p className="text-sm text-muted-foreground">
                                        Can view, comment and edit.
                                    </p>
                                </CommandItem>
                                <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                    <p>Host</p>
                                    <p className="text-sm text-muted-foreground">
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