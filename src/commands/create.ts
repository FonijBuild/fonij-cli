import { Command } from "commander";
import { select } from "@inquirer/prompts";
import ora from "ora";
import { execa } from "execa";
import { starters } from "../registry/starters.js";

export const createCommand = new Command("create")
  .argument("[project]")
  .action(async (project) => {
    const starter = await select({
      message: "Choose starter",
      choices: starters.map((s) => ({
        name: `${s.name} - ${s.description}`,
        value: s
      }))
    });

    const name = project ?? starter.name;

    const spinner = ora("Cloning starter").start();

    await execa(
      "git",
      [
        "clone",
        `https://github.com/${starter.repository}.git`,
        name
      ]
    );

    spinner.succeed("Created");

    console.log(`\ncd ${name}`);
  });
