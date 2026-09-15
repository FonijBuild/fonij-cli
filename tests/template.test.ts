import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { replaceTemplateVariables } from "../src/generator/template.js";

test("replaces known template variables in text files", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "fonij-template-test-"));
  try {
    const file = path.join(dir, "README.md");
    await fs.writeFile(file, "# {{PROJECT_NAME}}\nPackage: {{PACKAGE_NAME}}\n", "utf8");
    await replaceTemplateVariables(dir, { PROJECT_NAME: "Demo", PACKAGE_NAME: "demo" });
    assert.equal(await fs.readFile(file, "utf8"), "# Demo\nPackage: demo\n");
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
