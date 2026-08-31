"use client";

import Link from "next/link";
import { BookOpen, Bot, Home, Menu, Search } from "lucide-react";
import { motion } from "framer-motion";

export function MobileNav() {
  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#050608]/90 px-5 py-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6FF32] text-sm font-black text-[#030608]">
            AV
          </div>

          <div>
            <p className="text-sm font-bold text-white">Aakash Vatsal</p>
            <p className="text-xs text-white/45">Personal OS</p>
          </div>
        </Link>

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
          className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white"
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      </header>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#050608]/95 px-5 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between text-xs font-medium text-white/50">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-[#C6FF32]"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          <Link href="/journal" className="flex flex-col items-center gap-1">
            Journal
          </Link>

          <Link
            href="/hsakaa"
            className="flex flex-col items-center gap-1 text-white"
          >
            <Bot className="h-5 w-5 text-[#C6FF32]" />
            HSAKAA
          </Link>

          <Link href="/library" className="flex flex-col items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Library
          </Link>

          <Link href="/search" className="flex flex-col items-center gap-1">
            <Search className="h-4 w-4" />
            Search
          </Link>
        </div>
      </div>
    </>
  );
}