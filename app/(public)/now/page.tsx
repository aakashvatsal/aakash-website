import type { Metadata } from "next";

import { NowPage } from "@/components/features/now/NowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getNowHistory, getPublicNowStatus } from "@/lib/now";
import {
  PERSON_ID,
  SITE_URL,
  buildPublicMetadata,
  breadcrumbJsonLd,
  cleanText,
} from "@/lib/seo/site";

const title = "Now: Current Focus";
const description =
  "See what Aakash Vatsal is working on, building, reading and thinking about right now, plus a recent history of public Now updates.";

export const metadata: Metadata = buildPublicMetadata({
  title,
  description,
  path: "/now",
  imageAlt: "What Aakash Vatsal is doing now",
});

export default async function Page() {
  const [now, history] = await Promise.all([
    getPublicNowStatus(),
    getNowHistory(1, 7),
  ]);

  const currentDescription = cleanText(
    now?.description || now?.headline || now?.currentFocus || now?.activity,
    500,
  );

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/now#webpage`,
    url: `${SITE_URL}/now`,
    name: `${title} | Aakash Vatsal`,
    description: currentDescription || description,
    inLanguage: "en-IN",
    about: {
      "@id": PERSON_ID,
    },
    author: {
      "@id": PERSON_ID,
    },
    dateModified: now?.updatedAt || now?.lastActivityAt || undefined,
  };

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "Now", path: "/now" },
        ])}
      />
      <NowPage now={now} history={history.data} />
    </>
  );
}
