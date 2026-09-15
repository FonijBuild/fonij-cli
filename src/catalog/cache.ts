import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ResolvedCatalogSchema, type ResolvedCatalog } from "../contracts/index.js";

const baseCacheDir = process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache");
export const catalogCachePath = path.join(baseCacheDir, "fonij", "catalog-v1.json");

export async function readCatalogCache(): Promise<{ data: ResolvedCatalog; fetchedAt: number } | undefined> {
  try {
    const raw = JSON.parse(await fs.readFile(catalogCachePath, "utf8")) as {
      data: unknown;
      fetchedAt: number;
    };
    return { data: ResolvedCatalogSchema.parse(raw.data), fetchedAt: raw.fetchedAt };
  } catch {
    return undefined;
  }
}

export async function writeCatalogCache(data: ResolvedCatalog): Promise<void> {
  await fs.mkdir(path.dirname(catalogCachePath), { recursive: true });
  await fs.writeFile(
    catalogCachePath,
    `${JSON.stringify({ data, fetchedAt: Date.now() }, null, 2)}\n`,
    "utf8",
  );
}
