import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn("animate-spin", className)} />;
}
