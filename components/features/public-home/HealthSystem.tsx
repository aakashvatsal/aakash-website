"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import type { HealthEntry } from "@/types/health";

interface HealthSystemProps {
  health: HealthEntry | null;
}

export function HealthSystem({
  health,
}: HealthSystemProps) {
  if (!health) return null;

  const latestWorkout = health.workouts?.[0];

  const metrics = [
    {
      label: "Recovery",
      value:
        health.recovery?.recoveryScore != null
          ? `${health.recovery.recoveryScore}%`
          : "—",
    },
    {
      label: "Sleep",
      value:
        health.sleep?.durationHours != null
          ? `${health.sleep.durationHours} hrs`
          : "—",
    },
    {
      label: "Workout",
      value: latestWorkout
        ? latestWorkout.title ||
          latestWorkout.type.replaceAll("_", " ")
        : "Rest",
    },
    {
      label: "Steps",
      value:
        health.steps?.toLocaleString("en-IN") ??
        "—",
    },
    {
      label: "Energy",
      value:
        health.energyScore != null
          ? `${health.energyScore}/10`
          : "—",
    },
    {
      label: "Mood",
      value: health.mood
        .replaceAll("_", " ")
        .replace(
          /\b\w/g,
          (c) => c.toUpperCase(),
        ),
    },
  ];

  return (
    <Reveal>
      <section className="border-t border-white/10 px-6 py-32 md:px-12 lg:px-16">
        <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
              Human Operating System
            </p>

            <h2 className="mt-6 text-6xl font-black tracking-[-0.06em] md:text-8xl">
              Health fuels everything I build.
            </h2>

            <p className="mt-8 text-xl leading-9 text-white/55">
              Every company performs better when I
              perform better. This is today's
              operating snapshot.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (
              <motion.div
                key={metric.label}
                whileHover={{
                  y: -6,
                }}
                transition={{
                  duration: 0.25,
                }}
              >
                <SpotlightCard className="h-full rounded-[28px] border border-white/10 bg-white/[0.035] p-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
                    {metric.label}
                  </p>

                  <p className="mt-5 text-4xl font-black tracking-[-0.05em] text-[#C6FF32]">
                    {metric.value}
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}