"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  AsiaIcon,
  EuropeIcon,
  NorthAmericaIcon,
  SouthAmericaIcon,
} from "@/components/geography/lo-res";

import { SectionHeader } from "./components";

const CONTINENTS = [
  {
    id: "asia",
    name: "Asia",
    icon: AsiaIcon,
    href: "/destinations/asia",
  },
  {
    id: "europe",
    name: "Europe",
    icon: EuropeIcon,
    href: "/destinations/europe",
  },
  {
    id: "north-america",
    name: "North America",
    icon: NorthAmericaIcon,
    href: "/destinations/north-america",
  },
  {
    id: "south-america",
    name: "South America",
    icon: SouthAmericaIcon,
    href: "/destinations/south-america",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function DestinationSection() {
  return (
    <section
      id="destination-section"
      className="my-32 flex flex-col gap-y-8 md:container"
    >
      <SectionHeader title="Destinations" subtitle="Discover Wellness By" />
      <motion.div
        className="scrollbar-hide flex w-full flex-wrap justify-center gap-1 lg:flex-nowrap"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {CONTINENTS.map((continent) => (
          <ContinentCard
            key={continent?.id}
            name={continent.name}
            icon={continent.icon}
            href={continent.href}
          />
        ))}
      </motion.div>

      {/* <div className="flex w-full justify-center pt-4">
        <Button
          asChild
          variant="default"
          className="rounded-full px-8 py-6 text-sm uppercase tracking-wider transition-transform hover:scale-105"
        >
          <Link href="/destinations">Explore All Destinations</Link>
        </Button>
      </div> */}
    </section>
  );
}

interface ContinentCardProps {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const ContinentCard = ({ name, icon: Icon, href }: ContinentCardProps) => {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex aspect-square w-80 shrink-0 flex-col items-center justify-center rounded-2xl transition-all duration-300 hover:bg-black/10"
    >
      <Link href={href} className="flex flex-col items-center gap-4">
        <Icon className="size-64 text-black/70 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-xl font-medium tracking-wide text-black/70">
          {name}
        </span>
      </Link>
    </motion.div>
  );
};
