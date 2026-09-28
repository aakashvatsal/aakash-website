import type { Metadata } from "next";

import { AidPage } from "@/components/features/aid/AidPage";

export const metadata: Metadata = {
  title: "HSAKAA Aid",
  description:
    "HSAKAA Aid is a human-reviewed assistance fund that starts with a ₹30,000 monthly allocation on October 1, 2026.",
};

export default function Page() {
  return <AidPage />;
}
