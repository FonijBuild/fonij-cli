import ora from "ora";

import type { Starter } from "../../registry/types.js";
import { cloneRepository } from "./git.js";
import { installDependencies } from "./installer.js";

export async function generateProject(starter: Starter, projectName: string) {
  const spinner = ora("Creating project...").start();
  await cloneRepository(starter.repository, projectName);
  spinner.succeed("Template downloaded");

  if (starter.setup?.install) {
    const installSpinner = ora("Installing dependencies...").start();
    await installDependencies(starter.setup.install, projectName);
    installSpinner.succeed("Dependencies installed");
  }
}
