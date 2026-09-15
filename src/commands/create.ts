import path from "node:path";
import { Command } from "commander";
import { analyzeIdea } from "../ai/analyze.js";
import { loadCatalog } from "../catalog/client.js";
import { ProductRequirementsSchema, type ProductRequirements } from "../contracts/index.js";
import { generateProject } from "../generator/project.js";
import { planProject, planWithExplicitFoundation } from "../planner/deterministic.js";
import { formatPlan } from "../planner/presenter.js";
import { CliError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { askProjectName, confirmAction, guidedRequirements } from "../utils/prompts.js";
import { validateProjectName } from "../utils/naming.js";

export const createCommand = new Command("create")
  .description("Validate, architect, and build a product from the Fonij catalog")
  .argument("[project-name]", "Project directory/name")
  .option("-i, --idea <text>", "Describe the product idea in natural language")
  .option("-f, --foundation <id>", "Build directly from a specific foundation")
  .option("--author <name>", "Author value for template variables")
  .option("--skip-install", "Generate files without installing dependencies")
  .option("--allow-hooks", "Allow custom after-create commands from trusted foundations")
  .option("--dry-run", "Show the plan without writing files")
  .option("-y, --yes", "Accept the proposed plan without confirmation")
  .option("--no-ai", "Do not call an AI provider even when OPENAI_API_KEY is available")
  .action(async (projectNameArg: string | undefined, options: { idea?: string; foundation?: string; author?: string; skipInstall?: boolean; allowHooks?: boolean; dryRun?: boolean; yes?: boolean; ai?: boolean }) => {
    const catalog = await loadCatalog();
    const projectName = projectNameArg ? validateProjectName(projectNameArg) : await askProjectName();

    let requirements: ProductRequirements;
    let blueprint;

    if (options.foundation) {
      const foundation = catalog.foundations.find((item) => item.id === options.foundation);
      if (!foundation) throw new CliError(`Foundation "${options.foundation}" was not found.`, "FOUNDATION_NOT_FOUND");
      requirements = ProductRequirementsSchema.parse({
        name: projectName,
        stage: "prototype",
        targets: [foundation.target],
        requirements: {
          seo: foundation.id === "web-nextjs",
          authentication: false,
          database: foundation.target === "api",
          realtime: false,
          offline: false,
          backgroundJobs: foundation.target === "service",
          ai: false,
          uploads: false,
        },
      });
      blueprint = planWithExplicitFoundation(requirements, foundation, catalog);
    } else if (options.idea) {
      const analyzed = await analyzeIdea(options.idea, projectName, { useAI: options.ai });
      requirements = { ...analyzed.requirements, name: projectName };
      logger.info(`Idea analysis source: ${analyzed.source}`);
      blueprint = planProject(requirements, catalog);
    } else {
      requirements = await guidedRequirements(projectName);
      blueprint = planProject(requirements, catalog);
    }

    logger.heading("Fonij plan");
    console.log(formatPlan(requirements, blueprint));

    if (options.dryRun) {
      logger.success("Dry run complete. No files were written.");
      return;
    }

    if (!options.yes && !(await confirmAction("Build this project?", true))) {
      logger.warn("Cancelled.");
      return;
    }

    const destination = path.resolve(process.cwd(), projectName);
    await generateProject(destination, requirements, blueprint, catalog, {
      skipInstall: options.skipInstall,
      allowHooks: options.allowHooks,
      yes: options.yes,
      author: options.author,
    });

    logger.success(`Project created at ${destination}`);
    logger.muted(`Next: cd ${projectName} && fonij inspect`);
  });
