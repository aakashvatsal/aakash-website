import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NewMemoryPage() {
  redirect("/admin/hsakaa/memory#memory-inbox");
}
