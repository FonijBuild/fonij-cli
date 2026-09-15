import { ProductRequirementsSchema, type ProductRequirements, type ProductTarget } from "../contracts/index.js";
import { slugifyProjectName } from "../utils/naming.js";
import type { IdeaAnalyzer } from "./provider.js";

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

export class LocalIdeaAnalyzer implements IdeaAnalyzer {
  async analyze(idea: string, projectName: string): Promise<ProductRequirements> {
    const text = idea.toLowerCase();
    const targets = new Set<ProductTarget>();

    const frontendOnly = includesAny(text, ["frontend only", "front-end only", "فقط فرانت", "demo only"]);
    const extension = includesAny(text, ["browser extension", "chrome extension", "firefox extension", "اکستنشن"]);
    const mobile = includesAny(text, ["mobile", "ios", "android", "react native", "cross-platform", "موبایل"]);
    const web = includesAny(text, ["web", "website", "dashboard", "saas", "panel", "وب"]);
    const service = includesAny(text, [
      "telegram bot", "whatsapp bot", "discord bot", "messaging bot", "bot", "بات",
      "worker", "cron", "scheduled job", "webhook", "automation", "اتوماسیون",
    ]);
    const needsBackend = !frontendOnly && includesAny(text, [
      "backend", "api", "database", "auth", "login", "account", "payment", "reservation",
      "order", "upload", "admin", "server", "دیتابیس", "بک", "ورود", "ثبت نام",
    ]);

    if (extension) targets.add("browser-extension");
    if (mobile) targets.add("mobile");
    if (service) targets.add("service");
    if (web || targets.size === 0) targets.add("web");
    if (needsBackend) targets.add("api");

    const prototype = includesAny(text, ["prototype", "demo", "validate", "proof of concept", "پروتوتایپ", "دمو"]);
    const production = includesAny(text, ["production", "enterprise", "scale", "high traffic", "پروداکشن"]);

    return ProductRequirementsSchema.parse({
      name: slugifyProjectName(projectName) || "fonij-project",
      idea,
      stage: prototype ? "prototype" : production ? "production" : "mvp",
      targets: [...targets],
      requirements: {
        seo: includesAny(text, ["seo", "google", "blog", "landing", "public content", "سئو"]),
        authentication: includesAny(text, ["auth", "login", "signup", "account", "user profile", "ورود", "ثبت نام"]),
        database: includesAny(text, ["database", "data", "reservation", "order", "crm", "marketplace", "دیتابیس"]),
        realtime: includesAny(text, ["realtime", "real-time", "live", "chat", "socket", "لحظه ای"]),
        offline: includesAny(text, ["offline", "آفلاین"]),
        backgroundJobs: includesAny(text, ["queue", "background job", "scheduled", "cron", "worker", "صف"]),
        ai: includesAny(text, ["ai", "llm", "chatgpt", "openai", "artificial intelligence", "هوش مصنوعی"]),
        uploads: includesAny(text, ["upload", "photo", "image", "video", "file", "media", "آپلود", "عکس"]),
      },
    });
  }
}
