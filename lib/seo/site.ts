import type { Metadata } from "next";

export const SITE_URL = "https://aakashvatsal.com";
export const SITE_NAME = "Aakash Vatsal";
export const SITE_LOCALE = "en_IN";
export const SITE_LANGUAGE = "en-IN";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export const PERSON_ID = `${SITE_URL}/#aakash-vatsal`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const DEFAULT_TITLE = "Aakash Vatsal | Founder, Builder & HSAKAA";
export const DEFAULT_DESCRIPTION =
  "Aakash Vatsal is a founder and builder sharing the companies, systems, ideas, reading, health experiments, media and HSAKAA behind his work.";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}`;
}

export function cleanText(value?: string | null, maxLength = 158) {
  if (!value) {
    return "";
  }

  const cleaned = value
    .replace(/<[^>]*>/g, " ")
    .replace(/[`*_>#\[\]{}()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  absoluteTitle?: boolean;
};

export function buildPublicMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = `${SITE_NAME} website`,
  absoluteTitle = false,
}: PublicMetadataInput): Metadata {
  const canonical = path || "/";

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: {
        [SITE_LANGUAGE]: canonical,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title,
      description,
      images: [
        image === DEFAULT_OG_IMAGE
          ? {
              url: image,
              width: 1200,
              height: 630,
              alt: imageAlt,
            }
          : {
              url: image,
              alt: imageAlt,
            },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
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

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
