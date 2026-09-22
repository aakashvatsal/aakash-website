import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HobbiesManager } from "@/components/admin/hobbies/HobbiesManager";
import { getHobbiesOverview, getHobbyPracticePlan } from "@/lib/api/hobbies";
import { getLibraryItems } from "@/lib/api/library";

export default async function HobbiesPage() {
  try {
    const [overview, practicePlan, libraryItems] = await Promise.all([
      getHobbiesOverview(),
      getHobbyPracticePlan(),
      getLibraryItems(),
    ]);

    return (
      <main className="space-y-8">
        <AdminPageHeader
          eyebrow="Personal OS · Deliberate Practice"
          title="Hobbies"
          description="Five active hobbies in one six-month growth season, with a maximum of two hobbies per day, structured curricula, and owner-confirmed completion only."
        />
        <HobbiesManager
          initialOverview={overview}
          initialPracticePlan={practicePlan}
          libraryItems={libraryItems}
        />
      </main>
    );
  } catch (error) {
    return (
      <main className="space-y-8">
        <AdminPageHeader
          eyebrow="Personal OS · Deliberate Practice"
          title="Hobbies"
          description="Your active learning system."
        />
        <div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">
          {error instanceof Error ? error.message : "Unable to load Hobbies."}
        </div>
      </main>
    );
  }
}
