"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminPaginatedHosts } from "@/actions/host-actions";
import { updateUser } from "@/actions/user-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Host, HostUser } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  hostId: z.string().min(1, "Host is required"),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission is required"),
  companyRole: z.string().min(1, "Company role is required"),
});

type FormData = z.infer<typeof formSchema>;

interface HostUserFormProps {
  userId: string;
  hostUser?: HostUser;
}

const roles = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
];

const permissions = [
  { value: "c", label: "Create" },
  { value: "r", label: "Read" },
  { value: "u", label: "Update" },
  { value: "d", label: "Delete" },
];

export function HostUserForm({ userId, hostUser }: HostUserFormProps) {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hostId: hostUser?.hostId || "",
      permissions: hostUser?.permissions?.split("") || ["c", "r", "u", "d"],
      companyRole: hostUser?.companyRole || "admin",
    },
  });

  useEffect(() => {
    const loadHosts = async () => {
      try {
        const res = await getAdminPaginatedHosts();
        if (res.ok && res.data) {
          setHosts(res.data.items);
        }
      } catch (error) {
        console.error("Failed to load hosts:", error);
        toast({
          title: "Error",
          description: "Failed to load hosts",
          variant: "destructive",
        });
      }
    };

    loadHosts();
  }, []);

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      const result = await updateUser(userId, {
        hostUsers: [
          {
            hostId: values.hostId,
            permissions: values.permissions.join(""),
            companyRole: values.companyRole,
          },
        ],
      });

      if (!result.ok) {
        throw new Error(result.message);
      }

      toast({
        title: "Success",
        description: "Host association updated successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update host association",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="hostId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a host" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hosts.map((host) => (
                        <SelectItem key={host.id} value={host.id}>
                          {host.name || "Unnamed Host"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Permissions</FormLabel>
                    <FormDescription>
                      Select the permissions for this user
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {permissions.map((permission) => (
                      <FormField
                        key={permission.value}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => (
                          <FormItem
                            key={permission.value}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(
                                  permission.value
                                )}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, permission.value]
                                    : field.value.filter(
                                        (p) => p !== permission.value
                                      );
                                  field.onChange(newValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {permission.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Host Association"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
