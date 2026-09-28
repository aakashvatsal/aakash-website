import { SITE_URL } from "@/lib/seo/site";

export { SITE_URL };

export const AID_PATH = "/aid";
export const AID_CANONICAL_URL = `${SITE_URL}${AID_PATH}`;

export const AID_SEO_TITLE =
  "HSAKAA Aid | Financial Assistance by Aakash Vatsal";

export const AID_SOCIAL_TITLE =
  "HSAKAA Aid | Human-Reviewed Financial Assistance";

export const AID_SEO_DESCRIPTION =
  "HSAKAA Aid is Aakash Vatsal's human-reviewed financial assistance initiative, starting with ₹30,000 each month and no predefined public cause list.";

export const AID_FAQS = [
  {
    question: "What is HSAKAA Aid?",
    answer:
      "HSAKAA Aid is a human-reviewed financial assistance initiative by Aakash Vatsal. It starts with ₹30,000 allocated each month and uses the normal HSAKAA chat to understand and verify requests before a human decision.",
  },
  {
    question: "What problems or causes does HSAKAA Aid support?",
    answer:
      "HSAKAA Aid does not have a predefined public cause list right now. If financial support could genuinely help a situation, the person can explain what happened and what they need. Internal cause tags are used only to learn from real requests, not as eligibility rules.",
  },
  {
    question: "How do I ask HSAKAA Aid for help?",
    answer:
      "Start a normal conversation with HSAKAA and explain the situation in your own words. There is no separate Aid application form. If the conversation becomes a request for financial assistance, HSAKAA asks only for the next information or evidence needed for review.",
  },
  {
    question: "How does HSAKAA Aid verify a request?",
    answer:
      "HSAKAA can ask for relevant facts, clarification and supporting evidence, then compare claims, amounts and dates for consistency. It prepares the case for review but does not make the final decision itself.",
  },
  {
    question: "Does AI decide who receives HSAKAA Aid?",
    answer:
      "No. HSAKAA helps organize and verify the request, but every final approval, assistance amount and payment decision is human-reviewed.",
  },
  {
    question: "How much money is available through HSAKAA Aid?",
    answer:
      "HSAKAA Aid starts on October 1, 2026 with ₹30,000 allocated each month. The starting pool is intentionally small so the process can improve from real requests and real verification outcomes.",
  },
] as const;
