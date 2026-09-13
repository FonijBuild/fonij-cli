import { input } from "@inquirer/prompts";

export async function collectVariables(names: string[]) {
  const result: Record<string, string> = {};

  for (const name of names) {
    result[name] = await input({
      message: name,
    });
  }

  return result;
}
