import type {
  EvolutionDefinition,
  ProductTarget,
  ProjectBlueprint,
  ProjectManifest,
  ResolvedCatalog,
} from "../contracts/index.js";
import { resolveBlueprintDefinition } from "../planner/deterministic.js";
import { CliError } from "../utils/errors.js";

export const EVOLVABLE_TARGETS: readonly ProductTarget[] = [
  "web",
  "mobile",
  "api",
  "browser-extension",
  "service",
] as const;

export type EvolutionPlan = {
  id: string;
  target: ProductTarget;
  definition: EvolutionDefinition;
  fromBlueprint: ProjectBlueprint;
  toBlueprint: ProjectBlueprint;
  operations: string[];
};

function operationLabel(operation: EvolutionDefinition["operations"][number]): string {
  if (operation.type === "move-app") {
    return `Move existing ${operation.app} application to ${operation.to}.`;
  }
  if (operation.type === "add-foundation") {
    return `Add ${operation.target} application using ${operation.foundation} at ${operation.path}.`;
  }
  return `Create/update ${operation.packageManager} monorepo workspace files.`;
}

export function planEvolution(
  manifest: ProjectManifest,
  target: ProductTarget,
  catalog: ResolvedCatalog,
): EvolutionPlan {
  if (manifest.requirements.targets.includes(target)) {
    throw new CliError(`Project already contains target "${target}".`, "TARGET_ALREADY_EXISTS");
  }

  const candidate = catalog.evolutions.find((evolution) => {
    if (evolution.fromBlueprint !== manifest.blueprint.id) return false;
    const destination = catalog.blueprints.find((item) => item.id === evolution.toBlueprint);
    if (!destination) return false;
    return destination.targets.includes(target) && !manifest.requirements.targets.includes(target);
  });

  if (!candidate) {
    throw new CliError(
      `No catalog evolution adds "${target}" from blueprint "${manifest.blueprint.id}".`,
      "EVOLUTION_NOT_FOUND",
      "Check `fonij catalog status` or add the required evolution to fonij-catalog.",
    );
  }

  const targetDefinition = catalog.blueprints.find((item) => item.id === candidate.toBlueprint);
  if (!targetDefinition) {
    throw new CliError(
      `Evolution "${candidate.id}" points to missing blueprint "${candidate.toBlueprint}".`,
      "CATALOG_INVALID_REFERENCE",
    );
  }

  const nextRequirements = {
    ...manifest.requirements,
    targets: targetDefinition.targets,
  };

  const preferredFoundations: Record<string, string> = {};
  for (const app of manifest.blueprint.apps) preferredFoundations[app.id] = app.foundationId;

  const nextBlueprint = resolveBlueprintDefinition(
    targetDefinition,
    nextRequirements,
    catalog,
    preferredFoundations,
  );

  return {
    id: candidate.id,
    target,
    definition: candidate,
    fromBlueprint: manifest.blueprint,
    toBlueprint: nextBlueprint,
    operations: [
      ...candidate.operations.map(operationLabel),
      "Update .fonij/project.json and migration history.",
    ],
  };
}
