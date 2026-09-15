import fs from "node:fs/promises";
import path from "node:path";
import type {
  Foundation,
  ProductRequirements,
  ProjectManifest,
  ResolvedCatalog,
  StarterManifest,
} from "../contracts/index.js";
import { CLI_VERSION } from "../version.js";
import {
  PROJECT_DIR,
  PROJECT_MANIFEST_FILE,
  MIGRATIONS_FILE,
  loadMigrationHistory,
  saveMigrationHistory,
  saveProjectManifest,
} from "../project/manifest.js";
import { runFoundationLifecycle } from "../generator/installer.js";
import { materializePreparedFoundation, prepareFoundation } from "../generator/repository.js";
import { replaceTemplateVariables } from "../generator/template.js";
import { writeWorkspaceFiles } from "../generator/workspace.js";
import { pythonPackageName } from "../utils/naming.js";
import { gitIsClean } from "../utils/process.js";
import { CliError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import type { EvolutionPlan } from "./planner.js";

const ROOT_PRESERVE = new Set([
  ".git",
  ".fonij",
  ".github",
  ".gitignore",
  "LICENSE",
  "LICENSE.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
]);

const ROOT_GENERATED_FILES = ["package.json", "pnpm-workspace.yaml", "README.md", ".gitignore"] as const;

type FileSnapshot = { path: string; existed: boolean; content?: Buffer };

function templateValues(manifest: ProjectManifest): Record<string, string> {
  return {
    PROJECT_NAME: manifest.project.name,
    PROJECT_SLUG: manifest.project.name,
    PACKAGE_NAME: manifest.project.name,
    PYTHON_PACKAGE_NAME: pythonPackageName(manifest.project.name),
    AUTHOR: "",
  };
}

function foundationFor(catalog: ResolvedCatalog, id: string): Foundation {
  const foundation = catalog.foundations.find((item) => item.id === id);
  if (!foundation) throw new CliError(`Foundation ${id} is no longer in catalog.`, "FOUNDATION_NOT_FOUND");
  return foundation;
}

async function snapshotFile(file: string): Promise<FileSnapshot> {
  try { return { path: file, existed: true, content: await fs.readFile(file) }; }
  catch { return { path: file, existed: false }; }
}

async function restoreSnapshot(snapshot: FileSnapshot): Promise<void> {
  if (snapshot.existed && snapshot.content) {
    await fs.mkdir(path.dirname(snapshot.path), { recursive: true });
    await fs.writeFile(snapshot.path, snapshot.content);
  } else {
    await fs.rm(snapshot.path, { force: true, recursive: false }).catch(() => undefined);
  }
}

async function moveRootApp(root: string, destinationPath: string): Promise<Array<{ from: string; to: string }>> {
  const destination = path.join(root, destinationPath);
  await fs.mkdir(destination, { recursive: true });
  const moved: Array<{ from: string; to: string }> = [];

  for (const entry of await fs.readdir(root)) {
    if (ROOT_PRESERVE.has(entry) || entry === "apps") continue;
    const from = path.join(root, entry);
    const to = path.join(destination, entry);
    await fs.rename(from, to);
    moved.push({ from, to });
  }
  return moved;
}

async function rollbackMoves(moves: Array<{ from: string; to: string }>): Promise<void> {
  for (const move of [...moves].reverse()) {
    try {
      await fs.mkdir(path.dirname(move.from), { recursive: true });
      await fs.rename(move.to, move.from);
    } catch {
      // Best-effort rollback; preserve the original error as the primary signal.
    }
  }
}

export async function executeEvolution(
  root: string,
  manifest: ProjectManifest,
  requirements: ProductRequirements,
  plan: EvolutionPlan,
  catalog: ResolvedCatalog,
  options: {
    dryRun?: boolean;
    force?: boolean;
    skipInstall?: boolean;
    allowHooks?: boolean;
    yes?: boolean;
  } = {},
): Promise<ProjectManifest> {
  if (options.dryRun) return manifest;

  if (!options.force && !(await gitIsClean(root))) {
    throw new CliError(
      "Git working tree is not clean.",
      "DIRTY_GIT_WORKTREE",
      "Commit/stash your changes first, or re-run with --force after reviewing the migration plan.",
    );
  }

  const rootSnapshots = await Promise.all(ROOT_GENERATED_FILES.map((file) => snapshotFile(path.join(root, file))));
  const projectSnapshot = await snapshotFile(path.join(root, PROJECT_DIR, PROJECT_MANIFEST_FILE));
  const migrationsSnapshot = await snapshotFile(path.join(root, PROJECT_DIR, MIGRATIONS_FILE));

  let moves: Array<{ from: string; to: string }> = [];
  const addedDestinations: string[] = [];
  const lifecycle: Array<{ cwd: string; manifest: StarterManifest; foundation: Foundation }> = [];
  const preparedDirs: string[] = [];

  try {
    for (const operation of plan.definition.operations) {
      if (operation.type === "move-app") {
        moves.push(...(await moveRootApp(root, operation.to)));
        continue;
      }

      if (operation.type === "add-foundation") {
        const targetApp = plan.toBlueprint.apps.find((app) => app.id === operation.app);
        if (!targetApp) throw new CliError(`Evolution target app ${operation.app} is missing.`, "INVALID_EVOLUTION_PLAN");
        const foundation = foundationFor(catalog, targetApp.foundationId);
        const prepared = await prepareFoundation(foundation);
        preparedDirs.push(prepared.tempDir);
        const destination = path.join(root, targetApp.path);
        addedDestinations.push(destination);
        await materializePreparedFoundation(prepared.tempDir, destination);
        await replaceTemplateVariables(destination, templateValues(manifest));
        lifecycle.push({ cwd: destination, manifest: prepared.manifest, foundation });
        continue;
      }

      if (operation.type === "create-workspace") {
        await writeWorkspaceFiles(root, plan.toBlueprint);
      }
    }

    if (plan.toBlueprint.workspace === "monorepo" && !plan.definition.operations.some((op) => op.type === "create-workspace")) {
      await writeWorkspaceFiles(root, plan.toBlueprint);
    }

    const now = new Date().toISOString();
    const updated: ProjectManifest = {
      ...manifest,
      requirements,
      blueprint: plan.toBlueprint,
      createdWith: { ...manifest.createdWith, catalog: catalog.catalogVersion },
      updatedAt: now,
    };

    await saveProjectManifest(root, updated);
    const history = await loadMigrationHistory(root);
    history.applied.push({
      id: plan.id,
      from: manifest.blueprint.id,
      to: plan.toBlueprint.id,
      appliedAt: now,
    });
    await saveMigrationHistory(root, history);

    for (const item of lifecycle) {
      await runFoundationLifecycle(item.foundation, item.manifest, item.cwd, options);
    }

    logger.success(`Applied evolution ${plan.id} with Fonij CLI ${CLI_VERSION}.`);
    return updated;
  } catch (error) {
    for (const destination of addedDestinations.reverse()) {
      await fs.rm(destination, { recursive: true, force: true }).catch(() => undefined);
    }
    for (const file of ROOT_GENERATED_FILES) {
      await fs.rm(path.join(root, file), { force: true }).catch(() => undefined);
    }
    await rollbackMoves(moves);
    for (const snapshot of rootSnapshots) await restoreSnapshot(snapshot);
    await restoreSnapshot(projectSnapshot);
    await restoreSnapshot(migrationsSnapshot);
    throw error;
  } finally {
    for (const preparedDir of preparedDirs) {
      await fs.rm(preparedDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
