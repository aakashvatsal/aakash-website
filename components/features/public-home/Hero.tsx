"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    setIsTouchDevice(
      window.matchMedia("(pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0
    );
  }, []);

  const disableMotion = isTouchDevice || prefersReducedMotion;

  return (
    <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden px-6 py-16 md:px-12 md:py-20 lg:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(198,255,50,0.18),transparent_34%)]" />

      <div className="relative grid min-h-[70svh] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <motion.div
          initial={
            disableMotion
              ? false
              : {
                  opacity: 0,
                  y: 28,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: disableMotion ? 0 : 0.8,
            ease: "easeOut",
          }}
        >
          <p className="mb-6 text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32] md:mb-8">
            The Problem
          </p>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-6xl md:text-8xl xl:text-[112px]">
            Most people
            <br />
            have goals.
            <br />
            <span className="text-white/35">Very few have systems.</span>
          </h1>

          <div className="mt-8 max-w-2xl space-y-4 text-lg leading-8 text-white/65 md:mt-10 md:text-xl md:leading-9">
            <p>I’ve spent years building systems.</p>

            <p>
              For <span className="text-white">athletes</span>. For{" "}
              <span className="text-white">businesses</span>. For{" "}
              <span className="text-white">myself</span>.
            </p>

            <p className="text-white">
              My name is{" "}
              <span className="text-[#C6FF32]">Aakash Vatsal.</span>
            </p>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-white/40 md:mt-14">
            <span className="text-[#C6FF32]">↓</span>
            <span>Start the documentary</span>
          </div>
        </motion.div>

        <motion.div
          initial={
            disableMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0.96,
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: disableMotion ? 0 : 1,
            delay: disableMotion ? 0 : 0.2,
            ease: "easeOut",
          }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] md:rounded-[48px]">
            <Image
              src="/images/hero-portrait.jpg"
              alt="Aakash Vatsal"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover grayscale"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#030608] via-transparent to-transparent" />
          </div>

          <div className="relative -mt-10 mx-3 rounded-[24px] border border-white/10 bg-black/80 p-5 backdrop-blur-xl md:absolute md:-bottom-8 md:left-6 md:right-6 md:mx-0 md:mt-0 md:rounded-[32px] md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#C6FF32]">
              Live Brain
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <Status label="Building" value="8lete" />
              <Status label="Reading" value="Pragmatic Programmer" />
              <Status label="Thinking" value="Distribution" />
              <Status label="Learning" value="Agentic AI" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}