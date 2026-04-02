# DevOps Handoff — claude-code-patterns

## Project Summary

Type-stub monorepo organizing 31 Claude Code subsystems as independently extractable packages. Build reference only — no runtime behavior, no deployable artifacts.

## Environment Requirements

- **Runtime**: Bun >= 1.0 (TypeScript packages), Python >= 3.11 (translate tier)
- **OS**: macOS, Linux
- **No CI/CD required** — single-developer build reference

## How to Run

```bash
# Install TypeScript dependencies
bun install

# Validate scaffold
make scaffold-check

# Type-check all TS packages
make type-check

# Install Python packages (translate tier)
pip install -e packages/translate/consecutive-breach-tracker/
pip install -e packages/translate/cost-per-interaction/
pip install -e packages/translate/agent-skill-routing/
```

## Configuration Reference

- `package.json` — Bun workspace root, defines workspace globs
- `tsconfig.base.json` — Shared TypeScript config (strict, ES2022, Bun types)
- Per-package `tsconfig.json` — Extends base config
- Per-package `pyproject.toml` — Python package metadata (translate tier)

## Security Notes

- No secrets, API keys, or credentials in this repository
- No runtime code — type stubs only
- Source file paths reference Claude Code internals but contain no proprietary code

## Deployment Maturity

**Not applicable.** This is a development reference library, not a deployable application.

## Known Tech Debt

- All packages contain type stubs with TODO comments — zero implementations
- Python packages have no test suite (stubs have no behavior to test)
- No CI/CD pipeline (single-developer project)
