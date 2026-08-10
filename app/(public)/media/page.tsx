import type { Metadata } from "next";

import { MediaPage } from "@/components/features/media/MediaPage";
import { getMediaPosts } from "@/lib/media";

export const metadata: Metadata = {
  title: "Media | Aakash Vatsal",
  description:
    "Founder thoughts, product updates, sports technology ideas, videos and behind-the-scenes content from Aakash Vatsal.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const response = await getMediaPosts({
    limit: 100,
  });

  return (
    <MediaPage posts={response.items} />
  );
}