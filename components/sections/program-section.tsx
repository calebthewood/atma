"use client";

import Image from "next/image";
import Link from "next/link";
import { ProgramWithAllRelations } from "@/actions/program-actions";
import { motion } from "framer-motion";

import { getCountryName } from "@/lib/utils";

import { Button } from "../ui/button";
import { SectionHeader } from "./components";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function ProgramSection({
  programs,
}: {
  programs: ProgramWithAllRelations[];
}) {
  return (
    <section
      id="program-section"
      className="flex flex-col gap-y-5 md:container"
    >
      <SectionHeader title="Year Round Programs" subtitle="Tailored" />
      <motion.div
        className="scrollbar-hide flex w-full flex-row justify-center gap-6 overflow-x-auto pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <ProgramCard
          program={programs[0]}
          bgImg={"/img/d7c603c013e3bc7700877d6fe86146eb.jpeg"}
        />
        <ProgramCard
          program={programs[1]}
          bgImg={"/img/5ca62cc1177639cb7673c34c4666b9b8.jpeg"}
        />
        <ProgramCard
          program={programs[2]}
          bgImg={"/img/19fe529dc2e9c52dde4c7dd99b41b9f0.jpeg"}
        />
      </motion.div>

      <div className="flex w-full justify-center">
        <Button
          asChild
          className="mx-auto rounded-full bg-[#841729] px-8 py-4 uppercase"
        >
          <Link href="/programs#top">See All Programs</Link>
        </Button>
      </div>
    </section>
  );
}

const ProgramCard = ({
  program,
  bgImg,
}: {
  program: ProgramWithAllRelations;
  bgImg: string;
}) => {
  const imgSrc = program.images[0].filePath;
  return (
    <Link prefetch href={`/programs/${program?.id}`}>
      <motion.div
        className="group relative aspect-[3/4] w-80 shrink-0 overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105"
        variants={cardVariants}
      >
        <Image
          src={imgSrc || bgImg}
          alt={program?.name || "Program Image"}
          fill
          className="animate-fade-in object-cover transition-transform duration-500 group-hover:scale-110"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

        <div className="absolute inset-0 flex flex-col items-center justify-between p-8 text-sm font-normal text-white">
          <div className="text-center text-sm font-normal uppercase tracking-wide">
            {program?.property?.name || "PROPERTY NAME"}
            <br />
            {program?.property?.city && program?.property?.country
              ? `${program?.property.city}, ${getCountryName(program?.property?.country)}`
              : "City, Country"}
          </div>

          <div className="text-center font-broad text-lg font-normal uppercase tracking-wide">
            {program?.name || "Retreat Name"}
            <br />
            {program?.programs?.[0]?.duration || "7+ nights"}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
