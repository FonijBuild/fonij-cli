import fs from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import type {
  Foundation,
  ProductRequirements,
  ProjectBlueprint,
  ProjectManifest,
  ResolvedCatalog,
  StarterManifest,
} from "../contracts/index.js";
import { CLI_VERSION } from "../version.js";
import { assertTargetAvailable } from "../utils/fs.js";
import { logger } from "../utils/logger.js";
import { pythonPackageName, validateProjectName } from "../utils/naming.js";
import { ensureFonijDir, saveMigrationHistory, saveProjectManifest } from "../project/manifest.js";
import { runFoundationLifecycle } from "./installer.js";
import { materializePreparedFoundation, prepareFoundation } from "./repository.js";
import { replaceTemplateVariables } from "./template.js";
import { writeWorkspaceFiles } from "./workspace.js";

export type GenerateOptions = {
  skipInstall?: boolean;
  allowHooks?: boolean;
  yes?: boolean;
  author?: string;
};

function foundationFor(catalog: ResolvedCatalog, id: string): Foundation {
  const foundation = catalog.foundations.find((item) => item.id === id);
  if (!foundation) throw new Error(`Foundation ${id} disappeared from catalog.`);
  return foundation;
}

function templateValues(name: string, author = ""): Record<string, string> {
  const slug = validateProjectName(name);
  return {
    PROJECT_NAME: name,
    PROJECT_SLUG: slug,
    PACKAGE_NAME: slug,
    PYTHON_PACKAGE_NAME: pythonPackageName(slug),
    AUTHOR: author,
  };
}

async function renderApp(
  root: string,
  app: ProjectBlueprint["apps"][number],
  catalog: ResolvedCatalog,
  values: Record<string, string>,
): Promise<{ cwd: string; manifest: StarterManifest; foundation: Foundation }> {
  const foundation = foundationFor(catalog, app.foundationId);
  logger.info(`Preparing ${foundation.name}...`);
  const prepared = await prepareFoundation(foundation);
  const destination = app.path === "." ? root : path.join(root, app.path);
  try {
    await materializePreparedFoundation(prepared.tempDir, destination);
    await replaceTemplateVariables(destination, values);
    return { cwd: destination, manifest: prepared.manifest, foundation };
  } finally {
    await fs.rm(prepared.tempDir, { recursive: true, force: true });
  }
}

export async function generateProject(
  destination: string,
  requirements: ProductRequirements,
  blueprint: ProjectBlueprint,
  catalog: ResolvedCatalog,
  options: GenerateOptions = {},
): Promise<ProjectManifest> {
  const root = path.resolve(destination);
  await assertTargetAvailable(root);
  const existed = await fs.stat(root).then(() => true).catch(() => false);
  await fs.mkdir(root, { recursive: true });

  const lifecycle: Array<{ cwd: string; manifest: StarterManifest; foundation: Foundation }> = [];
  try {
    const values = templateValues(requirements.name, options.author);
    for (const app of blueprint.apps) {
      lifecycle.push(await renderApp(root, app, catalog, values));
    }

    await writeWorkspaceFiles(root, blueprint);
    await ensureFonijDir(root);

    const now = new Date().toISOString();
    const manifest: ProjectManifest = {
      schemaVersion: 1,
      project: {
        name: requirements.name,
        stage: requirements.stage,
        ...(requirements.idea ? { idea: requirements.idea } : {}),
      },
      requirements,
      blueprint,
      createdWith: { cli: CLI_VERSION, catalog: catalog.catalogVersion, at: now },
      updatedAt: now,
    };
    await saveProjectManifest(root, manifest);
    await saveMigrationHistory(root, { schemaVersion: 1, applied: [] });

    for (const item of lifecycle) {
      await runFoundationLifecycle(item.foundation, item.manifest, item.cwd, options);
    }

    const gitCheck = await execa("git", ["rev-parse", "--is-inside-work-tree"], { cwd: root, reject: false });
    if (gitCheck.exitCode !== 0) await execa("git", ["init"], { cwd: root });

    return manifest;
  } catch (error) {
    if (!existed) await fs.rm(root, { recursive: true, force: true });
    throw error;
  }
}
