import { Command } from "commander";

import { loadStarters } from "../registry/client.js";

export const listCommand = new Command("list")
  .description("List available starters")
  .action(async () => {
    const starters = await loadStarters();

    console.log("\nAvailable FonijBuild starters:\n");

    for (const starter of starters) {
      console.log(
        `
      ${starter.displayName}

      Name:
      ${starter.name}

      Category:
      ${starter.category ?? "-"}

      Description:
      ${starter.description}

      Repository:
      ${starter.repository}

      -------------------------
      `,
      );
    }
  });
