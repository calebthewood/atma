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
    href: "/destinations?continent=asia",
  },
  {
    id: "europe",
    name: "Europe",
    icon: EuropeIcon,
    href: "/destinations?continent=europe",
  },
  {
    id: "north america",
    name: "North America",
    icon: NorthAmericaIcon,
    href: "/destinations?continent=north-america",
  },
  {
    id: "south america",
    name: "South America",
    icon: SouthAmericaIcon,
    href: "/destinations?continent=south-america",
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
      className="my-12 flex flex-col gap-y-8 md:container md:my-32"
    >
      <SectionHeader title="Destinations" subtitle="Discover Wellness By" />
      <motion.div
        className="scrollbar-hide grid w-full grid-cols-2 justify-center gap-1 md:grid-cols-2 lg:grid-cols-4"
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
      className="group relative flex aspect-square shrink-0 flex-col items-center justify-center rounded-2xl transition-all duration-300 hover:bg-black/10 md:m-1"
    >
      <Link href={href} className="flex flex-col items-center gap-4">
        <Icon className="size-32 text-foreground/70 transition-transform duration-300 group-hover:scale-110 sm:size-48 md:size-48 lg:size-56 xl:size-64" />
        <span className="text-lg font-medium tracking-wide text-foreground/70 sm:text-xl">
          {name}
        </span>
      </Link>
    </motion.div>
  );
};
