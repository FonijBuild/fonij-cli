import { CliError } from "./errors.js";

export function slugifyProjectName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function validateProjectName(value: string): string {
  const slug = slugifyProjectName(value);
  if (!slug) {
    throw new CliError(
      "Project name must contain at least one letter or number.",
      "INVALID_PROJECT_NAME",
    );
  }
  return slug;
}

export function pythonPackageName(value: string): string {
  const slug = validateProjectName(value);
  const normalized = slug.replace(/-/g, "_");
  return /^[0-9]/.test(normalized) ? `app_${normalized}` : normalized;
}
