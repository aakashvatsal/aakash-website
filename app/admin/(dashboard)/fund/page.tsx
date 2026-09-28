import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FundDashboard } from "@/components/admin/fund/FundDashboard";

export const dynamic = "force-dynamic";

export default function AdminFundPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA"
        title="Fund"
        description="Human-reviewed assistance cases, evidence, decisions, delivery and monthly allocation."
      />
      <FundDashboard />
    </main>
  );
}
