import { Command } from "commander";
import { runDoctorChecks } from "../doctor/checks.js";
import { findProjectRoot, loadProjectManifest } from "../project/manifest.js";
import { logger } from "../utils/logger.js";

export const doctorCommand = new Command("doctor")
  .description("Check the local development environment")
  .option("--json", "Print JSON")
  .action(async (options: { json?: boolean }) => {
    const root = await findProjectRoot();
    const manifest = root ? await loadProjectManifest(root) : undefined;
    const checks = await runDoctorChecks(manifest);

    if (options.json) {
      console.log(JSON.stringify(checks, null, 2));
      return;
    }

    logger.heading("Fonij doctor");
    for (const check of checks) {
      const symbol = check.ok ? "✓" : check.required ? "✗" : "○";
      const requirement = check.required ? "required" : "optional";
      console.log(`${symbol} ${check.name}: ${check.version ?? "not found"} (${requirement})`);
      if (check.note) logger.muted(`  ${check.note}`);
    }

    const failed = checks.filter((check) => check.required && !check.ok);
    if (failed.length > 0) {
      process.exitCode = 1;
      logger.warn(`${failed.length} required environment check(s) failed.`);
    } else {
      logger.success("Environment looks ready.");
    }
  });
