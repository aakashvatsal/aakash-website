import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookDetailPage } from "@/components/features/library/BookDetailPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBookBySlug } from "@/lib/library";
import {
  PERSON_ID,
  SITE_URL,
  buildPublicMetadata,
  breadcrumbJsonLd,
  cleanText,
} from "@/lib/seo/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return {
      title: "Book not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const author = book.author || book.authors?.join(", ");
  const description =
    cleanText(book.changed || book.summary, 158) ||
    `Reading notes and highlights from ${book.title}${author ? ` by ${author}` : ""}.`;

  return buildPublicMetadata({
    title: `${book.title} | Library`,
    description,
    path: `/library/${book.slug}`,
    image: book.coverImageUrl || undefined,
    imageAlt: `${book.title}${author ? ` by ${author}` : ""}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/library/${encodeURIComponent(book.slug)}`;
  const authors = book.authors?.length
    ? book.authors
    : book.author
      ? [book.author]
      : [];

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: `${book.title} | Library | Aakash Vatsal`,
    description: cleanText(book.changed || book.summary, 500),
    inLanguage: "en-IN",
    author: {
      "@id": PERSON_ID,
    },
    about: {
      "@type": "Book",
      name: book.title,
      author: authors.map((name) => ({
        "@type": "Person",
        name,
      })),
      image: book.coverImageUrl || undefined,
      genre: book.category || undefined,
    },
  };

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "Library", path: "/library" },
          { name: book.title, path: `/library/${book.slug}` },
        ])}
      />
      <BookDetailPage slug={slug} />
    </>
  );
}
