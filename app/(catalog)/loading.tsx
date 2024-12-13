import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <div className="flex h-96 flex-col items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
