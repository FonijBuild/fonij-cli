import { Command } from "commander";
import { analyzeIdea } from "../ai/analyze.js";
import { loadCatalog } from "../catalog/client.js";
import { planProject } from "../planner/deterministic.js";
import { formatPlan } from "../planner/presenter.js";
import { askProjectName, guidedRequirements } from "../utils/prompts.js";
import { validateProjectName } from "../utils/naming.js";

export const planCommand = new Command("plan")
  .description("Validate an idea and produce a catalog-backed architecture plan")
  .option("-i, --idea <text>", "Describe the product idea")
  .option("--name <name>", "Project name used in the plan")
  .option("--json", "Print machine-readable JSON")
  .option("--no-ai", "Use local intent analysis only")
  .action(async (options: { idea?: string; name?: string; json?: boolean; ai?: boolean }) => {
    const catalog = await loadCatalog();
    const name = options.name ? validateProjectName(options.name) : await askProjectName("fonij-product");
    const requirements = options.idea
      ? (await analyzeIdea(options.idea, name, { useAI: options.ai })).requirements
      : await guidedRequirements(name);
    const blueprint = planProject(requirements, catalog);

    if (options.json) {
      console.log(JSON.stringify({ catalogVersion: catalog.catalogVersion, requirements, blueprint }, null, 2));
      return;
    }
    console.log(formatPlan(requirements, blueprint));
  });
