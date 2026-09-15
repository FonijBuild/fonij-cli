import { Command } from "commander";
import { AgentPreferenceSchema } from "../contracts/index.js";
import { prepareAgentContext } from "../agent/prepare.js";
import { loadProjectManifest, requireProjectRoot } from "../project/manifest.js";
import { askAgent } from "../utils/prompts.js";
import { logger } from "../utils/logger.js";

export const agentCommand = new Command("agent").description("Prepare a Fonij project for coding agents");

agentCommand
  .command("prepare")
  .description("Generate AGENTS.md and persistent product/architecture context")
  .option("--agent <name>", "generic | codex | cursor | claude")
  .action(async (options: { agent?: string }) => {
    const root = await requireProjectRoot();
    const manifest = await loadProjectManifest(root);
    const agent = options.agent ? AgentPreferenceSchema.parse(options.agent) : await askAgent();
    await prepareAgentContext(root, manifest, agent);
    logger.success(`Agent context prepared for ${agent}.`);
  });
