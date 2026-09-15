import type { ResolvedCatalog } from "../contracts/index.js";
import { CliError } from "../utils/errors.js";

function assertUnique(ids: string[], label: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new CliError(`Duplicate ${label} id "${id}" in catalog.`, "CATALOG_DUPLICATE_ID");
    }
    seen.add(id);
  }
}

export function validateCatalogInvariants(catalog: ResolvedCatalog): ResolvedCatalog {
  assertUnique(catalog.foundations.map((item) => item.id), "foundation");
  assertUnique(catalog.blueprints.map((item) => item.id), "blueprint");
  assertUnique(catalog.capabilities.map((item) => item.id), "capability");
  assertUnique(catalog.recipes.map((item) => item.id), "recipe");
  assertUnique(catalog.evolutions.map((item) => item.id), "evolution");

  const foundations = new Map(catalog.foundations.map((item) => [item.id, item]));
  const blueprints = new Map(catalog.blueprints.map((item) => [item.id, item]));

  for (const foundation of catalog.foundations) {
    for (const compatibleId of foundation.compatibleWith) {
      if (!foundations.has(compatibleId)) {
        throw new CliError(
          `Foundation "${foundation.id}" references missing compatible foundation "${compatibleId}".`,
          "CATALOG_INVALID_REFERENCE",
        );
      }
    }
  }

  for (const blueprint of catalog.blueprints) {
    for (const app of blueprint.apps) {
      const allowed = [app.foundation.default, ...app.foundation.alternatives];
      for (const foundationId of allowed) {
        const foundation = foundations.get(foundationId);
        if (!foundation) {
          throw new CliError(
            `Blueprint "${blueprint.id}" references missing foundation "${foundationId}".`,
            "CATALOG_INVALID_REFERENCE",
          );
        }
        if (foundation.target !== app.target) {
          throw new CliError(
            `Blueprint "${blueprint.id}" app "${app.id}" expects target "${app.target}" but foundation "${foundationId}" targets "${foundation.target}".`,
            "CATALOG_TARGET_MISMATCH",
          );
        }
      }
    }
  }

  for (const evolution of catalog.evolutions) {
    if (!blueprints.has(evolution.fromBlueprint)) {
      throw new CliError(
        `Evolution "${evolution.id}" references missing source blueprint "${evolution.fromBlueprint}".`,
        "CATALOG_INVALID_REFERENCE",
      );
    }
    if (!blueprints.has(evolution.toBlueprint)) {
      throw new CliError(
        `Evolution "${evolution.id}" references missing target blueprint "${evolution.toBlueprint}".`,
        "CATALOG_INVALID_REFERENCE",
      );
    }

    const toBlueprint = blueprints.get(evolution.toBlueprint)!;
    for (const operation of evolution.operations) {
      if (operation.type === "add-foundation") {
        const foundation = foundations.get(operation.foundation);
        if (!foundation) {
          throw new CliError(
            `Evolution "${evolution.id}" references missing foundation "${operation.foundation}".`,
            "CATALOG_INVALID_REFERENCE",
          );
        }
        if (foundation.target !== operation.target) {
          throw new CliError(
            `Evolution "${evolution.id}" adds foundation "${operation.foundation}" as "${operation.target}" but it targets "${foundation.target}".`,
            "CATALOG_TARGET_MISMATCH",
          );
        }
        const targetApp = toBlueprint.apps.find((app) => app.id === operation.app);
        if (!targetApp) {
          throw new CliError(
            `Evolution "${evolution.id}" adds unknown target app "${operation.app}".`,
            "CATALOG_INVALID_REFERENCE",
          );
        }
      }
    }
  }

  return catalog;
}
