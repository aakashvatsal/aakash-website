const baseUrl = (process.env.FRONTEND_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

const checks = [
  ["home", "/"],
  ["companies", "/companies"],
  ["journal", "/journal"],
  ["library", "/library"],
  ["health", "/health"],
  ["media", "/media"],
  ["now", "/now"],
  ["hsakaa", "/hsakaa"],
  ["search", "/search"],
  ["admin login", "/admin/login"],
];

// Do not treat the custom not-found page's visible copy as a raw-body marker.
// Next App Router may serialize its not-found boundary into otherwise valid 200 HTML/RSC.
// A real missing route is detected by its HTTP 404 status via response.ok below.
const fatalBodyMarkers = [
  "Application error: a server-side exception has occurred",
  "Internal Server Error",
];

let failures = 0;

function describeError(error) {
  const cause = error?.cause;
  const details = [cause?.code, cause?.address, cause?.port]
    .filter(Boolean)
    .join(" ");
  return `${error?.message ?? String(error)}${details ? ` (${details})` : ""}`;
}

for (const [name, path] of checks) {
  const url = `${baseUrl}${path}`;

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "aakash-frontend-smoke/1.1" },
    });

    const body = await response.text();
    const marker = fatalBodyMarkers.find((value) => body.includes(value));

    if (!response.ok || marker) {
      failures += 1;
      const reason = marker ? `body contains: ${marker}` : `HTTP ${response.status}`;
      console.error(`FAIL ${name}: ${reason}`);
      console.error(`  -> ${url}`);
      continue;
    }

    console.log(`PASS ${name}: ${response.status}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${describeError(error)}`);
    console.error(`  -> ${url}`);
  }
}

if (failures > 0) {
  console.error(`Frontend smoke checks failed: ${failures}/${checks.length}`);
  process.exit(1);
}

console.log("Frontend smoke checks passed.");
