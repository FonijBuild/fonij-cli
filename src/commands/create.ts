import { select } from "@inquirer/prompts";
import { Command } from "commander";

import { generateProject } from "../core/generator.js";
import { loadStarters } from "../registry/client.js";
import { logger } from "../utils/logger.js";

export const createCommand = new Command("create")
  .description("Create a new project from FonijBuild starter")
  .argument("<project-name>", "Name of the project")
  .option("-s, --starter <starter>", "Starter name")
  .action(async (projectName: string, options) => {
    try {
      const starters = await loadStarters();
      let starter;

      if (options.starter) {
        starter = starters.find((item) => item.name === options.starter);
        if (!starter) {
          logger.error(`Starter "${options.starter}" not found`);
          process.exit(1);
        }
      } else {
        starter = await select({
          message: "Choose a starter",
          choices: starters.map((item) => ({
            name: `${item.displayName} - ${item.description}`,
            value: item,
          })),
        });
      }

      await generateProject(starter, projectName);

      logger.success(
        `
        Project created successfully 🚀

        Next steps:

        cd ${projectName}

        `,
      );
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
