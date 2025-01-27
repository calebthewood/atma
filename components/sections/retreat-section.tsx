"use client";

import Link from "next/link";
import { RetreatWithAllRelations } from "@/actions/retreat-actions";
import { motion } from "framer-motion";

import { getCountryName } from "@/lib/utils";

import { Button } from "../ui/button";
import HeroCarousel from "../ui/carousel-hero";
import { SectionHeader } from "./components";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function RetreatSection({
  retreats,
}: {
  retreats: RetreatWithAllRelations[];
}) {
  const slides =
    retreats?.map((r) => ({
      image: r.images[0].filePath,
      title: r.name,
      desc: r.property.city + ", " + getCountryName(r.property.country),
    })) || [];

  return (
    <section
      id="retreat-section"
      className="my-32 flex flex-col gap-y-8 md:container"
    >
      <SectionHeader title="Retreats Collection" subtitle="Handpicked" />
      <motion.div
        className="scrollbar-hide flex w-full justify-center gap-1 lg:flex-nowrap"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <HeroCarousel slides={slides} />
      </motion.div>
      <Button
        asChild
        className="mx-auto mt-12 rounded-full bg-[#841729] px-8 py-4 uppercase"
      >
        <Link href="/retreats#top">See All Retreats</Link>
      </Button>
    </section>
  );
}
