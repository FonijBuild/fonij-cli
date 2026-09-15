import {
  BlueprintDefinitionSchema,
  CapabilityDefinitionSchema,
  CatalogIndexSchema,
  EvolutionDefinitionSchema,
  FoundationSchema,
  RecipeDefinitionSchema,
  ResolvedCatalogSchema,
  type BlueprintDefinition,
  type Foundation,
  type ResolvedCatalog,
} from "../contracts/index.js";
import { CliError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { readCatalogCache, writeCatalogCache } from "./cache.js";
import { validateCatalogInvariants } from "./invariants.js";

const DEFAULT_CATALOG_URL =
  "https://raw.githubusercontent.com/FonijBuild/fonij-catalog/main/catalog.json";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

let memoryCatalog: ResolvedCatalog | undefined;

export function getCatalogUrl(): string {
  return process.env.FONIJ_CATALOG_URL ?? DEFAULT_CATALOG_URL;
}

function resolveCatalogRef(baseUrl: string, reference: string): string {
  try {
    return new URL(reference, baseUrl).toString();
  } catch {
    throw new CliError(
      `Catalog reference "${reference}" cannot be resolved from ${baseUrl}.`,
      "CATALOG_INVALID_URL",
    );
  }
}

async function fetchJson(url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "user-agent": "fonij-cli/1.0.0" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new CliError(
      `Unable to fetch Fonij catalog resource: ${url}`,
      "CATALOG_NETWORK_ERROR",
      error instanceof Error ? error.message : undefined,
    );
  }

  if (!response.ok) {
    throw new CliError(
      `Catalog request failed with HTTP ${response.status}: ${url}`,
      "CATALOG_HTTP_ERROR",
    );
  }

  try {
    return await response.json();
  } catch {
    throw new CliError(`Catalog resource is not valid JSON: ${url}`, "CATALOG_INVALID_JSON");
  }
}

async function fetchMany<T>(
  baseUrl: string,
  references: string[],
  parse: (value: unknown) => T,
): Promise<T[]> {
  return Promise.all(
    references.map(async (reference) => parse(await fetchJson(resolveCatalogRef(baseUrl, reference)))),
  );
}

async function fetchCatalog(): Promise<ResolvedCatalog> {
  const sourceUrl = getCatalogUrl();
  const index = CatalogIndexSchema.parse(await fetchJson(sourceUrl));

  const [foundations, blueprints, capabilities, recipes, evolutions] = await Promise.all([
    fetchMany(sourceUrl, index.foundations, (value) => FoundationSchema.parse(value)),
    fetchMany(sourceUrl, index.blueprints, (value) => BlueprintDefinitionSchema.parse(value)),
    fetchMany(sourceUrl, index.capabilities, (value) => CapabilityDefinitionSchema.parse(value)),
    fetchMany(sourceUrl, index.recipes, (value) => RecipeDefinitionSchema.parse(value)),
    fetchMany(sourceUrl, index.evolutions, (value) => EvolutionDefinitionSchema.parse(value)),
  ]);

  const resolved = ResolvedCatalogSchema.parse({
    schemaVersion: index.schemaVersion,
    catalogVersion: index.catalogVersion,
    updatedAt: index.updatedAt,
    sourceUrl,
    foundations,
    blueprints,
    capabilities,
    recipes,
    evolutions,
  });

  return validateCatalogInvariants(resolved);
}

export async function loadCatalog(
  options: { refresh?: boolean; quiet?: boolean } = {},
): Promise<ResolvedCatalog> {
  if (memoryCatalog && !options.refresh) return memoryCatalog;

  const cached = await readCatalogCache();
  const cacheMatchesSource = cached?.data.sourceUrl === getCatalogUrl();

  if (
    !options.refresh &&
    cached &&
    cacheMatchesSource &&
    Date.now() - cached.fetchedAt < CACHE_TTL_MS
  ) {
    memoryCatalog = validateCatalogInvariants(cached.data);
    return memoryCatalog;
  }

  try {
    const remote = await fetchCatalog();
    memoryCatalog = remote;
    await writeCatalogCache(remote);
    return remote;
  } catch (error) {
    if (cached && cacheMatchesSource) {
      if (!options.quiet) logger.warn("Remote catalog unavailable; using cached catalog.");
      memoryCatalog = validateCatalogInvariants(cached.data);
      return memoryCatalog;
    }

    throw new CliError(
      error instanceof Error ? error.message : "Unable to load the Fonij catalog.",
      "CATALOG_UNAVAILABLE",
      `Connect to the network, run \`fonij catalog update\`, or set FONIJ_CATALOG_URL to a reachable catalog.json.`,
    );
  }
}

export async function refreshCatalog(): Promise<ResolvedCatalog> {
  memoryCatalog = undefined;
  return loadCatalog({ refresh: true });
}

export async function getFoundation(id: string): Promise<Foundation> {
  const foundation = (await loadCatalog()).foundations.find((item) => item.id === id);
  if (!foundation) {
    throw new CliError(`Foundation "${id}" is not available in the catalog.`, "FOUNDATION_NOT_FOUND");
  }
  return foundation;
}

export async function getBlueprintDefinition(id: string): Promise<BlueprintDefinition> {
  const blueprint = (await loadCatalog()).blueprints.find((item) => item.id === id);
  if (!blueprint) {
    throw new CliError(`Blueprint "${id}" is not available in the catalog.`, "BLUEPRINT_NOT_FOUND");
  }
  return blueprint;
}
