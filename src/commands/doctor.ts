import { Command } from "commander";
import { execa } from "execa";

type CheckResult = {
  name: string;
  installed: boolean;
  version?: string;
};

async function checkCommand(command: string): Promise<CheckResult> {
  try {
    const { stdout } = await execa(command, ["--version"]);

    return {
      name: command,
      installed: true,
      version: stdout.trim(),
    };
  } catch {
    return {
      name: command,
      installed: false,
    };
  }
}

export const doctorCommand = new Command("doctor")
  .description("Check development environment")
  .action(async () => {
    console.log("\nFonij Environment Doctor 🩺\n");

    const commands = ["node", "pnpm", "git", "python3", "uv", "docker"];
    const results = await Promise.all(commands.map(checkCommand));

    for (const result of results) {
      console.log(
        result.installed
          ? `✓ ${result.name}: ${result.version}`
          : `✗ ${result.name}: not installed`,
      );
    }

    console.log();
  });
