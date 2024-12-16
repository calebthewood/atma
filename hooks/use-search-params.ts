"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useUpdateSearchParam = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearchParams = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      // Create new URL with updated search params
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return updateSearchParams;
};

/** Generates url for search page passed to Link tags in search bar  */
export const useSearchURL = (baseRoute = "search") => {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    // Filter out any empty parameters
    Array.from(params.entries()).forEach(([key, value]) => {
      if (!value) params.delete(key);
    });
    return `/${baseRoute}?${params.toString()}`;
  }, [searchParams]);
};
