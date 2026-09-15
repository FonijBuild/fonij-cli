import assert from "node:assert/strict";
import test from "node:test";
import { ProductRequirementsSchema } from "../src/contracts/index.js";
import { planProject } from "../src/planner/deterministic.js";
import { TEST_CATALOG } from "./fixtures/catalog.js";

function req(overrides: Partial<{ name: string; stage: "prototype" | "mvp" | "production"; targets: Array<"web" | "mobile" | "api" | "browser-extension" | "service">; seo: boolean; authentication: boolean; database: boolean }> = {}) {
  return ProductRequirementsSchema.parse({
    name: overrides.name ?? "demo",
    stage: overrides.stage ?? "prototype",
    targets: overrides.targets ?? ["web"],
    requirements: {
      seo: overrides.seo ?? false,
      authentication: overrides.authentication ?? false,
      database: overrides.database ?? false,
      realtime: false,
      offline: false,
      backgroundJobs: false,
      ai: false,
      uploads: false,
    },
  });
}

test("prototype web-only product uses web blueprint and SPA foundation", () => {
  const plan = planProject(req(), TEST_CATALOG);
  assert.equal(plan.id, "web");
  assert.equal(plan.workspace, "standalone");
  assert.equal(plan.apps[0]?.foundationId, "web-spa");
  assert.equal(plan.apps[0]?.path, ".");
});

test("SEO web product selects Next.js alternative from the web blueprint", () => {
  const plan = planProject(req({ stage: "mvp", seo: true }), TEST_CATALOG);
  assert.equal(plan.apps[0]?.foundationId, "web-nextjs");
});

test("web and api selects catalog web-api blueprint", () => {
  const plan = planProject(req({ stage: "mvp", targets: ["web", "api"], authentication: true, database: true }), TEST_CATALOG);
  assert.equal(plan.id, "web-api");
  assert.equal(plan.workspace, "monorepo");
  assert.deepEqual(plan.apps.map((app) => app.path), ["apps/web", "apps/api"]);
  assert.ok(plan.capabilities.includes("postgres"));
});

test("api-only project can use the direct Django foundation", () => {
  const plan = planProject(req({ targets: ["api"], database: true }), TEST_CATALOG);
  assert.equal(plan.id, "foundation:api-django");
  assert.equal(plan.apps[0]?.foundationId, "api-django");
});
