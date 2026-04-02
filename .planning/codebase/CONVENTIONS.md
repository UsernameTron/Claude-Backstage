# Coding Conventions

**Analysis Date:** 2026-04-02

## Naming Patterns

**Files:**
- TypeScript entry points: always `src/index.ts` (one file per package, no exceptions)
- Python entry points: `src/{package_name}/__init__.py` (underscored version of package name)
- Config files: `package.json` + `tsconfig.json` (TS) or `pyproject.toml` (Python)
- Every package has a `README.md` at root

**Packages:**
- Scope: `@claude-patterns/{name}` for all TS packages
- Python: `claude-patterns-{name}` in pyproject.toml (hyphenated), `{name_underscored}` for Python module directory
- Package names are kebab-case: `permission-system`, `cost-tracker`, `agent-dialogue-loop`
- Tier directory (`extract/`, `build/`, `translate/`) is invisible to import paths

**Functions:**
- camelCase for all TypeScript functions: `hasPermissionsToUseTool()`, `getSystemPrompt()`, `formatTotalCost()`
- snake_case for all Python functions: `record_breach()`, `add_interaction()`, `get_action()`
- Getter functions prefixed with `get`: `getStoredSessionCosts()`, `getAllowRules()`, `getSystemContext()`
- Boolean checkers prefixed with `is`/`should`: `isDangerousBashPermission()`, `shouldFallback()`, `shouldUseGlobalCacheScope()`

**Types/Interfaces:**
- PascalCase for all types, interfaces, enums, and classes
- Interfaces describe data shapes: `PermissionRule`, `SessionCostEntry`, `SystemContext`
- Type aliases for unions: `PermissionMode`, `DenialAction`, `InjectionPosition`
- Enum values in Python use UPPER_CASE: `BreachAction.WIDEN_RINGS`, `Channel.VOICE`

**Constants:**
- UPPER_SNAKE_CASE for TypeScript constants: `PERMISSION_RULE_SOURCES`, `COMPACT_THRESHOLDS`, `DENIAL_LIMITS`
- Python constants as module-level dicts: `BREACH_THRESHOLDS = {"max_consecutive": 3, ...}`
- Use `as const` for TypeScript constant tuples and objects

**Variables:**
- camelCase in TypeScript: `toolName`, `toolInput`, `maxConsecutive`
- snake_case in Python: `queue_id`, `total_cost_usd`, `avg_duration_seconds`

## Code Style

**Formatting:**
- Biome v2.x for TypeScript (`biome.json` at project root)
- Indent: 2 spaces
- Quotes: double quotes
- Semicolons: always
- Ruff for Python (`ruff.toml` at project root)
- Python line length: 120 characters

**Linting:**
- Biome: default rules, ignores `node_modules`, `dist`, `*.d.ts`
- Ruff selects: `E` (pycodestyle), `F` (pyflakes), `I` (isort), `UP` (pyupgrade), `B` (flake8-bugbear)
- Config files: `biome.json`, `ruff.toml`

## Import Organization

**TypeScript cross-package imports:**
- Use `import type { ... } from "@claude-patterns/{name}"` for type-only imports
- Use regular `import { ... }` for value imports (constants, re-exports)
- Example from `packages/extract/auto-compact/src/index.ts`:
  ```typescript
  import type { Message, TokenUsage } from "@claude-patterns/token-estimation";
  ```
- Example from `packages/extract/dangerous-command-detection/src/index.ts`:
  ```typescript
  import type { PermissionMode, PermissionRule } from "@claude-patterns/permission-system";
  import { DANGEROUS_BASH_PATTERNS, CROSS_PLATFORM_CODE_EXEC } from "@claude-patterns/permission-system";
  ```

**Python imports:**
- Use `from __future__ import annotations` as first import in every file
- Standard library imports: `dataclasses`, `enum`, `typing`, `datetime`
- No cross-package imports in Python packages (each is standalone)

**Path Aliases:**
- Package scope `@claude-patterns/` resolves via Bun workspaces
- No `paths` aliases in tsconfig — all references use `@claude-patterns/` scope

## Module File Header

**TypeScript packages use a JSDoc block at file top:**
```typescript
/**
 * @claude-patterns/{package-name}
 *
 * {One-line description of what the package does.}
 * Source: {original source path} ({file count} files, {LOC count} LOC)
 * KB Reference: Section {N} — {Section Name}
 */
```

**Alternative comment-style header (used in some build-tier packages):**
```typescript
// {package-name} — {description}
// Source: {source path} ({LOC} LOC)
// KB: Section {N}
```

**Python packages use a module docstring:**
```python
"""Short description translated from Claude Code {pattern name} (Pattern N).

{Longer description of what it does and how it maps to the source pattern.}

Source pattern: {source file} ({LOC} LOC)
KB reference: Section {N} — {Section Name}, Section {N}
"""
```

## Stub Implementation Pattern

**All function bodies follow the same pattern -- throw/raise with a TODO comment:**

TypeScript:
```typescript
export function myFunction(): ReturnType {
  // TODO: extract from {source-path}
  throw new Error("TODO: extract from {source-path}");
}
```

Python:
```python
def my_function(self) -> ReturnType:
    """Docstring describing the function."""
    # TODO: implement {description}
    raise NotImplementedError("TODO: translate from {source} pattern")
```

**Class constructors initialize state then throw:**
```typescript
constructor() {
  this.state = { consecutive: 0, total: 0 };
}
```

**Python classes use `@dataclass` for data containers and regular classes for behavior:**
```python
@dataclass
class BreachState:
    consecutive: int = 0
    total: int = 0
    queue_id: str = ""
```

## Error Handling

**Patterns:**
- All stub functions throw `Error` (TS) or raise `NotImplementedError` (Python)
- Error messages always include the source reference: `"TODO: extract from {path}"`
- No silent stubs — every function has an explicit throw/raise

## Comments

**When to Comment:**
- Every exported function has a JSDoc comment (TS) or docstring (Python)
- Comments explain WHY, not WHAT — especially architectural reasoning
- Inline `// TODO:` comments mark implementation targets
- KB section references connect stubs to source documentation

**JSDoc/TSDoc:**
- Use `/** ... */` for all exported members
- Include `@param` descriptions only when parameter purpose is non-obvious
- Type information lives in the signature, not in JSDoc tags

## Function Design

**Parameters:**
- Use underscore prefix for unused parameters in stubs: `_config`, `_params`, `_enabledTools`
- TypeScript uses `Record<string, unknown>` for generic object parameters
- Python uses `Optional[T]` for nullable parameters with `None` default

**Return Values:**
- Functions return specific types, never `any`
- Use `Promise<T>` for async operations
- Use `AsyncGenerator<Event, Result>` for streaming patterns (see `packages/build/agent-dialogue-loop/src/index.ts`)

## Module Design

**Exports:**
- Every package exports from a single `src/index.ts` or `src/{name}/__init__.py`
- No barrel files — one entry point per package
- Export types, interfaces, constants, functions, and classes directly
- Re-export types from dependencies when downstream packages need them:
  ```typescript
  export type { IVRCallFlow, IVRNode } from "@claude-patterns/ivr-call-flow-validator";
  ```

**Package Structure (TS):**
```
{package-name}/
  package.json      # @claude-patterns/{name}, version 0.0.0, private: true
  tsconfig.json     # extends ../../../tsconfig.base.json
  README.md         # Package documentation
  src/
    index.ts        # All exports
```

**Package Structure (Python):**
```
{package-name}/
  pyproject.toml    # claude-patterns-{name}, version 0.0.0
  README.md         # Package documentation
  src/
    {name_underscored}/
      __init__.py   # All exports
```

## README Conventions

**Extract tier README format:**
```markdown
# @claude-patterns/{name}

{One-paragraph description.}

## Source Reference
- **Path:** `{source path}` ({N} files, {N} LOC)
- **KB Section:** {N} — {Name}
- **Tier:** Extract ({priority})

## Key Exports
### Types
### Functions
### Constants

## Architecture
## Dependencies
## Downstream Dependents
```

**Build tier README format:**
```markdown
# @claude-patterns/{name}

**Tier:** Build | **Priority:** {P0/P1} | **KB:** Section {N}

{One-line description.}
```

**Translate tier README format:**
```markdown
# {name}

{Description of what it translates and from which pattern.}

## Tier
```

## Package Configuration

**TypeScript package.json (all packages identical structure):**
```json
{
  "name": "@claude-patterns/{name}",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

**TypeScript tsconfig.json (all packages identical structure):**
```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"]
}
```

**Python pyproject.toml:**
```toml
[build-system]
requires = ["setuptools>=68.0"]
build-backend = "setuptools.build_meta"

[project]
name = "claude-patterns-{name}"
version = "0.0.0"
description = "{description}"
requires-python = ">=3.11"

[tool.setuptools.packages.find]
where = ["src"]
```

---

*Convention analysis: 2026-04-02*
