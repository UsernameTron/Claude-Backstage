# Testing Patterns

**Analysis Date:** 2026-04-02

## Test Framework

**Runner:**
- No runtime test framework is used. This is a type-stub monorepo with zero implementations.
- All validation is static analysis: type checking, linting, and scaffold completeness.

**Assertion Library:**
- Not applicable — no runtime tests exist.

**Run Commands:**
```bash
make scaffold-check   # Validate all 43 package dirs exist with README.md
make type-check       # tsc --noEmit across all 39 TS packages
make lint             # Biome (TS) + Ruff (Python)
make list-packages    # Enumerate all 43 packages with tier and priority
```

## Validation Strategy

This monorepo validates structural correctness and type safety, not runtime behavior. Every function body throws `Error` or raises `NotImplementedError`. The quality gates ensure:

1. **All packages exist** with required files (scaffold-check)
2. **All TypeScript compiles** without errors (type-check)
3. **All code passes linting** rules (lint)

## Scaffold Check (`make scaffold-check`)

**What it validates:**
- Each of the 43 declared package directories exists
- Each directory contains a `README.md`
- Reports OK/MISSING per package with final count

**Config:** `Makefile` at project root defines `ALL_PKGS` from three lists:
- `EXTRACT_PKGS` (16 packages in `packages/extract/`)
- `BUILD_PKGS` (19 packages in `packages/build/`)
- `TRANSLATE_TS_PKGS` (4 packages in `packages/translate/`)
- `TRANSLATE_PY_PKGS` (4 packages in `packages/translate/`)

**Pass criteria:** All 43 packages present. Exit code 0 on success, 1 on any missing.

**What it does NOT check:**
- Presence of `src/index.ts` or `src/{name}/__init__.py`
- Presence of `package.json` or `pyproject.toml`
- Correctness of package.json contents

## Type Check (`make type-check`)

**What it validates:**
- `npx tsc --noEmit -p {pkg}/tsconfig.json` for every TS package with a `tsconfig.json`
- Covers all 39 TypeScript packages (extract + build + translate-TS tiers)
- Cross-package type imports resolve correctly via Bun workspaces

**Config:**
- Base config: `tsconfig.base.json` at project root
- Per-package: `{package}/tsconfig.json` extending base with `rootDir: "src"`, `outDir: "dist"`
- Compiler options: `strict: true`, `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`
- Types: `bun-types`

**Pass criteria:** Zero type errors across all packages. Reports count of packages checked and failed.

**Key type relationships validated:**
- `packages/extract/auto-compact/src/index.ts` imports from `@claude-patterns/token-estimation`
- `packages/extract/dangerous-command-detection/src/index.ts` imports from `@claude-patterns/permission-system` and `@claude-patterns/path-validation`
- `packages/extract/yolo-classifier/src/index.ts` imports from `@claude-patterns/permission-system`
- `packages/extract/sandbox-config/src/index.ts` imports from `@claude-patterns/path-validation`
- `packages/build/agent-dialogue-loop/src/index.ts` imports from `@claude-patterns/streaming-tool-executor`, `@claude-patterns/state-store`, `@claude-patterns/token-estimation`
- `packages/build/skills-system/src/index.ts` imports from `@claude-patterns/claudemd-memory`
- `packages/build/multi-agent-coordinator/src/index.ts` imports from `@claude-patterns/mcp-integration`
- `packages/translate/multi-step-ivr-input-validator/src/index.ts` imports from `@claude-patterns/ivr-call-flow-validator`

## Lint (`make lint`)

**TypeScript (Biome):**
- Config: `biome.json` at project root
- Scope: `packages/extract/`, `packages/build/`, and 4 TS translate packages
- Rules: Biome defaults (formatting + linting enabled)
- Settings: 2-space indent, double quotes, semicolons always
- Ignores: `node_modules`, `dist`, `*.d.ts`

**Python (Ruff):**
- Config: `ruff.toml` at project root
- Scope: 4 Python translate packages (`consecutive-breach-tracker`, `cost-per-interaction`, `agent-skill-routing`, `workforce-scheduling-coordinator`)
- Target: Python 3.11+
- Line length: 120
- Rules: `E` (pycodestyle), `F` (pyflakes), `I` (isort), `UP` (pyupgrade), `B` (flake8-bugbear)
- Note: `E501` (line length) ignored — handled by `line-length` setting

## Test File Organization

**Location:**
- No test files exist anywhere in the codebase
- No `__tests__/`, `tests/`, `*.test.ts`, `*.spec.ts`, or `test_*.py` files

**When to add tests:**
- Tests become relevant only when stub implementations are replaced with real code
- When implementing a package, co-locate tests as `src/{name}.test.ts` or `tests/test_{name}.py`

## Coverage

**Requirements:** Not applicable — no runtime code exists to cover.

**Future guidance:** When implementations are added, configure:
- TypeScript: Bun's built-in test runner (`bun test`) or Vitest
- Python: pytest with `pytest-cov`

## Quality Gates Summary

| Gate | Command | What Passes | Exit Code |
|------|---------|-------------|-----------|
| Scaffold | `make scaffold-check` | All 43 dirs exist with README.md | 0 = pass, 1 = fail |
| Types | `make type-check` | All 39 TS packages compile with `--noEmit` | 0 = pass, 1 = fail |
| Lint | `make lint` | Biome (TS) + Ruff (Python) pass | 0 = pass (currently uses `\|\| true`) |

**Note on lint gate:** The `make lint` target currently appends `|| true` to both Biome and Ruff commands, meaning lint failures do not cause the make target to fail. This is a soft gate — lint issues are reported but do not block.

## Adding a New Package

When scaffolding a new package, ensure these validation targets pass:

1. Add package name to the appropriate list in `Makefile` (`EXTRACT_PKGS`, `BUILD_PKGS`, `TRANSLATE_TS_PKGS`, or `TRANSLATE_PY_PKGS`)
2. Create directory at `packages/{tier}/{name}/`
3. Add `README.md` (required for scaffold-check)
4. Add `package.json` with `@claude-patterns/{name}` scope (TS) or `pyproject.toml` (Python)
5. Add `tsconfig.json` extending `../../../tsconfig.base.json` (TS only)
6. Add `src/index.ts` or `src/{name_underscored}/__init__.py`
7. If TS and in translate tier, add the package path to the `workspaces` array in root `package.json`
8. Run `make scaffold-check && make type-check && make lint` to validate

## CI/CD

**Pipeline:** No CI/CD pipeline is configured. All validation is manual via `make` targets.

**Pre-commit hooks:** None configured.

**Recommended validation sequence:**
```bash
make scaffold-check && make type-check && make lint
```

---

*Testing analysis: 2026-04-02*
