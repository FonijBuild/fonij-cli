# Security

Fonij can download starter repositories and install their dependencies. Package-manager install commands may execute package lifecycle scripts.

- Only add repositories you trust to the official FonijBuild registry.
- Pin registry entries to released tags before the stable public launch.
- Custom `afterCreate` hooks require explicit user approval or `--allow-hooks`.
- Never put secrets in `.fonij/project.json`, starter manifests, registry files, or generated source files.
- Review migration plans with `fonij add <target> --dry-run` before applying them.

Report vulnerabilities privately to the FonijBuild maintainers rather than opening a public issue containing exploit details.
