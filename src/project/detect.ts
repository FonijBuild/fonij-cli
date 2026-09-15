import fs from "node:fs/promises";
import path from "node:path";
import type { ProductTarget } from "../contracts/index.js";
import { pathExists } from "../utils/fs.js";

export type DetectedFoundation = { target: ProductTarget; foundationId: string };

export async function detectExistingTarget(root: string): Promise<DetectedFoundation | undefined> {
  if (await pathExists(path.join(root, "manage.py"))) {
    return { target: "api", foundationId: "api-django" };
  }

  const packageFile = path.join(root, "package.json");
  if (!(await pathExists(packageFile))) {
    if (await pathExists(path.join(root, "pyproject.toml"))) {
      return { target: "service", foundationId: "python-service" };
    }
    return undefined;
  }

  try {
    const pkg = JSON.parse(await fs.readFile(packageFile, "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    if (deps.expo || deps["react-native"]) return { target: "mobile", foundationId: "app-expo" };
    if (deps.next) return { target: "web", foundationId: "web-nextjs" };
    if (deps["extension"] || deps["extension.js"]) return { target: "browser-extension", foundationId: "browser-extension" };
    if (deps.vite || (await pathExists(path.join(root, "vite.config.ts")))) {
      return { target: "web", foundationId: "web-spa" };
    }
  } catch {
    return undefined;
  }
  return undefined;
}
