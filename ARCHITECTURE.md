# Package Organization Architecture Decision

## Status

Accepted

## Context

31 Claude Code subsystems extracted from source (~1,900 files, 512K LOC) and Knowledge Base v2.1 need organizing into a buildable monorepo. Packages are type stubs only — no implementations. Three tiers reflect HOW each package is used:

- **Extract** — Copy from source, adapt imports, ship. Direct extraction targets.
- **Build** — Use source as design reference. Architectural patterns for new builds.
- **Translate** — Apply patterns to different domains (contact center, AI applications).

The organization must support Bun workspaces (TypeScript), pip (Python), and Claude Code context injection via CLAUDE.md.

## Options Evaluated

### Option A — Flat

All 31 packages in `packages/` directly.

```
packages/
  permission-system/
  denial-tracking/
  cost-tracker/
  ... (31 directories)
```

### Option B — Tiered (Selected)

Packages grouped by usage tier under `packages/`.

```
packages/
  extract/    (16 TS packages)
  build/      (10 TS packages)
  translate/  (2 TS + 3 Python packages)
```

### Option C — Domain

Packages grouped by functional domain.

```
packages/
  permissions/
  streaming/
  ui/
  ...
```

## Decision Matrix

| Criteria | Option A (Flat) | Option B (Tiered) | Option C (Domain) |
|----------|-----------------|--------------------|--------------------|
| **Discoverability** | Poor — 31 dirs to scan | Excellent — tier = usage intent | Medium — domain boundaries unclear |
| **Package independence** | High | High — tier invisible to imports | Medium — cross-domain deps murky |
| **Dependency management** | Simple | Simple — workspace refs ignore tier | Complex — cross-domain refs |
| **Mixed language support** | Awkward — Python mixed with TS | Clean — Python isolated in translate/ | Unclear placement |
| **Context injection cost** | ~150 tokens (long flat list) | ~80 tokens (3 tiers, not 31 names) | ~120 tokens |
| **KB v2.1 alignment** | None | 1:1 mapping | Partial |

## Decision

**Option B — Tiered `packages/{extract,build,translate}/`**

Wins on:

1. **Discoverability** — Tier directory name tells you HOW to use the package before you open it.
2. **KB v2.1 alignment** — The three tiers map 1:1 to the Build Inventory's tier classification.
3. **Context injection efficiency** — ~80 tokens to describe the full structure (3 tiers with counts) versus ~150 tokens for a flat list of 31 names.
4. **Mixed language isolation** — Python packages live exclusively in `translate/`, keeping Bun workspace configuration clean.

The `@claude-patterns/{name}` scope hides the tier directory from import paths. Packages reference each other by name without knowing their tier:

```typescript
import { PermissionRule } from "@claude-patterns/permission-system";
// Works regardless of whether permission-system is in extract/ or build/
```

## Consequences

- Workspace globs in `package.json` list tiers explicitly: `packages/extract/*`, `packages/build/*`, `packages/translate/prompt-cache-optimizer`
- Python packages (3 in translate/) are excluded from Bun workspaces — managed via `pip install -e` instead
- `translate/` contains both TypeScript and Python packages — TS packages listed explicitly in workspace globs
- Tier determines HOW to use the package, not WHAT it does — a package's domain is captured in its README, not its directory
- Adding a new package requires choosing the correct tier and adding it to the appropriate workspace glob if TypeScript

## References

- Knowledge Base v2.1 — Build Inventory (31 systems, 3 tiers)
- `.planning/PROJECT.md` — Project context and constraints
- `dependency-graph.md` — Cross-package dependency chains
