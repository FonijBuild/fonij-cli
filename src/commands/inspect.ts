import { Command } from "commander";
import { loadMigrationHistory, loadProjectManifest, requireProjectRoot } from "../project/manifest.js";
import { logger } from "../utils/logger.js";

export const inspectCommand = new Command("inspect")
  .description("Inspect the current Fonij project")
  .option("--json", "Print manifest and migrations as JSON")
  .action(async (options: { json?: boolean }) => {
    const root = await requireProjectRoot();
    const manifest = await loadProjectManifest(root);
    const migrations = await loadMigrationHistory(root);

    if (options.json) {
      console.log(JSON.stringify({ root, manifest, migrations }, null, 2));
      return;
    }

    logger.heading(manifest.project.name);
    console.log(`Root: ${root}`);
    console.log(`Stage: ${manifest.project.stage}`);
    console.log(`Blueprint: ${manifest.blueprint.id}`);
    console.log(`Workspace: ${manifest.blueprint.workspace}`);
    console.log(`Created with: fonij ${manifest.createdWith.cli} / catalog ${manifest.createdWith.catalog}`);
    if (manifest.agent) console.log(`Preferred agent: ${manifest.agent.preferred}`);
    console.log("\nApplications:");
    for (const app of manifest.blueprint.apps) {
      console.log(`  • ${app.target}: ${app.path} (${app.foundationId})`);
    }
    console.log(`\nCapabilities: ${manifest.blueprint.capabilities.join(", ") || "none"}`);
    console.log(`Evolutions: ${migrations.applied.length}`);
  });
