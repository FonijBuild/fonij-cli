import fs from "node:fs/promises";

import type { Starter } from "./types.js";

export async function loadStarters(): Promise<Starter[]> {
  const file = await fs.readFile("registry/starters.json", "utf-8");

  const data = JSON.parse(file);

  return data.starters;
}
