import { execa } from "execa";

export async function runHook(command: string, cwd: string) {
  await execa(command, {
    cwd,
    shell: true,
    stdio: "inherit",
  });
}
