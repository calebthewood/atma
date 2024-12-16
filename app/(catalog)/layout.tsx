"use client";

import React, { Suspense } from "react";

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
      <main className="md:container">{children}</main>
    </>
  );
}
