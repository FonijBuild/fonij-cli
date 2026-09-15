import { z } from "zod";

export const ProductTargetSchema = z.enum([
  "web",
  "mobile",
  "api",
  "browser-extension",
  "service",
]);

export const ProductStageSchema = z.enum(["prototype", "mvp", "production"]);

export const ProductFeatureRequirementsSchema = z
  .object({
    seo: z.boolean().default(false),
    authentication: z.boolean().default(false),
    database: z.boolean().default(false),
    realtime: z.boolean().default(false),
    offline: z.boolean().default(false),
    backgroundJobs: z.boolean().default(false),
    ai: z.boolean().default(false),
    uploads: z.boolean().default(false),
  })
  .strict();

export const ProductRequirementsSchema = z
  .object({
    name: z.string().min(1),
    idea: z.string().optional(),
    stage: ProductStageSchema,
    targets: z.array(ProductTargetSchema).min(1),
    requirements: ProductFeatureRequirementsSchema,
  })
  .strict();

export const ProcessCommandSchema = z
  .object({
    command: z.string().min(1),
    args: z.array(z.string()).default([]),
    label: z.string().optional(),
  })
  .strict();

export const StarterVariableSchema = z
  .object({
    name: z.string().min(1),
    prompt: z.string().min(1),
    default: z.string().optional(),
    required: z.boolean().default(true),
  })
  .strict();

// Repository-local metadata. Install/dev/check commands belong to the catalog.
// `install` remains accepted for older foundations but is not used as the source of truth.
export const StarterManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    version: z.string().min(1).optional(),
    templateVersion: z.string().min(1).optional(),
    variables: z.array(StarterVariableSchema).default([]),
    install: ProcessCommandSchema.optional(),
    setup: z.array(ProcessCommandSchema).default([]),
    hooks: z
      .object({
        afterCreate: z.array(ProcessCommandSchema).default([]),
      })
      .strict()
      .default({ afterCreate: [] }),
  })
  .passthrough();

const CatalogStatusSchema = z.enum(["experimental", "stable", "deprecated"]);
const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const FoundationSourceSchema = z
  .object({
    repository: z.string().min(1),
    ref: z.string().min(1),
    version: z.string().min(1),
  })
  .strict();

export const FoundationSchema = z
  .object({
    schemaVersion: z.literal(1),
    status: CatalogStatusSchema,
    official: z.boolean(),
    manifestPath: z.string().min(1),
    id: SlugSchema,
    name: z.string().min(1),
    description: z.string().min(1),
    target: ProductTargetSchema,
    source: FoundationSourceSchema,
    runtime: z
      .object({
        language: z.string().min(1),
        framework: z.string().min(1),
        packageManager: z.string().min(1),
      })
      .strict(),
    provides: z.array(SlugSchema),
    compatibleWith: z.array(SlugSchema),
    commands: z
      .object({
        install: ProcessCommandSchema.optional(),
        dev: ProcessCommandSchema.optional(),
        check: ProcessCommandSchema.optional(),
      })
      .strict(),
  })
  .strict();

export const CatalogIndexSchema = z
  .object({
    $schema: z.string().optional(),
    schemaVersion: z.literal(1),
    catalogVersion: z.string().min(1),
    updatedAt: z.string().min(1),
    foundations: z.array(z.string().min(1)),
    blueprints: z.array(z.string().min(1)),
    capabilities: z.array(z.string().min(1)),
    recipes: z.array(z.string().min(1)),
    evolutions: z.array(z.string().min(1)),
  })
  .strict();

export const CatalogBlueprintFoundationSchema = z
  .object({
    default: SlugSchema,
    alternatives: z.array(SlugSchema),
  })
  .strict();

export const CatalogBlueprintAppSchema = z
  .object({
    id: SlugSchema,
    target: ProductTargetSchema,
    path: z.string().min(1),
    foundation: CatalogBlueprintFoundationSchema,
  })
  .strict();

export const BlueprintDefinitionSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: SlugSchema,
    name: z.string().min(1),
    description: z.string().min(1),
    status: CatalogStatusSchema,
    workspace: z.enum(["standalone", "monorepo"]),
    targets: z.array(ProductTargetSchema).min(1),
    apps: z.array(CatalogBlueprintAppSchema).min(1),
    capabilities: z.array(SlugSchema),
    recommendedFor: z.array(SlugSchema),
  })
  .strict();

export const CapabilityDefinitionSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: SlugSchema,
    name: z.string().min(1),
    description: z.string().min(1),
    status: CatalogStatusSchema,
    category: z.string().min(1),
    supportedFoundations: z.array(SlugSchema),
    requires: z.array(SlugSchema),
    conflictsWith: z.array(SlugSchema),
  })
  .strict();

// Recipes are intentionally not consumed by CLI v1 yet. The loader still resolves them
// so catalog transport does not need another breaking change when recipe execution arrives.
export const RecipeDefinitionSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: SlugSchema,
  })
  .passthrough();

export const EvolutionOperationSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("move-app"),
      app: z.string().min(1),
      to: z.string().min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal("add-foundation"),
      app: z.string().min(1),
      target: ProductTargetSchema,
      foundation: SlugSchema,
      path: z.string().min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal("create-workspace"),
      packageManager: z.enum(["pnpm", "npm", "yarn", "bun"]),
    })
    .strict(),
]);

export const EvolutionDefinitionSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: SlugSchema,
    name: z.string().min(1),
    description: z.string().min(1),
    status: CatalogStatusSchema,
    fromBlueprint: SlugSchema,
    toBlueprint: SlugSchema,
    preconditions: z.array(z.enum(["fonij-project", "clean-git"])),
    operations: z.array(EvolutionOperationSchema).min(1),
  })
  .strict();

export const ResolvedCatalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    catalogVersion: z.string().min(1),
    updatedAt: z.string().min(1),
    sourceUrl: z.string().min(1),
    foundations: z.array(FoundationSchema),
    blueprints: z.array(BlueprintDefinitionSchema),
    capabilities: z.array(CapabilityDefinitionSchema),
    recipes: z.array(RecipeDefinitionSchema),
    evolutions: z.array(EvolutionDefinitionSchema),
  })
  .strict();

export const BlueprintAppSchema = z
  .object({
    id: z.string().min(1),
    target: ProductTargetSchema,
    foundationId: SlugSchema,
    path: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

export const ProjectBlueprintSchema = z
  .object({
    id: z.string().min(1),
    workspace: z.enum(["standalone", "monorepo"]),
    apps: z.array(BlueprintAppSchema).min(1),
    capabilities: z.array(z.string()),
    reasons: z.array(z.string()),
  })
  .strict();

export const AgentPreferenceSchema = z.enum(["generic", "codex", "cursor", "claude"]);

export const ProjectManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    project: z
      .object({
        name: z.string().min(1),
        stage: ProductStageSchema,
        idea: z.string().optional(),
      })
      .strict(),
    requirements: ProductRequirementsSchema,
    blueprint: ProjectBlueprintSchema,
    createdWith: z
      .object({
        cli: z.string().min(1),
        catalog: z.string().min(1),
        at: z.string().min(1),
      })
      .strict(),
    updatedAt: z.string().min(1),
    agent: z
      .object({ preferred: AgentPreferenceSchema })
      .strict()
      .optional(),
  })
  .strict();

export const MigrationRecordSchema = z
  .object({
    id: z.string().min(1),
    from: z.string().min(1),
    to: z.string().min(1),
    appliedAt: z.string().min(1),
  })
  .strict();

export const MigrationHistorySchema = z
  .object({
    schemaVersion: z.literal(1),
    applied: z.array(MigrationRecordSchema),
  })
  .strict();

export type ProductTarget = z.infer<typeof ProductTargetSchema>;
export type ProductStage = z.infer<typeof ProductStageSchema>;
export type ProductRequirements = z.infer<typeof ProductRequirementsSchema>;
export type ProcessCommand = z.infer<typeof ProcessCommandSchema>;
export type StarterManifest = z.infer<typeof StarterManifestSchema>;
export type CatalogIndex = z.infer<typeof CatalogIndexSchema>;
export type Foundation = z.infer<typeof FoundationSchema>;
export type BlueprintDefinition = z.infer<typeof BlueprintDefinitionSchema>;
export type CapabilityDefinition = z.infer<typeof CapabilityDefinitionSchema>;
export type RecipeDefinition = z.infer<typeof RecipeDefinitionSchema>;
export type EvolutionOperation = z.infer<typeof EvolutionOperationSchema>;
export type EvolutionDefinition = z.infer<typeof EvolutionDefinitionSchema>;
export type ResolvedCatalog = z.infer<typeof ResolvedCatalogSchema>;
export type ProjectBlueprint = z.infer<typeof ProjectBlueprintSchema>;
export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;
export type AgentPreference = z.infer<typeof AgentPreferenceSchema>;
export type MigrationHistory = z.infer<typeof MigrationHistorySchema>;
