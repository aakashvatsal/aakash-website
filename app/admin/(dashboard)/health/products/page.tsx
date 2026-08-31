import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { ProductsManager } from "@/components/admin/health-os/ProductsManager";
import { getProducts } from "@/lib/api/health-extended";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  try {
    const products = await getProducts();
    return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Products" description="Track consumables, durable gear, stock, usage, expiry and repurchase decisions." /><HealthOsNav /><ProductsManager initialProducts={products.data} /></main>;
  } catch (error) {
    return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Products" description="Personal product inventory." /><HealthOsNav /><div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">{error instanceof Error ? error.message : "Unable to load Products OS."}</div></main>;
  }
}
