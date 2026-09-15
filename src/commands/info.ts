import { Command } from "commander";
import { loadCatalog } from "../catalog/client.js";
import { CliError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export const infoCommand = new Command("info")
  .description("Show information about a catalog entry")
  .argument("<id>", "Foundation, blueprint, capability, recipe, or evolution ID")
  .option("--json", "Print JSON")
  .action(async (id: string, options: { json?: boolean }) => {
    const catalog = await loadCatalog();

    const foundation = catalog.foundations.find((item) => item.id === id);
    if (foundation) {
      if (options.json) return void console.log(JSON.stringify(foundation, null, 2));
      logger.heading(foundation.name);
      console.log(`ID: ${foundation.id}`);
      console.log(`Type: foundation`);
      console.log(`Target: ${foundation.target}`);
      console.log(`Status: ${foundation.status}`);
      console.log(`Repository: ${foundation.source.repository}`);
      console.log(`Ref: ${foundation.source.ref}`);
      console.log(`Version: ${foundation.source.version}`);
      console.log(`Provides: ${foundation.provides.join(", ") || "none"}`);
      console.log(`\n${foundation.description}`);
      return;
    }

    const blueprint = catalog.blueprints.find((item) => item.id === id);
    if (blueprint) {
      if (options.json) return void console.log(JSON.stringify(blueprint, null, 2));
      logger.heading(blueprint.name);
      console.log(`ID: ${blueprint.id}`);
      console.log(`Type: blueprint`);
      console.log(`Status: ${blueprint.status}`);
      console.log(`Workspace: ${blueprint.workspace}`);
      console.log(`Targets: ${blueprint.targets.join(", ")}`);
      console.log(`\n${blueprint.description}`);
      return;
    }

    const capability = catalog.capabilities.find((item) => item.id === id);
    if (capability) {
      if (options.json) return void console.log(JSON.stringify(capability, null, 2));
      logger.heading(capability.name);
      console.log(`ID: ${capability.id}`);
      console.log(`Type: capability`);
      console.log(`Status: ${capability.status}`);
      console.log(`Category: ${capability.category}`);
      console.log(`\n${capability.description}`);
      return;
    }

    const evolution = catalog.evolutions.find((item) => item.id === id);
    if (evolution) {
      if (options.json) return void console.log(JSON.stringify(evolution, null, 2));
      logger.heading(evolution.name);
      console.log(`ID: ${evolution.id}`);
      console.log(`Type: evolution`);
      console.log(`Status: ${evolution.status}`);
      console.log(`From: ${evolution.fromBlueprint}`);
      console.log(`To: ${evolution.toBlueprint}`);
      console.log(`\n${evolution.description}`);
      return;
    }

    const recipe = catalog.recipes.find((item) => item.id === id);
    if (recipe) {
      if (options.json) return void console.log(JSON.stringify(recipe, null, 2));
      logger.heading(recipe.id);
      console.log(`ID: ${recipe.id}`);
      console.log(`Type: recipe`);
      return;
    }

    throw new CliError(`Catalog entry "${id}" was not found.`, "CATALOG_ENTRY_NOT_FOUND");
  });
