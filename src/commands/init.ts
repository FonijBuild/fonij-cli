import path from "node:path";
import { select } from "@inquirer/prompts";
import { Command } from "commander";
import { loadCatalog } from "../catalog/client.js";
import { ProductRequirementsSchema, type ProductStage, type ProjectManifest } from "../contracts/index.js";
import { planAdoptedFoundation } from "../planner/deterministic.js";
import { CLI_VERSION } from "../version.js";
import { detectExistingTarget } from "../project/detect.js";
import { ensureFonijDir, findProjectRoot, saveMigrationHistory, saveProjectManifest } from "../project/manifest.js";
import { CliError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { askProjectName } from "../utils/prompts.js";

export const initCommand = new Command("init")
  .description("Adopt an existing standalone repository as a Fonij project")
  .option("--name <name>", "Project name")
  .action(async (options: { name?: string }) => {
    if (await findProjectRoot()) {
      throw new CliError("This repository is already a Fonij project.", "ALREADY_FONIJ_PROJECT");
    }

    const root = process.cwd();
    const detected = await detectExistingTarget(root);
    if (!detected) {
      throw new CliError(
        "Could not identify the existing project type.",
        "PROJECT_DETECTION_FAILED",
        "Supported adoption targets include Vite/Next web apps, Expo apps, Django APIs, and Python services.",
      );
    }

    const name = options.name ?? (await askProjectName(path.basename(root)));
    const stage = await select<ProductStage>({
      message: "Current product stage",
      choices: [
        { name: "Prototype", value: "prototype" },
        { name: "MVP", value: "mvp" },
        { name: "Production", value: "production" },
      ],
    });

    const catalog = await loadCatalog();
    const foundation = catalog.foundations.find((item) => item.id === detected.foundationId);
    if (!foundation) {
      throw new CliError(`Detected foundation ${detected.foundationId} is not in catalog.`, "FOUNDATION_NOT_FOUND");
    }

    const requirements = ProductRequirementsSchema.parse({
      name,
      stage,
      targets: [detected.target],
      requirements: {
        seo: detected.foundationId === "web-nextjs",
        authentication: false,
        database: detected.target === "api",
        realtime: false,
        offline: false,
        backgroundJobs: detected.target === "service",
        ai: false,
        uploads: false,
      },
    });

    const blueprint = planAdoptedFoundation(requirements, foundation, catalog);
    const now = new Date().toISOString();
    const manifest: ProjectManifest = {
      schemaVersion: 1,
      project: { name, stage },
      requirements,
      blueprint,
      createdWith: { cli: CLI_VERSION, catalog: catalog.catalogVersion, at: now },
      updatedAt: now,
    };

    await ensureFonijDir(root);
    await saveProjectManifest(root, manifest);
    await saveMigrationHistory(root, { schemaVersion: 1, applied: [] });
    logger.success(`Adopted ${foundation.name} project as ${name}.`);
  });
