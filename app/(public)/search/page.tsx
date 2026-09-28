import type { Metadata } from "next";

import { SearchPage } from "@/components/features/search/SearchPage";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the public Aakash Vatsal website.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function Page() {
  return <SearchPage />;
}
