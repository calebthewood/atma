"use client";

import React from "react";

import { BookingBar } from "@/components/booking-bar";

interface LayoutProps {
  children: React.ReactNode;
}
export default function CatalogLayout({ children }: LayoutProps) {
  return (
    <>
      <BookingBar />
      <main className="md:container">{children}</main>
    </>
  );
}
