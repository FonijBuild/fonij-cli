import { Command } from "commander";
import { loadCatalog } from "../catalog/client.js";
import { ProductRequirementsSchema, ProductTargetSchema } from "../contracts/index.js";
import { executeEvolution } from "../evolution/executor.js";
import { planEvolution } from "../evolution/planner.js";
import { loadProjectManifest, requireProjectRoot } from "../project/manifest.js";
import { logger } from "../utils/logger.js";
import { confirmAction } from "../utils/prompts.js";

export const addCommand = new Command("add")
  .description("Evolve an existing Fonij project using catalog-defined migrations")
  .argument("<target>", "api | web | mobile | browser-extension | service")
  .option("--dry-run", "Show migration operations without changing files")
  .option("--skip-install", "Do not install dependencies for the new app")
  .option("--allow-hooks", "Allow custom after-create hooks")
  .option("--force", "Allow migration with a dirty Git working tree")
  .option("-y, --yes", "Apply without confirmation")
  .action(async (targetValue: string, options: { dryRun?: boolean; skipInstall?: boolean; allowHooks?: boolean; force?: boolean; yes?: boolean }) => {
    const target = ProductTargetSchema.parse(targetValue);
    const root = await requireProjectRoot();
    const manifest = await loadProjectManifest(root);
    const catalog = await loadCatalog();
    const plan = planEvolution(manifest, target, catalog);

    logger.heading("Evolution plan");
    console.log(`${manifest.blueprint.id} → ${plan.toBlueprint.id}`);
    for (const operation of plan.operations) console.log(`  • ${operation}`);

    if (options.dryRun) {
      logger.success("Dry run complete. No files were changed.");
      return;
    }

    if (!options.yes && !(await confirmAction("Apply this evolution?", false))) {
      logger.warn("Cancelled.");
      return;
    }

    const targetDefinition = catalog.blueprints.find((item) => item.id === plan.toBlueprint.id);
    const targets = targetDefinition?.targets ?? plan.toBlueprint.apps.map((app) => app.target);
    const requirements = ProductRequirementsSchema.parse({
      ...manifest.requirements,
      targets,
    });

    await executeEvolution(root, manifest, requirements, plan, catalog, {
      dryRun: false,
      force: options.force,
      skipInstall: options.skipInstall,
      allowHooks: options.allowHooks,
      yes: options.yes,
    });
  });
