"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { QuickLink } from "../shared";
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

export default function RetreatSection() {
  const slides = [
    {
      image: "/img/iStock-1929812569.jpg",
      title: "FEATURED RETREAT OR PROGRAM",
      desc: "10 Days of Yoga and Meditation, leave your boyfriend at home!",
    },
    {
      image: "/img/iStock-1812905796.jpg",
      title: "UPCOMING RETREAT",
      desc: "Hopefully they paid us to be featured prominently.",
    },
    // Add more slides as needed
  ];
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
        <Link href="/retreats">See All Retreats</Link>
      </Button>
    </section>
  );
}
