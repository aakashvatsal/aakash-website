import { BodyText } from "@/components/ui/BodyText";
import { Container } from "@/components/ui/Container";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function JournalHero() {
  return (
    <section className="pb-20 pt-28">
      <Container>
        <Eyebrow>Daily Journal</Eyebrow>

        <DisplayTitle className="mt-6 max-w-6xl">
          The public notebook behind the systems.
        </DisplayTitle>

        <BodyText className="mt-8 max-w-3xl">
          Ideas become systems. Systems become companies. This is
          where both begin.
        </BodyText>
      </Container>
    </section>
  );
}