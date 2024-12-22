"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentHostUser,
  getHosts,
  upsertHostUser,
} from "@/actions/host-user-actions";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
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

interface FormData {
  hostId: string;
  permissions: string[];
}

interface HostUserFormProps {
  subjectUserId: string;
  adminUserId: string;
}

export function HostUserForm({
  adminUserId,
  subjectUserId,
}: HostUserFormProps) {
  const [hosts, setHosts] = useState<{ id: string; name: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    defaultValues: {
      hostId: "",
      permissions: ["c", "r", "u", "d"],
    },
  });

  // Load hosts and current host user data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get all hosts and current host user
        const [hostsData, currentHostUser] = await Promise.all([
          getHosts(),
          getCurrentHostUser(subjectUserId),
        ]);

        setHosts(hostsData);

        // If user has an existing host association, set the form values
        if (currentHostUser.success && currentHostUser.data) {
          form.reset({
            hostId: currentHostUser.data.hostId,
            permissions: currentHostUser.data.permissions.split(""),
          });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [subjectUserId, form]);

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      const result = await upsertHostUser({
        userId: subjectUserId,
        hostId: values.hostId,
        permissions: values.permissions.join(""),
        assignedBy: adminUserId,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Host association updated successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update host association",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="hostId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("hostId", value);
                }}
              >
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
          name="permissions"
          render={({ field }) => (
            <FormItem>
              {["c", "r", "u", "d"].map((permission) => (
                <FormField
                  key={permission}
                  control={form.control}
                  name="permissions"
                  render={({ field: permissionField }) => (
                    <FormItem
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <FormControl>
                        <Checkbox
                          checked={permissionField.value?.includes(permission)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...permissionField.value, permission]
                              : permissionField.value.filter(
                                  (p) => p !== permission
                                );
                            permissionField.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {permission === "c"
                          ? "Create"
                          : permission === "r"
                            ? "Read"
                            : permission === "u"
                              ? "Update"
                              : "Delete"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Host Association"}
        </Button>
      </form>
    </Form>
  );
}
