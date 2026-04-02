# Architecture Patterns

**Domain:** Type-stub monorepo / pattern library (31 packages, 3 tiers, mixed TS/Python)
**Researched:** 2026-04-01
**Overall confidence:** HIGH

## Recommended Architecture

**Tiered workspace monorepo with flat namespace imports and stub-only packages.**

The Plan-Outline.MD already selects Option B (tiered directories). This research validates that choice, identifies the specific patterns to implement, and surfaces remaining decisions.

### Directory Structure

```
claude-code-patterns/
├── package.json                    # Bun workspace root
├── tsconfig.base.json              # Shared strict config
├── biome.json                      # Biome linter/formatter
├── Makefile                        # Polyglot validation targets
├── .python-version                 # Python version pin
├── packages/
│   ├── extract/                    # 16 TS — copy, adapt, ship
│   │   ├── permission-system/
│   │   │   ├── package.json        # @claude-patterns/permission-system
│   │   │   ├── tsconfig.json       # extends ../../tsconfig.base.json
│   │   │   ├── src/
│   │   │   │   └── index.ts        # Type stubs + TODO comments only
│   │   │   └── README.md           # Source refs, KB section, deps
│   │   ├── denial-tracking/
│   │   └── ... (14 more)
│   ├── build/                      # 10 TS — design reference
│   │   ├── prompt-system/
│   │   └── ... (9 more)
│   └── translate/                  # 5 mixed (3 Python, 2 TS)
│       ├── consecutive-breach-tracker/  # Python
│       │   ├── pyproject.toml
│       │   └── src/consecutive_breach_tracker/__init__.py
│       ├── prompt-cache-optimizer/      # TypeScript
│       └── ... (3 more)
├── decisions/                      # ADRs (MADR format)
│   ├── 001-tiered-monorepo.md
│   └── 002-stub-only-packages.md
└── docs/
    ├── patterns/                   # 14 design patterns from KB
    └── recipes/                    # 6 implementation recipes
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Root config | Workspace globs, shared tsconfig, linter config | All packages |
| extract/ packages (16) | Direct extraction targets from CC source | Other extract/ packages via `@claude-patterns/` |
| build/ packages (10) | Architectural reference patterns | extract/ packages as dependencies |
| translate/ packages (5) | Cross-language pattern adaptation | Independent (Python has no TS deps) |
| Makefile | Unified validation entry point | tsc, biome, ruff, scaffold-check script |
| decisions/ | ADRs for structural choices | Referenced by CLAUDE.md |
| docs/ | Pattern/recipe reference content | Read by humans, not imported |

### Data Flow

No runtime data flow. Dependencies flow strictly upward:

```
Translate (consumers — conceptual deps only, no code imports)
    ↑ pattern reference
Build (design references — may import from Extract)
    ↑ workspace:* imports
Extract (foundations — standalone or extract-to-extract deps)
```

The developer workflow flow is:
1. Read package README to understand subsystem
2. Read type stubs to understand interfaces
3. Follow source path references to Claude Code source
4. Copy/adapt patterns into their own project

## Patterns to Follow

### Pattern 1: Flat Namespace with Physical Tiers

**What:** All 31 packages share the `@claude-patterns/` scope. Tier directories (`extract/`, `build/`, `translate/`) are physical groupings invisible to consumers.

**When:** Always. Foundational organizational decision.

**Why:** Imports stay clean (`@claude-patterns/permission-system`), consumers never need to know which tier a package lives in, and packages can move between tiers without breaking downstream imports. This is well-established in monorepo ecosystems (Nx, Turborepo, DefinitelyTyped).

**Confidence:** HIGH

**Example:**

```json
// packages/extract/permission-system/package.json
{
  "name": "@claude-patterns/permission-system",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {}
}
```

```json
// packages/extract/dangerous-command-detection/package.json
{
  "name": "@claude-patterns/dangerous-command-detection",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "@claude-patterns/permission-system": "workspace:*",
    "@claude-patterns/path-validation": "workspace:*"
  }
}
```

### Pattern 2: Stub-Only Package Convention

**What:** Every TypeScript package exports type signatures, interfaces, and constants with stub implementations. Function bodies contain `throw new Error("stub")`. No real logic.

**When:** All packages. The point is the API surface, not runtime behavior.

**Why:** This is a reference library, not a runtime dependency. DefinitelyTyped validates the type-only pattern at massive scale (8,000+ packages). Our variant uses `.ts` files with stub bodies rather than `.d.ts` declarations because:
1. TODO comments serve as implementation guides
2. Function signatures with parameter names are more readable than declarations
3. Constants with actual values (threshold numbers from Claude Code) are part of the deliverable

**Confidence:** HIGH

**Example:**

```typescript
// packages/extract/denial-tracking/src/index.ts

/** Tracks consecutive denials and triggers adaptive fallback */
export interface DenialTracker {
  recordDenial(toolName: string): void;
  shouldFallback(toolName: string): boolean;
  resetDenials(toolName: string): void;
}

/** Maximum consecutive denials before fallback triggers */
export const MAX_CONSECUTIVE_DENIALS = 3;

/** Total denials across all tools before forcing action */
export const MAX_TOTAL_DENIALS = 20;

export function createDenialTracker(): DenialTracker {
  // TODO: Implement from denialTracking.ts (45 LOC)
  // Source: utils/permissions/denialTracking.ts
  throw new Error("stub");
}
```

### Pattern 3: Shared tsconfig with Per-Package Extends

**What:** Root `tsconfig.base.json` with strict mode. Each package extends it with its own `rootDir` and `paths`.

**When:** Every TS package.

**Why:** Centralizes compiler strictness while allowing per-package path resolution. Packages only see types from their declared dependencies through `paths` mappings.

**Confidence:** HIGH

**Example:**

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  }
}

// packages/extract/permission-system/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@claude-patterns/*": [
        "../../extract/*/src",
        "../../build/*/src",
        "../../translate/*/src"
      ]
    }
  },
  "include": ["src"]
}
```

### Pattern 4: Bun Workspace Glob with Python Exclusion

**What:** Root `package.json` uses glob patterns for TS packages, explicitly lists TS translate packages, excludes Python packages entirely.

**When:** Root workspace configuration.

**Why:** Bun cannot manage Python dependencies. Python packages use `pyproject.toml` and `pip install -e`. Bun docs confirm glob support with negative patterns.

**Confidence:** HIGH

**Example:**

```json
{
  "name": "claude-code-patterns",
  "private": true,
  "workspaces": [
    "packages/extract/*",
    "packages/build/*",
    "packages/translate/ivr-call-flow-validator",
    "packages/translate/prompt-cache-optimizer"
  ]
}
```

Note: Only 28 TS packages in workspaces. 3 Python packages managed independently.

### Pattern 5: Makefile for Polyglot Validation

**What:** Single Makefile with targets for each language and cross-cutting concerns.

**When:** Always. The unified validation interface.

**Confidence:** HIGH

**Example:**

```makefile
.PHONY: all type-check lint scaffold-check python-check

all: scaffold-check type-check lint python-check

type-check:
	bunx tsc --noEmit -p packages/extract/permission-system/tsconfig.json
	# ... all 28 TS packages

lint:
	bunx biome check .
	cd packages/translate && ruff check .

scaffold-check:
	@./scripts/scaffold-check.sh

python-check:
	cd packages/translate/consecutive-breach-tracker && pip install -e . --dry-run
	cd packages/translate/cost-per-interaction && pip install -e . --dry-run
	cd packages/translate/agent-skill-routing && pip install -e . --dry-run

list-packages:
	@echo "=== Extract (16 TS) ===" && ls packages/extract/
	@echo "=== Build (10 TS) ===" && ls packages/build/
	@echo "=== Translate (5 mixed) ===" && ls packages/translate/
```

### Pattern 6: README-as-Manifest for Each Package

**What:** Every package README follows a strict template serving as both documentation and metadata.

**When:** Every package, no exceptions.

**Why:** In a 31-package reference library, discoverability is the primary UX challenge. A human scanning the repo needs to find the right package in seconds.

**Confidence:** HIGH

**Template:**

```markdown
# @claude-patterns/{name}

> {One-sentence description}

| Attribute | Value |
|-----------|-------|
| **Tier** | Extract / Build / Translate |
| **Priority** | P0 / P1 / P2 / P3 |
| **Source LOC** | {N} |
| **Source Files** | `{path1}`, `{path2}` |
| **KB Section** | {section reference} |
| **Dependencies** | `@claude-patterns/{dep1}`, ... or "none" |

## When to Use

{2-3 sentences from KB v2.1 describing the pattern and applicability}

## Key Exports

- `{TypeName}` -- {description}
- `{functionName}()` -- {description}

## Source References

- `claude-code/src/{path}` -- {description}
```

### Pattern 7: ADR Convention for Structural Decisions

**What:** Architecture Decision Records in `decisions/` using MADR format. Numbered sequentially. Immutable once accepted.

**When:** Any decision affecting monorepo structure, package boundaries, or cross-cutting conventions.

**Why:** This monorepo has unusual constraints (stub-only, mixed language, tiered). Decisions need to be discoverable by future sessions. MADR is the most widely adopted ADR template.

**Confidence:** HIGH

**Decisions to record:**

| ADR | Decision | Status |
|-----|----------|--------|
| 001 | Tiered monorepo over flat or domain-grouped | Accepted |
| 002 | Stub-only packages (`.ts` with TODO, not `.d.ts`) | Accepted |
| 003 | Flat `@claude-patterns/*` namespace across tiers | Accepted |
| 004 | Bun workspaces for TS, pip for Python (no Nx/Turborepo) | Accepted |
| 005 | README-as-manifest template for discoverability | Proposed |

**ADR Template:**

```markdown
# ADR-{NNN}: {Title}

**Status:** Proposed | Accepted | Superseded by ADR-{NNN}
**Date:** {YYYY-MM-DD}
**Context:** {What situation prompted this decision?}

## Decision

{What was decided and why.}

## Consequences

**Positive:**
- {benefit}

**Negative:**
- {tradeoff}

## Alternatives Considered

### {Alternative name}
{Description and why rejected}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: TypeScript Project References for Stub Packages

**What:** Using `references` and `composite` in tsconfig for inter-package type checking.
**Why bad:** Requires maintaining a `references` array in every tsconfig. With no build step and no runtime output, the incremental compilation benefit is zero. Pure maintenance burden for 28 packages.
**Instead:** Use `tsconfig extends` with `paths` mapping. Bun's workspace symlink resolution handles the rest.

### Anti-Pattern 2: Python Packages in Bun Workspaces

**What:** Adding Python packages to the `workspaces` array.
**Why bad:** Bun cannot manage Python dependencies. Creates confusing resolution errors.
**Instead:** Manage Python packages entirely via pip/pyproject.toml. Makefile handles their validation.

### Anti-Pattern 3: Single tsconfig with Paths for All Packages

**What:** One root tsconfig.json with all 28 packages mapped in `paths`.
**Why bad:** Every package sees every other package's types regardless of actual dependencies. Hides missing dependency declarations.
**Instead:** Per-package tsconfig with explicit path mappings matching declared dependencies.

### Anti-Pattern 4: Implementation Creep in Stubs

**What:** Adding "just a little" implementation logic to make stubs more useful.
**Why bad:** Blurs the line between reference and runtime code. Consumers won't know if a function actually works or half-works.
**Instead:** `throw new Error("stub")` for all function bodies. Export real constants (threshold values, pattern arrays) because those ARE the deliverable.

### Anti-Pattern 5: Deep Import Paths

**What:** Importing from `@claude-patterns/permission-system/src/rules/evaluation` instead of the package entry point.
**Why bad:** Couples consumers to internal structure. Makes reorganization a breaking change.
**Instead:** Everything exports from `src/index.ts`. Consumers import only from the package root.

### Anti-Pattern 6: Cross-Tier Upward Dependencies

**What:** An Extract package importing from a Build package.
**Why bad:** Extract packages are independently extractable. Depending on Build-tier packages (design references) creates confusing dependency direction.
**Instead:** Dependencies flow: Extract (standalone) -> Build (may depend on Extract) -> Translate (conceptual only).

### Anti-Pattern 7: Monorepo Tool Overkill

**What:** Adding Nx, Turborepo, or Lerna for task orchestration.
**Why bad:** Zero runtime code, zero build outputs, zero test suites. The overhead exceeds the benefit.
**Instead:** Bun workspaces for dependency resolution + Makefile for validation. That's it.

### Anti-Pattern 8: Using `--filter '*'` for Scoped Packages

**What:** Running `bun --filter '*' type-check` expecting it to match `@claude-patterns/` packages.
**Why bad:** Known Bun issue -- wildcard `*` does not match scoped packages.
**Instead:** Use `bun --filter '@claude-patterns/*'` or path-based filtering `bun --filter './packages/extract/*'`.

## Scalability Considerations

Not a primary concern. This is a static reference library bounded by the Claude Code source tree and KB v2.1.

| Concern | At 31 packages (now) | At 50+ packages (unlikely) |
|---------|----------------------|---------------------------|
| Dependency resolution | Bun resolves instantly | Still fine |
| Type checking | `tsc --noEmit` ~2-5s | Project references could enable incremental checking |
| Discoverability | README-as-manifest + tier dirs | Would need generated index |
| Context injection | ~80 tokens for 3 tier lines | Scales linearly |

## Key Architectural Decisions Validated

The Plan-Outline.MD pre-decides the major questions. This research validates each:

1. **Tiered organization is correct.** Maps 1:1 to KB v2.1 taxonomy, reduces CLAUDE.md context cost, tells consumers HOW to use each package.

2. **Flat namespace is correct.** `@claude-patterns/*` hides tier directories from imports. Packages can be reclassified without breaking consumers.

3. **Bun over npm/pnpm is correct.** Fastest install, native workspace support, Bun types for TypeScript. No publishing workflow needed.

4. **No monorepo orchestrator is correct.** Zero runtime code means zero build graph. Makefile is sufficient.

5. **`.ts` stubs over `.d.ts` declarations is correct.** TODO comments and constant values are part of the deliverable. Pure declarations would strip that.

## Open Questions

1. **`packages/` wrapper dir or flat tiers?** The Plan-Outline.MD shows `packages/extract/` but the existing ARCHITECTURE.md uses `extract/` at root. Recommendation: use `packages/` wrapper for cleanliness and to match workspace convention. The `extends` path in tsconfig adjusts accordingly (`../../tsconfig.base.json` from `packages/extract/foo/` or `../../tsconfig.base.json` from `extract/foo/`).

2. **Version strategy:** Use `0.0.0` for all stubs. Bump to `0.1.0` when a package gets real implementation. The version number signals readiness.

3. **Python package isolation:** The 3 Python translate packages share no code. Keep them fully independent with separate `pyproject.toml` files. They are conceptual translations, not a Python library.

## Sources

- [Bun Workspaces documentation](https://bun.com/docs/pm/workspaces) -- workspace protocol, glob patterns, cross-package resolution (HIGH confidence)
- [DefinitelyTyped repository](https://github.com/DefinitelyTyped/DefinitelyTyped) -- type-stub organization at scale (HIGH confidence)
- [DefinitelyTyped monorepo migration](https://jakebailey.dev/posts/pnpm-dt-3/) -- lessons from DT's monorepo transition (MEDIUM confidence)
- [TypeScript Declaration Files docs](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) -- `.d.ts` patterns and module resolution (HIGH confidence)
- [ADR best practices (AWS)](https://aws.amazon.com/blogs/architecture/master-architecture-decision-records-adrs-best-practices-for-effective-decision-making/) -- ADR templates and process (HIGH confidence)
- [ADR templates](https://adr.github.io/adr-templates/) -- MADR and Nygardian formats (HIGH confidence)
- [Martin Fowler on ADRs](https://martinfowler.com/bliki/ArchitectureDecisionRecord.html) -- foundational reference (HIGH confidence)
- [Monorepo tools comparison](https://monorepo.tools/) -- workspace tool landscape (MEDIUM confidence)
- [Nx managing TS packages in monorepos](https://nx.dev/blog/managing-ts-packages-in-monorepos) -- project references vs paths (MEDIUM confidence)
- [Bun scoped filter issue](https://github.com/oven-sh/bun/issues/12300) -- wildcard filter bug for scoped packages (HIGH confidence)
