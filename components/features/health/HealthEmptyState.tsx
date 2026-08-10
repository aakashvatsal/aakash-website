import { BodyText } from "@/components/ui/BodyText";
import { Container } from "@/components/ui/Container";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function HealthEmptyState() {
  return (
    <main className="min-h-screen bg-[#030608] text-white">
      <section className="py-28">
        <Container>
          <Eyebrow>
            Human Operating System
          </Eyebrow>

          <DisplayTitle className="mt-6 max-w-5xl">
            No public health data available.
          </DisplayTitle>

          <BodyText className="mt-8 max-w-2xl">
            The latest public health snapshot
            will appear here once it is
            published.
          </BodyText>
        </Container>
      </section>
    </main>
  );
}