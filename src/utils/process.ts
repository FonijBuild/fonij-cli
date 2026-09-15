import { execa } from "execa";
import type { ProcessCommand } from "../contracts/index.js";

export async function runCommand(
  spec: ProcessCommand,
  cwd: string,
  stdio: "inherit" | "pipe" = "inherit",
): Promise<void> {
  await execa(spec.command, spec.args, { cwd, stdio });
}

export async function commandVersion(
  command: string,
  args: string[] = ["--version"],
): Promise<string | undefined> {
  const result = await execa(command, args, { reject: false });
  if (result.exitCode !== 0) return undefined;
  return result.stdout.trim() || result.stderr.trim() || undefined;
}

export async function gitIsClean(cwd: string): Promise<boolean> {
  const result = await execa("git", ["status", "--porcelain"], {
    cwd,
    reject: false,
  });
  return result.exitCode === 0 && result.stdout.trim() === "";
}
