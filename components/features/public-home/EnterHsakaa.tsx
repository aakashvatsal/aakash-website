"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

const questions = [
  "Why did you build 8lete?",
  "What are you learning right now?",
  "How do you think about discipline?",
  "What book changed your thinking?",
];

const MotionButton = motion.create(Button);

export function EnterHsakaa() {
  return (
    <Reveal>
      <section className="relative overflow-hidden border-t border-white/10 px-6 py-40 md:px-12 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(198,255,50,0.18),transparent_38%)]" />

        <div className="relative mx-auto max-w-6xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
            Final Experiment
          </p>

          <h2 className="mt-8 text-6xl font-black leading-[0.9] tracking-[-0.07em] md:text-8xl lg:text-9xl">
            Can knowledge
            <br />
            live forever?
          </h2>

          <p className="mx-auto mt-10 max-w-2xl text-xl leading-9 text-white/55">
            I’m trying to find out. HSAKAA is my AI twin — trained on my work,
            books, companies, routines, decisions and thinking.
          </p>

          <div className="mx-auto mt-16 max-w-3xl rounded-[40px] border border-white/10 bg-white/[0.035] p-5 text-left backdrop-blur-xl">
            <p className="px-3 pb-4 text-xs font-black uppercase tracking-[0.25em] text-white/35">
              What would you ask me if I were sitting across the table?
            </p>

            <input
              className="w-full rounded-[28px] border border-white/10 bg-[#030608] px-6 py-5 text-lg outline-none placeholder:text-white/25"
              placeholder="Ask HSAKAA anything..."
            />

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {questions.map((question) => (
                <motion.button
                  key={question}
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
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/55 transition hover:border-[#C6FF32]/40 hover:text-white"
                >
                  {question}
                </motion.button>
              ))}
            </div>

            <Link href="/hsakaa">
              <MotionButton
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
                className="mt-6 w-full py-4"
              >
                Enter HSAKAA <ArrowRight className="ml-2 h-4 w-4" />
              </MotionButton>
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}