"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Clock, Users } from "lucide-react";

import { formatDate } from "@/lib/utils";

interface RetreatInstance {
  id: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  availableSlots: number;
  isFull: boolean;
}

interface RetreatInstancesProps {
  instances: RetreatInstance[];
}

const RetreatInstances = ({ instances }: RetreatInstancesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleInstanceClick = (instanceId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("instance", instanceId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    // Only set the first instance if there are instances and no instance is currently selected
    if (instances.length > 0 && !searchParams.get("instance")) {
      const params = new URLSearchParams(searchParams);
      params.set("instance", instances[0]?.id);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [instances, searchParams, router]);

  const selectedInstanceId = searchParams.get("instance");

  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Available Dates</h3>
        <p className="text-sm opacity-80">Select a retreat date to book</p>
      </div>

      <div className="grid gap-4">
        {instances.map((instance, i) => (
          <div
            key={i + instance?.id}
            onClick={() => handleInstanceClick(instance?.id)}
            className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-richBlack hover:bg-richBlack/30 hover:shadow-md ${
              selectedInstanceId === instance?.id
                ? "bg-richWhite/10 border-richBlack"
                : "border-gray-200/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-richBlack" />
                <div>
                  <div className="font-medium">
                    {formatDate(instance.startDate)}
                  </div>
                  <div className="text-richWhite/80 text-sm">
                    to {formatDate(instance.endDate)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  <span>{instance?.duration ?? "NA"} days</span>
                </div>

                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  <span>
                    {instance.isFull
                      ? "Full"
                      : `${instance.availableSlots} spots left`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RetreatInstances;
