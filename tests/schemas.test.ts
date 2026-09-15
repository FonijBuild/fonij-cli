import assert from "node:assert/strict";
import test from "node:test";
import { ResolvedCatalogSchema, StarterManifestSchema } from "../src/contracts/index.js";
import { validateCatalogInvariants } from "../src/catalog/invariants.js";
import { TEST_CATALOG } from "./fixtures/catalog.js";

test("catalog fixture conforms to runtime contracts and invariants", () => {
  assert.doesNotThrow(() => validateCatalogInvariants(ResolvedCatalogSchema.parse(TEST_CATALOG)));
});

test("starter manifest accepts repository-specific extension metadata", () => {
  const parsed = StarterManifestSchema.parse({
    schemaVersion: 1,
    id: "web-spa",
    templateVersion: "1.0.0",
    variables: [],
    setup: [],
    hooks: { afterCreate: [] },
    runtime: { framework: "vite-react" },
  });
  assert.equal(parsed.id, "web-spa");
});
