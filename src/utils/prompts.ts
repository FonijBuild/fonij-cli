import { checkbox, confirm, input, select } from "@inquirer/prompts";
import type {
  AgentPreference,
  ProductRequirements,
  ProductStage,
  ProductTarget,
} from "../contracts/index.js";
import { validateProjectName } from "./naming.js";

export async function askProjectName(defaultValue?: string): Promise<string> {
  const value = await input({
    message: "Project name",
    default: defaultValue,
    validate: (answer: string) => {
      try {
        validateProjectName(answer);
        return true;
      } catch (error) {
        return error instanceof Error ? error.message : "Invalid project name";
      }
    },
  });
  return validateProjectName(value);
}

export async function confirmAction(message: string, defaultValue = true): Promise<boolean> {
  return confirm({ message, default: defaultValue });
}

export async function guidedRequirements(name: string): Promise<ProductRequirements> {
  const stage = await select<ProductStage>({
    message: "What stage are you at?",
    choices: [
      { name: "Prototype / demo", value: "prototype" },
      { name: "MVP", value: "mvp" },
      { name: "Production", value: "production" },
    ],
  });

  const interfaces = await checkbox<ProductTarget>({
    message: "What should users interact with?",
    required: true,
    choices: [
      { name: "Web app", value: "web" },
      { name: "Cross-platform mobile app", value: "mobile" },
      { name: "Browser extension", value: "browser-extension" },
      { name: "Backend/API only", value: "api" },
      { name: "Automation / messaging service", value: "service" },
    ],
  });

  const hasApi = interfaces.includes("api")
    ? true
    : await confirm({ message: "Do you need a backend/API now?", default: stage !== "prototype" });

  const targets = [...interfaces];
  if (hasApi && !targets.includes("api")) targets.push("api");

  const featureChoices = await checkbox<string>({
    message: "Select product requirements",
    choices: [
      { name: "SEO / public discoverable pages", value: "seo" },
      { name: "Authentication", value: "authentication" },
      { name: "Persistent database", value: "database" },
      { name: "Realtime features", value: "realtime" },
      { name: "Offline support", value: "offline" },
      { name: "Background jobs", value: "backgroundJobs" },
      { name: "AI features", value: "ai" },
      { name: "File/image uploads", value: "uploads" },
    ],
  });

  const selected = new Set(featureChoices);
  return {
    name,
    stage,
    targets,
    requirements: {
      seo: selected.has("seo"),
      authentication: selected.has("authentication"),
      database: selected.has("database"),
      realtime: selected.has("realtime"),
      offline: selected.has("offline"),
      backgroundJobs: selected.has("backgroundJobs"),
      ai: selected.has("ai"),
      uploads: selected.has("uploads"),
    },
  };
}

export async function askAgent(): Promise<AgentPreference> {
  return select<AgentPreference>({
    message: "Preferred coding agent",
    choices: [
      { name: "Generic / any agent", value: "generic" },
      { name: "OpenAI Codex", value: "codex" },
      { name: "Cursor", value: "cursor" },
      { name: "Claude Code", value: "claude" },
    ],
  });
}
