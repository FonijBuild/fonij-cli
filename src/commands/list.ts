import { Command } from "commander";
import { starters } from "../registry/starters.js";

export const listCommand = new Command("list")
  .description("List starters")
  .action(() => {
    starters.forEach((s) => {
      console.log(`${s.name}: ${s.description}`);
    });
  });
