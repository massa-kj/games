# Scripts

This directory contains utility scripts for the games project.

## Scripts Overview

### `build-games-registry.ts`
Builds a registry of all games by collecting `game.config.json` manifests from the `apps/` directory and generating a consolidated `dist/data/games.json` file.

### `create-game.ts`
Interactive script to create a new game project. Generates the necessary files and directory structure for a new game in the `apps/` directory based on templates.

See [create-game-guide.md](../docs/create-game-guide.md) for detailed usage instructions.

### `dev-app.ts`
Development server launcher for individual games. Lists available apps and starts the Vite development server for the specified game.

**Usage:** `pnpm dev <app-name>`

### `validate-manifests.ts`
Validates all `game.config.json` files in the `apps/` directory against the JSON schema defined in `data/game-manifest.schema.json`. Reports validation errors and summary.

### `generate-doc/`
Documentation generation tools for the core library.

See [generate-doc/README.md](./generate-doc/README.md) for detailed documentation.

## Usage

All scripts are executable with `tsx` and can be run from the project root:

```bash
# Build games registry
./scripts/build-games-registry.ts

# Create a new game (interactive)
./scripts/create-game.ts

# Start development server
./scripts/dev-app.ts <game-name>

# Validate all game manifests
./scripts/validate-manifests.ts

# Generate core documentation
./scripts/generate-doc/generate-core-docs.ts
```

Or using pnpm scripts (if configured in `package.json`):

```bash
pnpm build:registry
pnpm create:game
pnpm dev <game-name>
pnpm validate:manifests
pnpm build:docs
```
