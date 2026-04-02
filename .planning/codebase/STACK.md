# Technology Stack

**Analysis Date:** 2026-04-02

## Languages

**Primary:**
- TypeScript (strict mode, ES2022 target) — 35 packages across extract and build tiers, plus 4 translate-tier packages

**Secondary:**
- Python 3.11+ — 4 translate-tier packages (contact center pattern adaptations)

## Runtime

**Environment:**
- Bun (primary runtime and package manager)
- Node.js compatible via `bun-types` type definitions
- Python 3.11+ for translate-tier Python packages

**Package Manager:**
- Bun workspaces
- Lockfile: `bun.lock` (present)
- Python packages: `pip install -e` with setuptools (pyproject.toml per package)

## Frameworks

**Core:**
- No application framework — this is a type-stub reference monorepo. Zero runtime implementations.

**Build/Dev:**
- TypeScript ^6.0.2 — type checking via `tsc --noEmit` (`tsconfig.base.json` at root)
- Biome ^2.4.10 — linting and formatting for TypeScript
- Ruff — linting for Python packages (`ruff.toml` at root)
- GNU Make — task runner (`Makefile` at root)

## Monorepo Structure

**Workspace Configuration:**
- Root `package.json` defines Bun workspaces:
  - `packages/extract/*`
  - `packages/build/*`
  - 4 explicit translate-tier TS packages
- Python packages are NOT in Bun workspaces (managed independently)

**Package Scope:** `@claude-patterns/{name}`
- Tier directory is invisible to imports
- All packages: `version: "0.0.0"`, `private: true`
- Entry point: `src/index.ts` (TS) or `src/{name}/__init__.py` (Python)

## TypeScript Configuration

**Base config:** `tsconfig.base.json`
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["bun-types"]
  }
}
```

**Per-package config:** Each TS package has a `tsconfig.json` extending the base:
```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"]
}
```

## Linting & Formatting

**TypeScript (Biome):** `biome.json`
- Indent: 2 spaces
- Quotes: double
- Semicolons: always
- VCS-aware (uses `.gitignore`)
- Ignores: `node_modules`, `dist`, `*.d.ts`

**Python (Ruff):** `ruff.toml`
- Target: Python 3.11
- Line length: 120
- Rules: pycodestyle (E), pyflakes (F), isort (I), pyupgrade (UP), flake8-bugbear (B)

## Key Dependencies

**Dev Dependencies (root):**
- `@biomejs/biome` ^2.4.10 — TS linting/formatting
- `bun-types` ^1.3.11 — Bun runtime type definitions
- `typescript` ^6.0.2 — Type checking

**Python Build:**
- `setuptools` >=68.0 — Python package build backend

**No runtime dependencies.** All packages contain type stubs and TODO comments only.

## Build Commands

```bash
make scaffold-check  # Validate all 43 dirs have required files (README.md)
make type-check      # tsc --noEmit across all TS packages
make lint            # Biome (TS) + Ruff (Python)
make list-packages   # Enumerate all 43 with tier and language
```

## Package Inventory

| Tier | Count | Language | Location |
|------|-------|----------|----------|
| Extract | 16 | TypeScript | `packages/extract/` |
| Build | 19 | TypeScript | `packages/build/` |
| Translate (TS) | 4 | TypeScript | `packages/translate/` |
| Translate (Python) | 4 | Python | `packages/translate/` |
| **Total** | **43** | | |

## Platform Requirements

**Development:**
- Bun installed (workspace management, type resolution)
- Python 3.11+ (for translate-tier Python packages)
- Ruff (Python linting)
- No build step required — type stubs only, validated via `tsc --noEmit`

**Production:**
- Not applicable — this is a reference/design monorepo, not a deployable application

---

*Stack analysis: 2026-04-02*
