import { Command } from "commander";

import { loadRegistry } from "../registry/client.js";

export const updateCommand = new Command("update")
  .description("Update Fonij registry")
  .action(async () => {
    const registry = await loadRegistry();
    console.log(
      `
        ✓ Registry updated

        Version:
        ${registry.version}

        Updated:
        ${registry.updatedAt}

        `,
    );
  });
