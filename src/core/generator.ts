import { cloneRepository } from "./git.js";
import { installDependencies } from "./installer.js";
import { runHook } from "./lifecycle.js";
import { loadStarterConfig } from "./starter-loader.js";
import { replaceVariables } from "./template-engine.js";
import { collectVariables } from "./variables.js";

export async function generateProject(starter: any, projectName: string) {
  await cloneRepository(starter.repository, projectName);

  const config = await loadStarterConfig(projectName);
  const variables = await collectVariables(config.variables ?? []);

  await replaceVariables(projectName, {
    ...variables,
    PROJECT_NAME: projectName,
  });

  if (config.commands?.install) {
    await installDependencies(config.commands.install, projectName);
  }

  if (config.hooks?.afterCreate) {
    await runHook(config.hooks.afterCreate, projectName);
  }
}
