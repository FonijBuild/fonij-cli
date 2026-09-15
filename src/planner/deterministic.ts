import type {
  BlueprintDefinition,
  Foundation,
  ProductRequirements,
  ProductTarget,
  ProjectBlueprint,
  ResolvedCatalog,
} from "../contracts/index.js";
import { CliError } from "../utils/errors.js";

function targetKey(targets: ProductTarget[]): string {
  const order: ProductTarget[] = ["web", "mobile", "api", "browser-extension", "service"];
  return [...new Set(targets)]
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .join("+");
}

function blueprintKey(blueprint: BlueprintDefinition): string {
  return targetKey(blueprint.targets);
}

function requirementCapabilities(requirements: ProductRequirements): string[] {
  const capabilities = new Set<string>();
  if (requirements.requirements.authentication) capabilities.add("auth");
  if (requirements.requirements.database) capabilities.add("postgres");
  if (requirements.requirements.realtime) capabilities.add("realtime");
  if (requirements.requirements.offline) capabilities.add("offline");
  if (requirements.requirements.backgroundJobs) capabilities.add("background-jobs");
  if (requirements.requirements.ai) capabilities.add("ai");
  if (requirements.requirements.uploads) capabilities.add("object-storage");
  if (requirements.targets.includes("api")) capabilities.add("rest-api");
  return [...capabilities];
}

function findFoundation(catalog: ResolvedCatalog, id: string): Foundation {
  const foundation = catalog.foundations.find((item) => item.id === id);
  if (!foundation) {
    throw new CliError(`Foundation "${id}" is not available in the catalog.`, "FOUNDATION_NOT_FOUND");
  }
  return foundation;
}

function chooseFoundationId(
  app: BlueprintDefinition["apps"][number],
  requirements: ProductRequirements,
  preferred?: string,
): string {
  const allowed = [app.foundation.default, ...app.foundation.alternatives];
  if (preferred && allowed.includes(preferred)) return preferred;

  if (app.target === "web" && requirements.requirements.seo && allowed.includes("web-nextjs")) {
    return "web-nextjs";
  }

  return app.foundation.default;
}

function appReason(target: ProductTarget, foundation: Foundation, requirements: ProductRequirements): string {
  if (target === "web" && foundation.id === "web-nextjs") {
    return "Public/SEO requirements favor the SSR-capable Next.js web foundation.";
  }
  if (target === "web") {
    return "A client-first SPA keeps the web surface simple and easy to evolve.";
  }
  if (target === "mobile") {
    return "Expo provides a pragmatic cross-platform Android/iOS foundation.";
  }
  if (target === "api") {
    return "Django provides a mature API, admin, and domain-logic foundation.";
  }
  if (target === "browser-extension") {
    return "The browser-extension foundation matches the browser runtime and packaging model.";
  }
  if (target === "service") {
    return "The Python service foundation matches workers, webhooks, automation, and messaging workloads.";
  }
  return `${foundation.name} matches the requested ${target} target.`;
}

export function resolveBlueprintDefinition(
  definition: BlueprintDefinition,
  requirements: ProductRequirements,
  catalog: ResolvedCatalog,
  preferredFoundations: Record<string, string> = {},
): ProjectBlueprint {
  const apps = definition.apps.map((app) => {
    const foundationId = chooseFoundationId(app, requirements, preferredFoundations[app.id]);
    const foundation = findFoundation(catalog, foundationId);
    return {
      id: app.id,
      target: app.target,
      foundationId,
      path: app.path,
      reason: appReason(app.target, foundation, requirements),
    };
  });

  const reasons = [
    definition.workspace === "monorepo"
      ? "Multiple product surfaces are composed in one monorepo so they can evolve together."
      : "A standalone repository avoids monorepo overhead at this product stage.",
  ];

  if (requirements.stage === "prototype" && !requirements.targets.includes("api")) {
    reasons.push("The prototype does not force a backend before the product proves it needs one.");
  }

  return {
    id: definition.id,
    workspace: definition.workspace,
    apps,
    capabilities: [...new Set([...definition.capabilities, ...requirementCapabilities(requirements)])],
    reasons,
  };
}

function directFoundationBlueprint(
  requirements: ProductRequirements,
  foundation: Foundation,
): ProjectBlueprint {
  return {
    id: `foundation:${foundation.id}`,
    workspace: "standalone",
    apps: [
      {
        id: foundation.target,
        target: foundation.target,
        foundationId: foundation.id,
        path: ".",
        reason: `${foundation.name} is the selected standalone foundation.`,
      },
    ],
    capabilities: [...new Set([...foundation.provides, ...requirementCapabilities(requirements)])],
    reasons: ["A single runtime foundation is enough for the requested product surface."],
  };
}

export function planProject(requirements: ProductRequirements, catalog: ResolvedCatalog): ProjectBlueprint {
  const key = targetKey(requirements.targets);
  const definition = catalog.blueprints.find((item) => blueprintKey(item) === key);

  if (definition) return resolveBlueprintDefinition(definition, requirements, catalog);

  // The v1 catalog intentionally has no dedicated API-only blueprint. API-only remains a valid
  // direct foundation project until a composition-specific blueprint is needed.
  if (requirements.targets.length === 1) {
    const target = requirements.targets[0]!;
    const candidates = catalog.foundations.filter((item) => item.target === target && item.status !== "deprecated");
    const foundation = candidates.find((item) => item.status === "stable") ?? candidates[0];
    if (foundation) return directFoundationBlueprint(requirements, foundation);
  }

  throw new CliError(
    `No catalog blueprint supports targets: ${requirements.targets.join(", ")}.`,
    "BLUEPRINT_NOT_FOUND",
    "Choose a supported product composition or add a blueprint to fonij-catalog.",
  );
}

export function planWithExplicitFoundation(
  requirements: ProductRequirements,
  foundation: Foundation,
  catalog: ResolvedCatalog,
): ProjectBlueprint {
  const matching = catalog.blueprints.find((definition) => {
    if (definition.workspace !== "standalone" || definition.apps.length !== 1) return false;
    const app = definition.apps[0]!;
    return app.target === foundation.target &&
      [app.foundation.default, ...app.foundation.alternatives].includes(foundation.id);
  });

  if (matching) {
    return resolveBlueprintDefinition(matching, requirements, catalog, {
      [matching.apps[0]!.id]: foundation.id,
    });
  }

  return directFoundationBlueprint(requirements, foundation);
}

export function planAdoptedFoundation(
  requirements: ProductRequirements,
  foundation: Foundation,
  catalog: ResolvedCatalog,
): ProjectBlueprint {
  const blueprint = planWithExplicitFoundation(requirements, foundation, catalog);
  return {
    ...blueprint,
    apps: blueprint.apps.map((app) => ({ ...app, reason: "Existing repository adopted by fonij init." })),
    reasons: ["Existing standalone repository adopted without changing application files."],
  };
}
