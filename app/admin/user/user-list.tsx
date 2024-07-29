"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { getUsers } from "@/actions/user-actions"; // Adjust the import path as needed
import { UserListItem } from "./user-list-item"; // Adjust the import path as needed

export function UserList() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const fetchedUsers = await getUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                // Handle error (e.g., show error message to user)
            }
        }

        fetchUsers();
    }, []);

    return (
        <div className="mt-8 space-y-4">
            {users.map((user) => (
                <UserListItem key={user.id} user={user} />
            ))}
        </div>
    );
}