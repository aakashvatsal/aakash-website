import { notFound } from "next/navigation";

import { CompanyForm } from "@/components/features/companies/CompanyForm";
import { getCompanyById } from "@/lib/api/companies";

interface EditCompanyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCompanyPage({
  params,
}: EditCompanyPageProps) {
  const { id } = await params;

  try {
    const company = await getCompanyById(id);

    return (
      <CompanyForm company={company}
      />
    );
  } catch {
    notFound();
  }
}