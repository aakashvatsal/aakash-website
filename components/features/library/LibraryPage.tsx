import { BodyText } from "@/components/ui/BodyText";
import { Container } from "@/components/ui/Container";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Eyebrow } from "@/components/ui/Eyebrow";

import {
  getBooks,
} from "@/lib/library";

import {
  LibraryGrid,
} from "./LibraryGrid";

const INITIAL_LIMIT = 12;

export async function LibraryPage() {
  const response =
    await getBooks({
      page: 1,
      limit: INITIAL_LIMIT,
    });

  return (
    <main className="min-h-screen bg-[#030608] text-white">
      <section className="pb-20 pt-28">
        <Container>
          <Eyebrow>
            Library
          </Eyebrow>

          <DisplayTitle className="mt-6 max-w-5xl">
            What changed in my thinking after reading.
          </DisplayTitle>

          <BodyText className="mt-8 max-w-2xl">
            Books, ideas and highlights
            that shaped how I build,
            decide, train and live.
          </BodyText>

          <div className="mt-10 border-t border-white/10 pt-7">
            <p className="text-2xl font-black tracking-[-0.04em]">
              {
                response.pagination
                  .total
              }
            </p>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
              Books
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <LibraryGrid
            initialBooks={
              response.data
            }
            initialPage={
              response.pagination
                .page
            }
            initialTotalPages={
              response.pagination
                .totalPages
            }
            limit={
              INITIAL_LIMIT
            }
          />
        </Container>
      </section>
    </main>
  );
}