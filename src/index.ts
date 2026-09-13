#!/usr/bin/env node

import { Command } from "commander";
import { createCommand } from "./commands/create.js";
import { listCommand } from "./commands/list.js";

const program = new Command();

program
  .name("fonij")
  .description("FonijBuild project generator")
  .version("0.1.0");

program.addCommand(createCommand);
program.addCommand(listCommand);

program.parse();
