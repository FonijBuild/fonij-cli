import chalk from "chalk";
import type { ProductRequirements, ProjectBlueprint } from "../contracts/index.js";

export function formatPlan(requirements: ProductRequirements, blueprint: ProjectBlueprint): string {
  const lines: string[] = [];
  lines.push(chalk.bold("Recommended architecture"));
  lines.push("");
  lines.push(`Stage: ${requirements.stage}`);
  lines.push(`Blueprint: ${blueprint.id}`);
  lines.push(`Workspace: ${blueprint.workspace}`);
  lines.push("");
  lines.push(chalk.bold("Applications"));
  for (const app of blueprint.apps) {
    lines.push(`  • ${app.target}: ${app.foundationId} → ${app.path}`);
    lines.push(`    ${chalk.gray(app.reason)}`);
  }
  if (blueprint.capabilities.length) {
    lines.push("");
    lines.push(`${chalk.bold("Capabilities")}: ${blueprint.capabilities.join(", ")}`);
  }
  if (blueprint.reasons.length) {
    lines.push("");
    lines.push(chalk.bold("Why"));
    for (const reason of blueprint.reasons) lines.push(`  • ${reason}`);
  }
  return lines.join("\n");
}
