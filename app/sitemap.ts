import type { MetadataRoute } from "next";

import { getCompanies } from "@/lib/companies";
import { getPublicJournalEntries } from "@/lib/journal";
import { getBooks, type Book } from "@/lib/library";
import { SITE_URL } from "@/lib/seo/site";
import type { JournalEntry } from "@/types/journal";

export const revalidate = 3600;

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/hsakaa", changeFrequency: "weekly", priority: 0.9 },
  { path: "/aid", changeFrequency: "weekly", priority: 0.9 },
  { path: "/companies", changeFrequency: "weekly", priority: 0.85 },
  { path: "/journal", changeFrequency: "daily", priority: 0.85 },
  { path: "/media", changeFrequency: "weekly", priority: 0.8 },
  { path: "/library", changeFrequency: "weekly", priority: 0.8 },
  { path: "/health", changeFrequency: "daily", priority: 0.7 },
  { path: "/now", changeFrequency: "daily", priority: 0.75 },
];

async function getAllJournalEntries(): Promise<JournalEntry[]> {
  const first = await getPublicJournalEntries({ page: 1, limit: 100 });
  const entries = [...first.data];

  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    const response = await getPublicJournalEntries({ page, limit: 100 });
    entries.push(...response.data);
  }

  return entries;
}

async function getAllBooks(): Promise<Book[]> {
  const first = await getBooks({ page: 1, limit: 100 });
  const books = [...first.data];

  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    const response = await getBooks({ page, limit: 100 });
    books.push(...response.data);
  }

  return books;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [companies, journalEntries, books] = await Promise.all([
    getCompanies(),
    getAllJournalEntries(),
    getAllBooks(),
  ]);

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...companies.map((company) => ({
      url: `${SITE_URL}/companies/${encodeURIComponent(company.slug)}`,
      lastModified: company.updatedAt ? new Date(company.updatedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: company.isFeatured ? 0.8 : 0.65,
    })),
    ...journalEntries.map((entry) => ({
      url: `${SITE_URL}/journal/${encodeURIComponent(entry.slug)}`,
      lastModified: entry.updatedAt ? new Date(entry.updatedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...books.map((book) => ({
      url: `${SITE_URL}/library/${encodeURIComponent(book.slug)}`,
      lastModified: book.lastReadAt ? new Date(book.lastReadAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: book.isFavourite ? 0.7 : 0.6,
    })),
  ];
}
