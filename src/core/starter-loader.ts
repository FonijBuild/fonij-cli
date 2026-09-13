import fs from "node:fs/promises";
import path from "node:path";

export async function loadStarterConfig(projectPath: string) {
  const file = path.join(projectPath, ".fonij", "starter.json");
  const content = await fs.readFile(file, "utf8");

  return JSON.parse(content);
}
