"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import Image from "next/image";

type CompanySceneProps = {
  eyebrow: string;
  name: string;
  title: string;
  description: string;
  image: string;
  stats: { label: string; value: string }[];
};

export function CompanyScene({
  eyebrow,
  name,
  title,
  description,
  image,
  stats,
}: CompanySceneProps) {
  return (
    <Reveal>
      <section className="border-t border-white/10 px-6 py-28 md:px-12 lg:px-16">
        <div className="grid min-h-[82vh] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-8 text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
              {eyebrow}
            </p>

            <h2 className="text-6xl font-black leading-[0.9] tracking-[-0.07em] md:text-8xl">
              {name}
            </h2>

            <p className="mt-8 max-w-2xl text-3xl font-black leading-tight tracking-[-0.04em] text-white/90 md:text-5xl">
              {title}
            </p>

            <p className="mt-8 max-w-xl text-xl leading-9 text-white/55">
              {description}
            </p>

            <div className="mt-12 grid grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-black text-[#C6FF32]">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="mt-12 text-sm font-black text-[#C6FF32]"
            >
              View case study →
            </motion.button>
          </div>

          <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative aspect-[4/5] overflow-hidden rounded-[48px] border border-white/10 bg-white/[0.03]"
          >
            <Image src={image} alt={name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030608]/70 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>
    </Reveal>
  );
}