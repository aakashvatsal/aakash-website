export const companyDetails = {
  "8lete": {
    name: "8lete",
    eyebrow: "Sports Technology",
    heroImage: "/images/company-8lete.jpg",
    headline: "Grassroots deserves professional technology.",
    intro:
      "8lete is an operating system for football academies — helping them manage players, attendance, fees, assessments, tournaments, communication and growth.",
    problem:
      "Grassroots academies still run on WhatsApp groups, Excel sheets, registers and scattered communication. Coaches lose time, parents lack visibility, and players lose their history.",
    why:
      "I built 8lete because I believe young athletes deserve the same level of structure, visibility and opportunity that professional players get.",
    stats: [
      ["120+", "Academies"],
      ["3", "Apps"],
      ["Global", "Vision"],
    ],
    product: [
      "Attendance",
      "Fees",
      "Assessments",
      "Performance",
      "Tournaments",
      "Parent Communication",
    ],
    tech: ["React Native", "NestJS", "MongoDB", "AWS", "AI", "Computer Vision"],
    timeline: [
      ["2024", "Idea"],
      ["2024", "Beta"],
      ["2025", "100+ Academies"],
      ["2026", "Global Expansion"],
    ],
    lessons: [
      "Adoption is harder than product.",
      "Coaches need less software, not more software.",
      "Parents care about transparency more than dashboards.",
    ],
    next: ["Coach AI", "Computer Vision", "Global academy network", "NCAA and Europe pathways"],
  },

  frayto: {
    name: "Frayto",
    eyebrow: "Logistics Technology",
    heroImage: "/images/company-frayto.jpg",
    headline: "Information should move faster than containers.",
    intro:
      "Frayto simplifies freight workflows through shipment tracking, procurement, carrier integrations and operational intelligence.",
    problem:
      "Containers move across the world, but information often moves through emails, calls, portals and manual updates.",
    why:
      "I built Frayto to help logistics teams reduce manual work and make freight operations more visible, predictable and intelligent.",
    stats: [
      ["140+", "Carriers"],
      ["25K+", "Shipments"],
      ["Ops", "Focus"],
    ],
    product: ["Tracking", "Visibility", "Procurement", "Carrier Integrations", "DSR", "Collaboration"],
    tech: ["Next.js", "NestJS", "MongoDB", "Carrier APIs", "AWS", "Automation"],
    timeline: [
      ["2023", "Problem Discovery"],
      ["2024", "InstaTrac"],
      ["2025", "Carrier Integrations"],
      ["2026", "Operational Intelligence"],
    ],
    lessons: [
      "In logistics, reliability beats novelty.",
      "Visibility only matters if it reduces action time.",
      "The workflow is more important than the dashboard.",
    ],
    next: ["AI tracking assistant", "More carrier integrations", "Predictive alerts", "Workflow automation"],
  },

  hsakaa: {
    name: "HSAKAA",
    eyebrow: "AI Twin",
    heroImage: "/images/company-hsakaa.jpg",
    headline: "Can knowledge outlive people?",
    intro:
      "HSAKAA is my AI twin — trained on my companies, books, routines, decisions, journal and thinking patterns.",
    problem:
      "Most thinking disappears inside conversations, notebooks, meetings and private decisions.",
    why:
      "I’m building HSAKAA to understand whether a person’s thinking can become software — not as a replacement, but as a living memory.",
    stats: [
      ["AI", "Memory"],
      ["Live", "Mode"],
      ["Think", "Goal"],
    ],
    product: ["Chat", "Memory", "Journal", "Books", "Companies", "Reasoning"],
    tech: ["Next.js", "NestJS", "MongoDB", "OpenAI", "Vector DB", "RAG"],
    timeline: [
      ["2026", "Concept"],
      ["2026", "Personal OS"],
      ["2026", "Memory Engine"],
      ["Future", "AI Twin"],
    ],
    lessons: [
      "Memory is only useful when it changes the answer.",
      "Personality matters more than knowledge.",
      "A good AI twin should ask better questions.",
    ],
    next: ["Streaming chat", "Personal memory", "Voice mode", "Teach HSAKAA CMS"],
  },
} as const;

export type CompanySlug = keyof typeof companyDetails;