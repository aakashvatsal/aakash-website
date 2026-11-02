/**
 * Regression test for V7 owner proxy authentication.
 *
 * Run from aakash-website:
 *   node scripts/media-owner-session-smoke.mjs
 *
 * Checks both route allowlisting and proxy enforcement placement.
 * This does not replace a real login/integration test.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const helperSource=readFileSync(new URL("../lib/admin-backend-owner-routes.ts",import.meta.url),"utf8");
const commonJs=ts.transpileModule(helperSource,{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},
  reportDiagnostics:true,
}).outputText;
const module={exports:{}};
runInNewContext(commonJs,{module,exports:module.exports});
const {requiresVerifiedOwnerSession}=module.exports;
assert.equal(typeof requiresVerifiedOwnerSession,"function");

for(const path of [
  ["hsakaa","private","profile"],
  ["media","core","series"],
  ["media","core","series","test","analyze"],
  ["media","studio"],
  ["media","studio","growth"],
  ["media","studio","generate"],
  ["media","studio","posts","2026-11-02","123"],
]){
  assert.equal(requiresVerifiedOwnerSession(path),true,`${path.join("/")} should receive verified owner session`);
}
for(const path of [
  ["hsakaa","public","something"],
  ["media","public"],
  ["media","core","content"],
  ["public","media"],
  ["media","studio-public"],
  ["other","studio"],
]){
  assert.equal(requiresVerifiedOwnerSession(path),false,`${path.join("/")} should not receive owner session`);
}

const proxy=readFileSync(new URL("../app/api/admin/backend/[...path]/route.ts",import.meta.url),"utf8");
assert.match(proxy,/verifyAdminSessionToken\(token\)/);
assert.match(proxy,/if \(requiresVerifiedOwnerSession\(path\)\)/);
assert.match(proxy,/headers\.set\("x-owner-session", token\)/);
assert.ok(proxy.indexOf("verifyAdminSessionToken(token)")<proxy.indexOf("requiresVerifiedOwnerSession(path)"),
  "A session must be verified before it can be forwarded");
console.log("Media Studio owner-session proxy allowlist smoke test passed.");
