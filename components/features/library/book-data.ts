export const books = {
  "the-pragmatic-programmer": {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    category: "Technology",
    status: "Reading",
    progress: "68%",
    rating: "9/10",
    changed:
      "It reminded me that great software is not only about code. It is about judgment, habits, clarity and ownership.",
    notes: [
      "Care about your craft.",
      "Don’t live with broken windows.",
      "Think in systems, not isolated tasks.",
      "Good programmers constantly sharpen their tools.",
    ],
    quotes: [
      "Software entropy increases when small problems are ignored.",
      "Your knowledge portfolio compounds like financial assets.",
    ],
  },

  "bhagavad-gita": {
    title: "Bhagavad Gita",
    author: "Vyasa",
    category: "Philosophy",
    status: "Reading",
    progress: "42%",
    rating: "10/10",
    changed:
      "It changed how I think about action, detachment, discipline and emotional control.",
    notes: [
      "Focus on action, not outcome.",
      "Discipline is inner alignment.",
      "Emotions should be observed, not obeyed.",
      "Duty becomes easier when ego reduces.",
    ],
    quotes: [
      "Detach from the fruits of action.",
      "The mind can be a friend or an enemy.",
    ],
  },
} as const;

export type BookSlug = keyof typeof books;