#!/usr/bin/env node

import { Command } from "commander";

import { createCommand } from "./commands/create.js";
import { listCommand } from "./commands/list.js";

const program = new Command();

program.name("fonij").version("0.2.0");

program.addCommand(createCommand);
program.addCommand(listCommand);

program.parse();
