import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <div className="flex size-full items-center justify-center">
      <LoadingSpinner className="mr-2" /> Loading...
    </div>
  );
}
