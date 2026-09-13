import { execa } from "execa";

export async function installDependencies(command: string, cwd: string) {
  const parts = command.split(" ");

  await execa(parts[0], parts.slice(1), {
    cwd,
    stdio: "inherit",
  });
}
