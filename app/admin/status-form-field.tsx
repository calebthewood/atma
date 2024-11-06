"use client";

import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig = {
  draft: {
    label: "Draft",
    bgColor: "bg-background text-muted-foreground",
    description: "Only visible to admins",
  },
  published: {
    label: "Published",
    bgColor: "bg-primary text-primary-foreground",
    description: "Visible to all users",
  },
  archived: {
    label: "Archived",
    bgColor: "bg-muted text-muted-foreground",
    description: "Hidden from all views",
  },
} as const;

type StatusFieldProps = {
  form: any; // Replace with your specific form type from react-hook-form
};

export function StatusField({ form }: StatusFieldProps) {
  const currentStatus = form.watch("status");

  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <div className="flex flex-col space-y-2 border-l-4 p-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">Status</label>
            <div
              className={cn(
                "rounded-full px-2 py-1 text-xs font-medium",
                statusConfig[field.value as keyof typeof statusConfig]?.bgColor
              )}
            >
              {statusConfig[field.value as keyof typeof statusConfig]?.label}
            </div>
          </div>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([value, config]) => (
                <SelectItem
                  key={value}
                  value={value}
                  className="items-center gap-x-4"
                >
                  <span>{config.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {config.description}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
}
