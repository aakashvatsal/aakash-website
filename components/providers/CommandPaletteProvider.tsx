"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CommandPalette } from "@/components/layout/CommandPalette";

type CommandPaletteContextValue = {
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
};

const CommandPaletteContext =
  createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openCommandPalette = useCallback(() => {
    setOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openCommandPalette,
      closeCommandPalette,
    }),
    [openCommandPalette, closeCommandPalette]
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}

      <CommandPalette
        controlledOpen={open}
        onOpenChange={setOpen}
      />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    throw new Error(
      "useCommandPalette must be used inside CommandPaletteProvider"
    );
  }

  return context;
}