import semver from "semver";
import type { ProjectManifest, ProductTarget } from "../contracts/index.js";
import { commandVersion } from "../utils/process.js";

export type DoctorCheck = {
  name: string;
  required: boolean;
  ok: boolean;
  version?: string;
  note?: string;
};

async function checkTool(
  name: string,
  command: string,
  required: boolean,
  args: string[] = ["--version"],
): Promise<DoctorCheck> {
  const version = await commandVersion(command, args);
  return { name, required, ok: Boolean(version), ...(version ? { version } : {}) };
}

function targets(manifest?: ProjectManifest): Set<ProductTarget> {
  return new Set(manifest?.requirements.targets ?? []);
}

export async function runDoctorChecks(manifest?: ProjectManifest): Promise<DoctorCheck[]> {
  const projectTargets = targets(manifest);
  const needsJs =
    !manifest ||
    ["web", "mobile", "browser-extension"].some((target) =>
      projectTargets.has(target as ProductTarget),
    );
  const needsPython = projectTargets.has("api") || projectTargets.has("service");
  const needsMobile = projectTargets.has("mobile");

  const checks: DoctorCheck[] = [];
  const nodeVersion = process.version;
  checks.push({
    name: "Node.js",
    required: true,
    ok: semver.satisfies(semver.coerce(nodeVersion) ?? "0.0.0", ">=22.12.0"),
    version: nodeVersion,
    note: "Fonij CLI requires Node.js >=22.12.0.",
  });

  checks.push(await checkTool("Git", "git", true));
  if (needsJs) checks.push(await checkTool("pnpm", "pnpm", true));
  if (needsPython) {
    checks.push(await checkTool("Python", "python3", true));
    checks.push(await checkTool("uv", "uv", true));
  }
  checks.push(await checkTool("Docker", "docker", false));
  if (needsMobile) {
    checks.push(await checkTool("Java", "java", false, ["-version"]));
    checks.push(await checkTool("Android Debug Bridge", "adb", false));
  }
  return checks;
}
