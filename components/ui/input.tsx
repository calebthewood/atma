import * as React from "react";
import {
  Calendar,
  DollarSign,
  Home,
  Lock,
  Mail,
  Map,
  Phone,
  Search,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

const IconMap = {
  map: Map,
  dollar: DollarSign,
  house: Home,
  search: Search,
  mail: Mail,
  phone: Phone,
  user: User,
  calendar: Calendar,
  lock: Lock,
};

export type IconType = keyof typeof IconMap;

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    const IconComponent = icon ? IconMap[icon] : null;

    return (
      <div className="relative">
        {IconComponent && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <IconComponent size={18} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
