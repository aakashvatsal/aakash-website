import { BookDetailPage } from "@/components/features/library/BookDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <BookDetailPage slug={slug} />;
}