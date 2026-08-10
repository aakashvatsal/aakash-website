import Reveal from "@/components/ui/Reveal";

import type { Book } from "@/lib/library";
import type { JournalEntry } from "@/types/journal";
import type { HealthEntry } from "@/types/health";
import type { PublicMediaPost } from "@/types/public-media";
import type { Company } from "@/types/company";

import { BrainDump } from "./BrainDump";
import { EnterHsakaa } from "./EnterHsakaa";
import { Hero } from "./Hero";
import { Identity } from "./Identity";
import { Library } from "./Library";
import { Mission } from "./Mission";
import { OpenNotebook } from "./OpenNotebook";
import { ProofCompanies } from "./ProofCompanies";
import { DailyJournal } from "./DailyJournal";
import { SocialFootprint } from "./SocialFootprint";
import { HealthSystem } from "./HealthSystem";

interface PublicHomeProps {
  books: Book[];
  journals: JournalEntry[];
  health: HealthEntry | null;
  media: PublicMediaPost[];
  companies: Company[];
}

export function PublicHome({
  books,
  journals,
  health,
  media,
  companies,
}: PublicHomeProps) {
  return (
    <main className="bg-[#030608] text-white">
      <div className="mx-auto max-w-[1500px]">
        <Hero />

        <Reveal>
          <Identity />
        </Reveal>

        <Reveal>
          <Mission />
        </Reveal>

        <Reveal>
          <ProofCompanies companies={companies} />
        </Reveal>

        <Reveal>
          <DailyJournal journals={journals.slice(0, 4)} />
        </Reveal>

        <Reveal>
          <SocialFootprint media={media} />
        </Reveal>

        <Reveal>
          <OpenNotebook />
        </Reveal>

        <Reveal>
          <Library books={books} />
        </Reveal>

        <Reveal>
          <BrainDump />
        </Reveal>

        <Reveal>
          <HealthSystem health={health} />
        </Reveal>

        <Reveal>
          <EnterHsakaa />
        </Reveal>
      </div>
    </main>
  );
}