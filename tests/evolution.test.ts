import assert from "node:assert/strict";
import test from "node:test";
import { ProductRequirementsSchema, type ProjectManifest } from "../src/contracts/index.js";
import { planProject } from "../src/planner/deterministic.js";
import { planEvolution } from "../src/evolution/planner.js";
import { TEST_CATALOG } from "./fixtures/catalog.js";

function makeManifest(seo = false): ProjectManifest {
  const requirements = ProductRequirementsSchema.parse({
    name: "demo",
    stage: "prototype",
    targets: ["web"],
    requirements: {
      seo,
      authentication: false,
      database: false,
      realtime: false,
      offline: false,
      backgroundJobs: false,
      ai: false,
      uploads: false,
    },
  });
  const blueprint = planProject(requirements, TEST_CATALOG);
  return {
    schemaVersion: 1,
    project: { name: "demo", stage: "prototype" },
    requirements,
    blueprint,
    createdWith: { cli: "1.0.0", catalog: TEST_CATALOG.catalogVersion, at: new Date(0).toISOString() },
    updatedAt: new Date(0).toISOString(),
  };
}

test("adding api uses catalog evolution web-to-web-api", () => {
  const plan = planEvolution(makeManifest(), "api", TEST_CATALOG);
  assert.equal(plan.id, "web-to-web-api");
  assert.equal(plan.toBlueprint.id, "web-api");
  assert.ok(plan.operations.some((operation) => operation.includes("Move existing web")));
  assert.ok(plan.toBlueprint.apps.some((app) => app.target === "api"));
});

test("evolution preserves selected Next.js web foundation", () => {
  const plan = planEvolution(makeManifest(true), "api", TEST_CATALOG);
  assert.equal(plan.toBlueprint.apps.find((app) => app.id === "web")?.foundationId, "web-nextjs");
});
