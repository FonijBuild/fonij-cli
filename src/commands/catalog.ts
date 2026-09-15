import { Command } from "commander";
import { catalogCachePath } from "../catalog/cache.js";
import { getCatalogUrl, loadCatalog, refreshCatalog } from "../catalog/client.js";
import { logger } from "../utils/logger.js";

export const catalogCommand = new Command("catalog").description("Inspect or refresh the Fonij architecture catalog");

catalogCommand
  .command("status")
  .description("Show current catalog status")
  .action(async () => {
    const catalog = await loadCatalog();
    logger.heading("Catalog");
    console.log(`URL: ${getCatalogUrl()}`);
    console.log(`Version: ${catalog.catalogVersion}`);
    console.log(`Updated: ${catalog.updatedAt}`);
    console.log(`Foundations: ${catalog.foundations.length}`);
    console.log(`Blueprints: ${catalog.blueprints.length}`);
    console.log(`Capabilities: ${catalog.capabilities.length}`);
    console.log(`Recipes: ${catalog.recipes.length}`);
    console.log(`Evolutions: ${catalog.evolutions.length}`);
    console.log(`Cache: ${catalogCachePath}`);
  });

catalogCommand
  .command("update")
  .description("Force-refresh the remote catalog cache")
  .action(async () => {
    const catalog = await refreshCatalog();
    logger.success(
      `Catalog ${catalog.catalogVersion} loaded: ${catalog.foundations.length} foundations, ${catalog.blueprints.length} blueprints, ${catalog.evolutions.length} evolutions.`,
    );
  });
