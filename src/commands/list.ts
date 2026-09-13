import { Command } from "commander";

import { loadStarters } from "../registry/client.js";

export const listCommand = new Command("list").action(async () => {
  const starters = await loadStarters();

  starters.forEach((s) => {
    console.log(
      `${s.name}
        ${s.description}`,
    );
  });
});
