import { Command } from "commander";
import { loadCatalog } from "../catalog/client.js";
import { logger } from "../utils/logger.js";

export const listCommand = new Command("list")
  .description("List Fonij catalog foundations or blueprints")
  .option("-t, --type <type>", "foundations | blueprints | evolutions", "foundations")
  .option("--json", "Print JSON")
  .action(async (options: { type: string; json?: boolean }) => {
    const catalog = await loadCatalog();

    if (options.type === "foundations") {
      if (options.json) return void console.log(JSON.stringify(catalog.foundations, null, 2));
      logger.heading("Fonij foundations");
      for (const item of catalog.foundations) {
        console.log(`${item.id.padEnd(20)} ${item.name} (${item.status})`);
        logger.muted(`  ${item.description}`);
      }
      return;
    }

    if (options.type === "blueprints") {
      if (options.json) return void console.log(JSON.stringify(catalog.blueprints, null, 2));
      logger.heading("Fonij blueprints");
      for (const item of catalog.blueprints) {
        console.log(`${item.id.padEnd(20)} ${item.name} (${item.workspace})`);
        logger.muted(`  ${item.description}`);
      }
      return;
    }

    if (options.type === "evolutions") {
      if (options.json) return void console.log(JSON.stringify(catalog.evolutions, null, 2));
      logger.heading("Fonij evolutions");
      for (const item of catalog.evolutions) {
        console.log(`${item.id.padEnd(32)} ${item.fromBlueprint} → ${item.toBlueprint}`);
        logger.muted(`  ${item.description}`);
      }
      return;
    }

    throw new Error(`Unknown list type: ${options.type}`);
  });
