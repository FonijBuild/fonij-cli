import fs from "node:fs/promises";
import path from "node:path";
import type { AgentPreference, ProjectManifest } from "../contracts/index.js";
import { saveProjectManifest } from "../project/manifest.js";

function agentNotes(agent: AgentPreference): string {
  const notes: Record<AgentPreference, string> = {
    generic: "Use these repository rules with any coding agent.",
    codex:
      "Codex: inspect AGENTS.md before editing and validate with the repository commands before finishing.",
    cursor:
      "Cursor: treat AGENTS.md and .fonij architecture files as project rules/context.",
    claude:
      "Claude Code: read AGENTS.md and .fonij architecture files before planning edits.",
  };
  return notes[agent];
}

export async function prepareAgentContext(
  root: string,
  manifest: ProjectManifest,
  agent: AgentPreference,
): Promise<ProjectManifest> {
  const apps = manifest.blueprint.apps
    .map(
      (app) => `- ${app.target}: \`${app.path}\` using \`${app.foundationId}\``,
    )
    .join("\n");

  const agents = `# AGENTS.md\n\n${agentNotes(agent)}\n\n## Product\n\n- Name: ${manifest.project.name}\n- Stage: ${manifest.project.stage}\n- Workspace: ${manifest.blueprint.workspace}\n\n## Architecture\n\n${apps}\n\n## Repository rules\n\n- Preserve boundaries recorded in \`.fonij/project.json\`.\n- Do not move applications between workspace paths without updating the Fonij manifest.\n- Keep secrets out of source control; use environment variables and example env files.\n- Prefer existing project conventions over introducing parallel abstractions.\n- Run relevant type checks, tests, linting, and build commands before completing changes.\n- Keep API/domain business logic in the backend when an API app exists; clients should consume contracts rather than duplicate server rules.\n- Do not modify generated catalog/project schema versions manually.\n`;

  const architecture = `# Architecture\n\nWorkspace: **${manifest.blueprint.workspace}**\n\n## Applications\n\n${apps}\n\n## Capabilities\n\n${manifest.blueprint.capabilities.map((item) => `- ${item}`).join("\n") || "- none"}\n\n## Planning reasons\n\n${manifest.blueprint.reasons.map((item) => `- ${item}`).join("\n")}\n`;

  const context = `# Product context\n\n## Name\n\n${manifest.project.name}\n\n## Stage\n\n${manifest.project.stage}\n\n## Original idea\n\n${manifest.project.idea ?? "Not recorded."}\n\n## Requirements\n\n\`\`\`json\n${JSON.stringify(manifest.requirements, null, 2)}\n\`\`\`\n`;

  await fs.writeFile(path.join(root, "AGENTS.md"), agents, "utf8");
  await fs.writeFile(
    path.join(root, ".fonij", "architecture.md"),
    architecture,
    "utf8",
  );
  await fs.writeFile(
    path.join(root, ".fonij", "product-context.md"),
    context,
    "utf8",
  );

  const updated: ProjectManifest = {
    ...manifest,
    project: { ...manifest.project },
    requirements: {
      ...manifest.requirements,
      requirements: { ...manifest.requirements.requirements },
      targets: [...manifest.requirements.targets],
    },
    blueprint: {
      ...manifest.blueprint,
      apps: manifest.blueprint.apps.map((app) => ({ ...app })),
      capabilities: [...manifest.blueprint.capabilities],
      reasons: [...manifest.blueprint.reasons],
    },
    agent: { preferred: agent },
    updatedAt: new Date().toISOString(),
  };
  await saveProjectManifest(root, updated);
  return updated;
}
