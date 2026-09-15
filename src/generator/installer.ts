import type { Foundation, ProcessCommand, StarterManifest } from "../contracts/index.js";
import { confirmAction } from "../utils/prompts.js";
import { runCommand } from "../utils/process.js";
import { logger } from "../utils/logger.js";

export async function runFoundationLifecycle(
  foundation: Foundation,
  manifest: StarterManifest,
  cwd: string,
  options: { skipInstall?: boolean; allowHooks?: boolean; yes?: boolean },
): Promise<void> {
  if (foundation.commands.install && !options.skipInstall) {
    const command = foundation.commands.install;
    logger.info(command.label ?? `Running ${command.command} ${command.args.join(" ")}`);
    await runCommand(command, cwd);
  }

  for (const command of manifest.setup) {
    logger.info(command.label ?? `Running setup: ${command.command}`);
    await runCommand(command, cwd);
  }

  if (manifest.hooks.afterCreate.length > 0) {
    const allowed =
      options.allowHooks ||
      (!options.yes &&
        (await confirmAction(
          `Foundation requests ${manifest.hooks.afterCreate.length} custom after-create command(s). Run them?`,
          false,
        )));

    if (!allowed) {
      logger.warn("Custom after-create hooks were skipped. Re-run with --allow-hooks if you trust the foundation.");
      return;
    }

    for (const command of manifest.hooks.afterCreate) {
      logger.info(command.label ?? `Running hook: ${command.command}`);
      await runCommand(command as ProcessCommand, cwd);
    }
  }
}
