# Fonij CLI architecture

Fonij v1 separates probabilistic understanding from deterministic project changes.

```text
idea
        ↓
ProductRequirements
        ↓
AI adapter (optional) only extracts requirements
        ↓
Deterministic planner
        ↓
ProjectBlueprint
        ↓
Generator / Evolution engine
        ↓
.fonij/project.json
```

## Boundaries

- `contracts`: runtime-validated schemas shared by all layers.
- `catalog`: remote architecture catalog loading, relative resource resolution, validation, and cache.
- `ai`: optional idea-to-requirements adapters. It never writes project files.
- `planner`: deterministic requirements-to-blueprint rules.
- `generator`: foundation checkout, token replacement, lifecycle and workspace composition.
- `evolution`: controlled standalone-to-monorepo and app-addition migrations.
- `project`: persistent Fonij project manifest and adoption detection.
- `agent`: portable context generation for coding agents.
- `commands`: CLI orchestration only.

## Product principle

AI may interpret intent, but deterministic code owns stack selection, file operations, migrations and validation. This keeps generation testable and reproducible.
