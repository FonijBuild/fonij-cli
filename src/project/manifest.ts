import fs from "node:fs/promises";
import path from "node:path";
import {
  MigrationHistorySchema,
  ProjectManifestSchema,
  type MigrationHistory,
  type ProjectManifest,
} from "../contracts/index.js";
import { CliError } from "../utils/errors.js";
import { pathExists, readJson, writeJson } from "../utils/fs.js";

export const PROJECT_DIR = ".fonij";
export const PROJECT_MANIFEST_FILE = "project.json";
export const MIGRATIONS_FILE = "migrations.json";

export async function findProjectRoot(start = process.cwd()): Promise<string | undefined> {
  let current = path.resolve(start);
  while (true) {
    if (await pathExists(path.join(current, PROJECT_DIR, PROJECT_MANIFEST_FILE))) return current;
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

export async function requireProjectRoot(start = process.cwd()): Promise<string> {
  const root = await findProjectRoot(start);
  if (!root) {
    throw new CliError(
      "This directory is not a Fonij project.",
      "NOT_FONIJ_PROJECT",
      "Run `fonij init` to adopt an existing project or `fonij create` to create one.",
    );
  }
  return root;
}

export async function loadProjectManifest(root: string): Promise<ProjectManifest> {
  return ProjectManifestSchema.parse(await readJson(path.join(root, PROJECT_DIR, PROJECT_MANIFEST_FILE)));
}

export async function saveProjectManifest(root: string, manifest: ProjectManifest): Promise<void> {
  await writeJson(
    path.join(root, PROJECT_DIR, PROJECT_MANIFEST_FILE),
    ProjectManifestSchema.parse(manifest),
  );
}

export async function loadMigrationHistory(root: string): Promise<MigrationHistory> {
  const file = path.join(root, PROJECT_DIR, MIGRATIONS_FILE);
  if (!(await pathExists(file))) return { schemaVersion: 1, applied: [] };
  return MigrationHistorySchema.parse(await readJson(file));
}

export async function saveMigrationHistory(root: string, history: MigrationHistory): Promise<void> {
  await writeJson(path.join(root, PROJECT_DIR, MIGRATIONS_FILE), MigrationHistorySchema.parse(history));
}

export async function ensureFonijDir(root: string): Promise<void> {
  await fs.mkdir(path.join(root, PROJECT_DIR), { recursive: true });
}
