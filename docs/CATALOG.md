# Fonij catalog contract

The CLI loads the architecture catalog from:

`https://raw.githubusercontent.com/FonijBuild/fonij-catalog/main/catalog.json`

Override it for local development or private catalogs:

```bash
export FONIJ_CATALOG_URL=http://127.0.0.1:4173/catalog.json
```

`catalog.json` is an index. The CLI resolves its relative references to foundations, blueprints, capabilities, recipes, and evolutions, validates every document at runtime, checks cross-reference invariants, then stores the resolved catalog in the local cache.

If the remote catalog is unavailable, the CLI uses a valid cache for the same catalog URL. There is intentionally no built-in starter registry: `fonij-catalog` is the architecture source of truth.

Official stable foundations should point at immutable release tags instead of `main`.
