import type { Metadata } from "next";

import { MediaPage } from "@/components/features/media/MediaPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getMediaPosts } from "@/lib/media";
import {
  PERSON_ID,
  SITE_URL,
  buildPublicMetadata,
  breadcrumbJsonLd,
  cleanText,
} from "@/lib/seo/site";

const title = "Media & Social Content";
const description =
  "Videos, founder notes, product updates, experiments and behind-the-scenes content from Aakash Vatsal across LinkedIn, Instagram, YouTube and X.";

export const metadata: Metadata = buildPublicMetadata({
  title,
  description,
  path: "/media",
  imageAlt: "Media and social content from Aakash Vatsal",
});

export const dynamic = "force-dynamic";

export default async function Page() {
  const response = await getMediaPosts({
    limit: 100,
  });

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/media#collection`,
    url: `${SITE_URL}/media`,
    name: `${title} | Aakash Vatsal`,
    description,
    inLanguage: "en-IN",
    author: {
      "@id": PERSON_ID,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: response.items.slice(0, 50).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SocialMediaPosting",
          headline: post.content.title,
          description: cleanText(
            post.content.hook ||
              post.content.shortDescription ||
              post.content.caption,
            280,
          ),
          datePublished: post.publishing?.publishedAt || post.date,
          url: post.publishing?.externalPostUrl || `${SITE_URL}/media`,
          author: {
            "@id": PERSON_ID,
          },
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "Media", path: "/media" },
        ])}
      />
      <MediaPage posts={response.items} />
    </>
  );
}
