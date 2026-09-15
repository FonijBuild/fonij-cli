import fs from "node:fs/promises";
import { listTextFiles } from "../utils/fs.js";

export async function replaceTemplateVariables(
  directory: string,
  values: Record<string, string>,
): Promise<void> {
  const files = await listTextFiles(directory);
  for (const file of files) {
    let content = await fs.readFile(file, "utf8");
    let changed = false;
    for (const [key, value] of Object.entries(values)) {
      const token = `{{${key}}}`;
      if (content.includes(token)) {
        content = content.split(token).join(value);
        changed = true;
      }
    }
    if (changed) await fs.writeFile(file, content, "utf8");
  }
}
