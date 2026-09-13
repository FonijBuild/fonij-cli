import { select } from "@inquirer/prompts";
import { Command } from "commander";

import { generateProject } from "../core/generator.js";
import { loadStarters } from "../registry/client.js";

export const createCommand = new Command("create")
  .argument("<project-name>")
  .action(async (projectName) => {
    const starters = await loadStarters();
    const starter = await select({
      message: "Choose starter",
      choices: starters.map((item) => ({
        name: `${item.displayName} - ${item.description}`,
        value: item,
      })),
    });

    await generateProject(starter, projectName);
    console.log(
      `🚀 Project created
        cd ${projectName}`,
    );
  });
