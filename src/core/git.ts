import { execa } from "execa";

export async function cloneRepository(url: string, destination: string) {
  await execa("git", ["clone", url, destination]);
}

export async function initGit() {
  await execa("git", ["init"]);
}
