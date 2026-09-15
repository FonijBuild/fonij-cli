import fs from "node:fs/promises";
import path from "node:path";
import { CliError } from "./errors.js";

export async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function assertTargetAvailable(target: string): Promise<void> {
  if (!(await pathExists(target))) return;
  const entries = await fs.readdir(target);
  if (entries.length > 0) {
    throw new CliError(
      `Target directory is not empty: ${target}`,
      "TARGET_NOT_EMPTY",
      "Choose a new directory or empty the target first.",
    );
  }
}

export async function writeJson(target: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readJson(target: string): Promise<unknown> {
  const raw = await fs.readFile(target, "utf8");
  return JSON.parse(raw);
}

export async function listTextFiles(
  root: string,
  ignored = new Set([".git", "node_modules", ".fonij", "dist", "build"]),
): Promise<string[]> {
  const results: string[] = [];
  async function walk(current: string): Promise<void> {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      if (entry.isDirectory() && ignored.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      const stat = await fs.stat(full);
      if (stat.size > 2 * 1024 * 1024) continue;
      const buffer = await fs.readFile(full);
      if (buffer.includes(0)) continue;
      results.push(full);
    }
  }
  await walk(root);
  return results;
}
