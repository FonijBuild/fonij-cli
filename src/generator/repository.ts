import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execa } from "execa";
import {
  StarterManifestSchema,
  type Foundation,
  type StarterManifest,
} from "../contracts/index.js";
import { logger } from "../utils/logger.js";
import { pathExists, readJson } from "../utils/fs.js";

export type PreparedFoundation = {
  tempDir: string;
  manifest: StarterManifest;
};

function repositoryUrl(repository: string): string {
  if (/^(https?:\/\/|git@|ssh:\/\/)/.test(repository)) return repository;
  return `https://github.com/${repository}.git`;
}

export async function prepareFoundation(foundation: Foundation): Promise<PreparedFoundation> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `fonij-${foundation.id}-`));
  try {
    await execa("git", [
      "clone",
      "--depth",
      "1",
      "--branch",
      foundation.source.ref,
      repositoryUrl(foundation.source.repository),
      tempDir,
    ]);

    const manifestPath = path.join(tempDir, foundation.manifestPath);
    let manifest: StarterManifest;
    if (await pathExists(manifestPath)) {
      manifest = StarterManifestSchema.parse(await readJson(manifestPath));
      if (manifest.id !== foundation.id) {
        throw new Error(
          `Foundation ${foundation.id} declares starter manifest id ${manifest.id}. These IDs must match.`,
        );
      }
    } else {
      logger.warn(`${foundation.id} has no ${foundation.manifestPath}; using catalog metadata only.`);
      manifest = StarterManifestSchema.parse({
        schemaVersion: 1,
        id: foundation.id,
        templateVersion: foundation.source.version,
        variables: [],
        setup: [],
        hooks: { afterCreate: [] },
      });
    }

    await fs.rm(path.join(tempDir, ".git"), { recursive: true, force: true });
    await fs.rm(path.join(tempDir, ".fonij"), { recursive: true, force: true });
    return { tempDir, manifest };
  } catch (error) {
    await fs.rm(tempDir, { recursive: true, force: true });
    throw error;
  }
}

export async function materializePreparedFoundation(tempDir: string, destination: string): Promise<void> {
  await fs.mkdir(destination, { recursive: true });
  await fs.cp(tempDir, destination, { recursive: true, force: false, errorOnExist: false });
}
