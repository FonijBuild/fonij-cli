import fs from "node:fs/promises";
import path from "node:path";

export async function replaceVariables(
  directory: string,
  variables: Record<string, string>,
) {
  const files = await getFiles(directory);

  for (const file of files) {
    let content = await fs.readFile(file, "utf8");

    for (const [key, value] of Object.entries(variables)) {
      content = content.replaceAll(`{{${key}}}`, value);
    }

    await fs.writeFile(file, content);
  }
}

async function getFiles(dir: string): Promise<string[]> {
  const result: string[] = [];

  const entries = await fs.readdir(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(...(await getFiles(full)));
    } else {
      result.push(full);
    }
  }

  return result;
}
