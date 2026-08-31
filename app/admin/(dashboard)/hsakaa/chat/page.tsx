import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PrivateHsakaaChat } from "@/components/admin/hsakaa/chat/PrivateHsakaaChat";

export default function PrivateHsakaaPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Personal OS AI"
        title="Private HSAKAA"
        description="Chat with HSAKAA using your private Personal OS context. These conversations are isolated from the public website."
      />
      <PrivateHsakaaChat />
    </main>
  );
}
