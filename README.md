<div align="center">

# Fonij CLI

**The AI-first product builder CLI - from idea to the right architecture, a working project, and safe evolution as the product grows.**

[![npm](https://img.shields.io/npm/v/@fonijbuild/cli?logo=npm)](https://www.npmjs.com/package/@fonijbuild/cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
![Status: Active](https://img.shields.io/badge/status-active-2EA44F)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

[Documentation](https://github.com/FonijBuild/product-builder-handbook) · [Discussions](https://github.com/orgs/FonijBuild/discussions) · [Issues](https://github.com/FonijBuild/fonij-cli/issues)

</div>

> “What do we build for, if not to lessen each other’s hardship?”

## What it does

Fonij turns product intent into a maintainable project:

```text
Idea → Requirements → Architecture → Project → Evolution
```

It prefers the smallest architecture that satisfies the product, then lets the project grow when requirements change.

## Core commands

```bash
fonij plan
fonij create
fonij add
fonij inspect
fonij doctor
fonij agent prepare
```

- `plan` — recommend an architecture without writing files
- `create` — generate a project from a validated blueprint
- `add` — evolve an existing project
- `inspect` — explain the current Fonij project
- `doctor` — check the local development environment
- `agent prepare` — generate AI coding-agent context

## Quick start

```bash
pnpm dlx @fonijbuild/cli plan
pnpm dlx @fonijbuild/cli create my-product
```

For local development:

```bash
pnpm install
pnpm check
pnpm dev -- --help
```

## Principles

- Product requirements before technology choices
- Deterministic planning after AI intent extraction
- Progressive architecture instead of premature complexity
- Safe, inspectable project migrations
- Independently maintainable foundations

Architecture knowledge lives in [`fonij-catalog`](https://github.com/FonijBuild/fonij-catalog).

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request. Security issues must follow [`SECURITY.md`](SECURITY.md).
