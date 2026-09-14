import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MyChatsWorkspace } from "@/components/admin/hsakaa/my-chats/MyChatsWorkspace";

export default function MyChatsPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Communication learning"
        title="My Chats"
        description="Import real conversations, link them to People, and let HSAKAA learn how you actually communicate without exposing the raw chats publicly."
      />
      <MyChatsWorkspace />
    </main>
  );
}
