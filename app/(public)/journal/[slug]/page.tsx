import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JournalDetailPage } from "@/components/features/journal/JournalDetailPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicJournalEntryBySlug } from "@/lib/journal";
import {
  DEFAULT_OG_IMAGE,
  PERSON_ID,
  SITE_NAME,
  SITE_URL,
  breadcrumbJsonLd,
  cleanText,
} from "@/lib/seo/site";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getEntry(slug: string) {
  try {
    return await getPublicJournalEntryBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) {
    return {
      title: "Journal entry not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    cleanText(entry.highlight || entry.content, 158) ||
    `A journal entry by Aakash Vatsal published on ${entry.date}.`;
  const path = `/journal/${entry.slug}`;

  return {
    title: `${entry.title} | Journal`,
    description,
    alternates: {
      canonical: path,
      languages: {
        "en-IN": path,
      },
    },
    openGraph: {
      type: "article",
      url: path,
      siteName: SITE_NAME,
      locale: "en_IN",
      title: entry.title,
      description,
      publishedTime: entry.publishedAt || entry.createdAt,
      modifiedTime: entry.updatedAt,
      authors: [SITE_URL],
      tags: entry.tags,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: entry.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/journal/${encodeURIComponent(entry.slug)}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    headline: entry.title,
    description: cleanText(entry.highlight || entry.content, 500),
    datePublished: entry.publishedAt || entry.createdAt,
    dateModified: entry.updatedAt,
    inLanguage: "en-IN",
    author: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Aakash Vatsal",
      url: SITE_URL,
    },
    publisher: {
      "@id": PERSON_ID,
    },
    keywords: entry.tags.join(", ") || undefined,
    articleSection: entry.type,
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "Journal", path: "/journal" },
          { name: entry.title, path: `/journal/${entry.slug}` },
        ])}
      />
      <JournalDetailPage entry={entry} />
    </>
  );
}
