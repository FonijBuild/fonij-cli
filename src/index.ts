#!/usr/bin/env node

import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { agentCommand } from "./commands/agent.js";
import { catalogCommand } from "./commands/catalog.js";
import { createCommand } from "./commands/create.js";
import { doctorCommand } from "./commands/doctor.js";
import { infoCommand } from "./commands/info.js";
import { initCommand } from "./commands/init.js";
import { inspectCommand } from "./commands/inspect.js";
import { listCommand } from "./commands/list.js";
import { planCommand } from "./commands/plan.js";
import { CliError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";
import { CLI_VERSION } from "./version.js";

const program = new Command();
program
  .name("fonij")
  .description("The AI-first product builder CLI for FonijBuild")
  .version(CLI_VERSION)
  .showHelpAfterError();

program.addCommand(createCommand);
program.addCommand(planCommand);
program.addCommand(addCommand);
program.addCommand(initCommand);
program.addCommand(inspectCommand);
program.addCommand(doctorCommand);
program.addCommand(listCommand);
program.addCommand(infoCommand);
program.addCommand(catalogCommand);
program.addCommand(agentCommand);

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error instanceof CliError) {
    logger.error(`${error.message} [${error.code}]`);
    if (error.hint) logger.muted(error.hint);
    process.exitCode = 1;
  } else {
    logger.error(error instanceof Error ? error.message : String(error));
    if (process.env.FONIJ_DEBUG === "1" && error instanceof Error) console.error(error.stack);
    process.exitCode = 1;
  }
}
