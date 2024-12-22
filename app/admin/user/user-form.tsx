"use client";

import { useEffect, useState } from "react";
import { createUser, updateUser } from "@/actions/user-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  fname: z.string().optional(),
  lname: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .optional(),
  email: z.string().email({ message: "Invalid email address." }).optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  role: z.enum(["user", "host", "admin"]).default("user"),
  status: z
    .enum(["active", "inactive", "suspended", "deleted", "archived"])
    .default("active"),
});

type EditableFields = {
  [K in keyof z.infer<typeof formSchema>]: boolean;
};

interface UserFormProps {
  userId?: string;
  initialData?: z.infer<typeof formSchema> | null;
}

export function UserForm({ userId, initialData }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editableFields, setEditableFields] = useState<EditableFields>({
    fname: !userId,
    lname: !userId,
    username: !userId,
    email: !userId,
    phone: !userId,
    role: !userId,
    status: !userId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      fname: "",
      lname: "",
      username: "",
      email: "",
      phone: "",
      role: "user",
      status: "active",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (userId) {
        // Simplified update logic - only include edited fields
        const updatedFields = Object.entries(values)
          .filter(([key]) => editableFields[key as keyof EditableFields])
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        await updateUser(userId, updatedFields);
      } else {
        await createUser(values);
      }

      form.reset();
    } catch (error) {
      console.error(`Error ${userId ? "updating" : "creating"} user:`, error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderField = (
    name: keyof typeof editableFields,
    label: string,
    type = "text"
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>{label}</FormLabel>
        {userId && (
          <Switch
            checked={editableFields[name]}
            onCheckedChange={(checked) =>
              setEditableFields((prev) => ({ ...prev, [name]: checked }))
            }
          />
        )}
      </div>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type={type}
                {...field}
                disabled={userId ? !editableFields[name] : false}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {renderField("fname", "First Name")}
        {renderField("lname", "Last Name")}
        {renderField("username", "Username")}
        {renderField("email", "Email", "email")}
        {renderField("phone", "Phone")}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Role</FormLabel>
                {userId && (
                  <Switch
                    checked={editableFields.role}
                    onCheckedChange={(checked) =>
                      setEditableFields((prev) => ({ ...prev, role: checked }))
                    }
                  />
                )}
              </div>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={userId ? !editableFields.role : false}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="host">Host</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Status</FormLabel>
                {userId && (
                  <Switch
                    checked={editableFields.status}
                    onCheckedChange={(checked) =>
                      setEditableFields((prev) => ({
                        ...prev,
                        status: checked,
                      }))
                    }
                  />
                )}
              </div>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={userId ? !editableFields.status : false}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? userId
              ? "Updating..."
              : "Creating..."
            : userId
              ? "Update User"
              : "Create User"}
        </Button>
      </form>
    </Form>
  );
}
