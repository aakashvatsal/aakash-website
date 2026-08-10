export const journalEntries = {
  "distribution-compounds-faster-than-product": {
    date: "07 July 2026",
    title: "Distribution compounds faster than product.",
    image: "/images/journal-1.jpg",
    company: "8lete",
    mood: "Focused",
    workout: "Push Day",
    reading: "21 pages",
    tags: ["Distribution", "Product", "8lete", "GTM"],
    body: [
      "Today I realized that people don't adopt software because it has more features.",
      "They adopt it when it makes tomorrow easier than today.",
      "A product can be objectively better and still fail if the habit change is too expensive.",
      "Distribution is not only about reach. It is about trust, timing, repetition and reducing fear.",
    ],
    lesson:
      "Product improves the tool. Distribution improves the chance that the tool enters someone's life.",
  },
  "every-workflow-should-remove-one-decision": {
    date: "06 July 2026",
    title: "Every workflow should remove one decision.",
    image: "/images/journal-2.jpg",
    company: "Frayto",
    mood: "Creative",
    workout: "Pull Day",
    reading: "18 pages",
    tags: ["Workflow", "UX", "Frayto", "Systems"],
    body: [
      "Great products reduce thinking. Great systems reduce friction.",
      "If a user has to think too much, the system has already failed.",
      "The best workflow is not the one with the most options. It is the one that makes the next action obvious.",
    ],
    lesson:
      "A system should not ask users to become better operators. It should make better operation feel natural.",
  },
} as const;

export type JournalSlug = keyof typeof journalEntries;