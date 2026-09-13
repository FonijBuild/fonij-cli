import { Command } from "commander";

import { createCommand } from "./commands/create.js";
import { doctorCommand } from "./commands/doctor.js";
import { infoCommand } from "./commands/info.js";
import { listCommand } from "./commands/list.js";

const program = new Command();

program.name("fonij").description("FonijBuild starter CLI").version("0.3.0");

program.addCommand(createCommand);
program.addCommand(listCommand);
program.addCommand(infoCommand);
program.addCommand(doctorCommand);

program.parse();
