import { notFound } from "next/navigation";

import { MediaForm } from "@/components/admin/media/MediaForm";
import { getMediaPostById } from "@/lib/api/media";

interface EditMediaPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditMediaPage({
    params,
}: EditMediaPageProps) {
    const { id } = await params;

    const post =
        await getMediaPostById(id);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#030608]">
            <div className="mx-auto max-w-[1500px]">
                <h1 className="text-5xl font-black tracking-[-0.05em]">
                    Edit Media
                </h1>

                <p className="mt-4 text-white/40">
                    Update your content strategy,
                    publishing and analytics.
                </p>

                <div className="mt-12">
                    <MediaForm
                        mode="edit"
                        initialData={post}
                    />
                </div>
            </div>
        </main>
    );
}