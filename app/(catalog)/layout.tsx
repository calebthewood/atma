"use client";
import React from "react";
import { Suspense } from "react";

import { BookingBar } from "@/components/booking-bar";

interface LayoutProps {
  children: React.ReactNode;
}
export default function CatalogLayout({ children }: LayoutProps) {
  return (
    <>
      <Suspense>
        <BookingBar />
      </Suspense>
      {children}
    </>
  );
}
