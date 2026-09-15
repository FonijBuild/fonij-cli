import assert from "node:assert/strict";
import test from "node:test";
import { LocalIdeaAnalyzer } from "../src/ai/local.js";

test("frontend demo does not force api", async () => {
  const result = await new LocalIdeaAnalyzer().analyze(
    "I want a web demo, frontend only, to validate the idea before building backend",
    "demo",
  );
  assert.equal(result.stage, "prototype");
  assert.deepEqual(result.targets, ["web"]);
});

test("cross-platform authenticated app with data includes mobile and api", async () => {
  const result = await new LocalIdeaAnalyzer().analyze(
    "Cross-platform mobile app with login and database for reservations",
    "booking",
  );
  assert.ok(result.targets.includes("mobile"));
  assert.ok(result.targets.includes("api"));
  assert.equal(result.requirements.authentication, true);
  assert.equal(result.requirements.database, true);
});
