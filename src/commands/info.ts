import { Command } from "commander";

import { loadStarters } from "../registry/client.js";

export const infoCommand = new Command("info")
  .description("Show starter information")
  .argument("<starter-name>", "Starter name")
  .action(async (starterName: string) => {
    const starters = await loadStarters();
    const starter = starters.find((item) => item.name === starterName);

    if (!starter) {
      console.error(`Starter "${starterName}" not found`);
      process.exit(1);
    }

    console.log(
      `
        ${starter.displayName}

        Name:
        ${starter.name}


        Description:
        ${starter.description}


        Repository:
        ${starter.repository}


        Language:
        ${starter.language ?? "-"}


        Package Manager:
        ${starter.packageManager ?? "-"}


        Requirements:
        ${JSON.stringify(starter.requirements, null, 2)}


        Commands:
        ${JSON.stringify(starter.commands, null, 2)}
        `,
    );
  });
