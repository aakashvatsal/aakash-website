import type { Metadata } from "next";

import { HsakaaPage } from "@/components/features/hsakaa/HsakaaPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHsakaaLiveContext } from "@/lib/hsakaa";
import {
  PERSON_ID,
  SITE_URL,
  buildPublicMetadata,
  breadcrumbJsonLd,
} from "@/lib/seo/site";

const title = "HSAKAA: Personal AI & Memory System";
const description =
  "Talk with HSAKAA, Aakash Vatsal's personal AI and memory system built from public information, ongoing work, ideas and selected public context.";

export const metadata: Metadata = buildPublicMetadata({
  title,
  description,
  path: "/hsakaa",
  imageAlt: "HSAKAA, the personal AI and memory system by Aakash Vatsal",
});

export default async function Page() {
  const { now, items } = await getHsakaaLiveContext();

  const webApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE_URL}/hsakaa#application`,
    name: "HSAKAA",
    url: `${SITE_URL}/hsakaa`,
    description,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en-IN",
    creator: {
      "@id": PERSON_ID,
    },
  };

  return (
    <>
      <JsonLd data={webApplicationJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "HSAKAA", path: "/hsakaa" },
        ])}
      />
      <HsakaaPage now={now} liveContext={items} />
    </>
  );
}
