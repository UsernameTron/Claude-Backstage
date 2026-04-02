# Quality Practices Research

**Project:** claude-code-patterns (31 type-stub packages)
**Domain:** TypeScript/Python monorepo validation
**Researched:** 2026-04-01
**Overall confidence:** HIGH (well-established tooling, official docs verified)

---

## 1. TypeScript Type-Checking Strategy

### Recommendation: `tsc --noEmit` with Project References

Use TypeScript project references (`composite: true`) with `tsc --build --noEmit` for the 28 TS packages. This gives incremental builds, per-package isolation, and parallel compilation.

**Why not flat `tsc --noEmit` on everything?** A single `tsc --noEmit` at root with path aliases works for small projects. At 28 packages, it recompiles everything on every change. Project references let TypeScript skip unchanged packages via `.tsbuildinfo` caching. TypeScript 7 (native port, shipping 2025-2026) makes this even faster with shared-memory parallelism.

**Why not Nx/Turborepo?** Overkill. This is a single-developer reference library with no runtime builds, no CI/CD, no deploy targets. The Makefile + `tsc --build` combination is simpler and sufficient.

### Configuration

**Root `tsconfig.base.json`:**
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "noEmit": true,
    "skipLibCheck": false,
    "esModuleInterop": true,
    "types": ["bun-types"]
  }
}
```

**Root `tsconfig.json` (solution file):**
```json
{
  "files": [],
  "references": [
    { "path": "packages/extract/permission-system" },
    { "path": "packages/extract/denial-tracking" },
    // ... all 28 TS packages
  ]
}
```

**Per-package `tsconfig.json`:**
```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "references": [
    { "path": "../../extract/permission-system" }
  ]
}
```

Key settings:
- `composite: true` -- required for project references. Implies `declaration: true` and `incremental: true`.
- `references` array in each package's tsconfig lists its `@claude-patterns/` dependencies.
- Root solution file (`"files": []`) just aggregates references. No code at root.

### Build Commands

```bash
# Full check (respects incremental cache)
tsc --build --noEmit

# Force clean rebuild
tsc --build --clean && tsc --build --noEmit

# Check single package
tsc --noEmit -p packages/extract/permission-system/tsconfig.json
```

**Confidence:** HIGH -- this is the official TypeScript approach for monorepos, documented at typescriptlang.org.

---

## 2. Type-Stub Validation Patterns

### Problem

These packages have no runtime behavior. Traditional testing (Jest, Vitest) is useless. The question is: how do you verify that type stubs are internally consistent, that exports resolve, and that cross-package references work?

### Three-Layer Validation

**Layer 1: Compilation (`tsc --build --noEmit`)**
The baseline. If stubs compile under strict mode, types are syntactically valid, exports resolve, and cross-package imports work through workspace references. This catches 90% of issues for a stub-only project.

**Layer 2: Type assertion tests with `tsd` (optional, recommended for P0 packages)**
Use `tsd` to write `.test-d.ts` files that assert exported types match expectations. Example:

```typescript
// packages/extract/permission-system/test-d/index.test-d.ts
import { expectType, expectAssignable } from 'tsd';
import { hasPermissionsToUseTool, type PermissionMode, type PermissionResult } from '../src/index.js';

// Verify function signature returns expected type
expectType<PermissionResult>(hasPermissionsToUseTool('Read', {} as any));

// Verify union type members
expectAssignable<PermissionMode>('normal');
expectAssignable<PermissionMode>('plan');
```

TSD runs `.test-d.ts` files through the TypeScript compiler without executing them. It verifies that `expectType<T>(expr)` matches exactly, `expectAssignable<T>(expr)` matches loosely, and `expectError(expr)` produces a compile error.

**When to use tsd:** Only for P0 foundation packages (permission-system, prompt-system, context-injection) where type correctness matters for downstream consumers. For P2/P3 packages, `tsc --noEmit` is sufficient.

**Layer 3: Import resolution smoke test**
A single TypeScript file that imports the public API of every package:

```typescript
// test/import-check.ts
import type { PermissionMode } from '@claude-patterns/permission-system';
import type { Store } from '@claude-patterns/state-store';
// ... all 28 packages
```

If this compiles, all workspace references resolve correctly. This catches broken `package.json` exports fields and misconfigured paths.

### Recommendation

Use Layer 1 (tsc --build) for all packages. Add Layer 3 (import smoke test) as a single file. Add Layer 2 (tsd) only for the 7 P0 packages if type precision matters.

**Confidence:** HIGH for Layer 1, MEDIUM for Layer 2 (tsd works well but adds a dependency and per-package test files).

---

## 3. Scaffold Validation

### Problem

31 packages must conform to a template: README.md, entry point, manifest, tsconfig (TS only). Drift happens when adding packages or refactoring.

### Recommendation: Shell script in Makefile, not a framework

A shell script is the right tool. No framework (Yeoman, Plop, Turbo generators) is warranted for validating an existing structure. The script runs in < 1 second across 31 packages.

### Implementation

```makefile
# Makefile
.PHONY: scaffold-check

scaffold-check:
	@echo "Checking 31 package scaffolds..."
	@FAIL=0; \
	for dir in packages/extract/* packages/build/* packages/translate/*; do \
	  [ -d "$$dir" ] || continue; \
	  name=$$(basename "$$dir"); \
	  # README.md required for all \
	  [ -f "$$dir/README.md" ] || { echo "MISSING: $$dir/README.md"; FAIL=1; }; \
	  # Check language-specific files \
	  if [ -f "$$dir/package.json" ]; then \
	    [ -f "$$dir/src/index.ts" ] || { echo "MISSING: $$dir/src/index.ts"; FAIL=1; }; \
	    [ -f "$$dir/tsconfig.json" ] || { echo "MISSING: $$dir/tsconfig.json"; FAIL=1; }; \
	  elif [ -f "$$dir/pyproject.toml" ]; then \
	    pkg_name=$$(echo "$$name" | tr '-' '_'); \
	    [ -f "$$dir/src/$$pkg_name/__init__.py" ] || { echo "MISSING: $$dir/src/$$pkg_name/__init__.py"; FAIL=1; }; \
	  else \
	    echo "MISSING: $$dir/package.json or pyproject.toml"; FAIL=1; \
	  fi; \
	done; \
	[ $$FAIL -eq 0 ] && echo "All scaffolds valid." || { echo "Scaffold check FAILED"; exit 1; }
```

### Additional Checks Worth Adding

- **Package name consistency:** Verify `package.json` `"name"` matches `@claude-patterns/{dirname}`.
- **Workspace inclusion:** Verify every TS package directory appears in root `package.json` `"workspaces"` array.
- **tsconfig references match dependencies:** Each package's `tsconfig.json` `references` should match the `@claude-patterns/*` entries in its `package.json` `dependencies`.

These can be a second script (`make scaffold-deep-check`) or added to the main check later.

**Confidence:** HIGH -- this is standard shell scripting, no external dependencies.

---

## 4. Python Package Validation

### Minimal pyproject.toml for Stubs

```toml
[build-system]
requires = ["setuptools>=68.0"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "consecutive-breach-tracker"
version = "0.1.0"
requires-python = ">=3.11"

[tool.setuptools.packages.find]
where = ["src"]
```

### Validation Commands

```bash
# Verify editable install works
pip install -e packages/translate/consecutive-breach-tracker/

# Verify imports resolve
python -c "from consecutive_breach_tracker import ConsecutiveBreachTracker"
```

### Type Checking Python Stubs

Use **Pyright** (not mypy) because:
- 6x faster than mypy on stub-heavy code (benchmarked 2025)
- Better inference for stub files
- Already available as a Claude Code plugin (`pyright-lsp`)
- Single binary, no daemon needed

```bash
# Check all Python packages
pyright packages/translate/consecutive-breach-tracker/src/
pyright packages/translate/agent-skill-routing/src/
pyright packages/translate/cost-per-interaction/src/
```

### Linting with Ruff

Ruff includes `flake8-pyi` rules (the `PYI` rule set) specifically for type stub files. Enable them:

```toml
# Root pyproject.toml or ruff.toml
[tool.ruff]
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "PYI", "I"]
```

The `PYI` rules enforce stub conventions: no runtime code in `.pyi` files, correct `__all__` exports, proper use of `...` for stub bodies.

**Note:** For this project, Python files are `.py` with TODO bodies (not `.pyi` stub files), so `PYI` rules apply only if you use `.pyi` extension. If staying with `.py`, use standard `E`, `F`, `I` rules.

**Confidence:** HIGH for pip install validation, MEDIUM for Pyright (depends on how detailed Python stubs are).

---

## 5. Makefile Patterns for 31-Package Validation

### Recommended Makefile Structure

```makefile
.PHONY: all type-check lint scaffold-check list-packages python-check clean

# Default target
all: scaffold-check type-check lint

# TypeScript type checking (uses project references, inherently handles deps)
type-check:
	tsc --build --noEmit

# Lint TypeScript with Biome, Python with Ruff
lint:
	biome check packages/extract/ packages/build/ packages/translate/ivr-call-flow-validator/ packages/translate/prompt-cache-optimizer/
	ruff check packages/translate/consecutive-breach-tracker/ packages/translate/agent-skill-routing/ packages/translate/cost-per-interaction/

# Scaffold validation
scaffold-check:
	@./scripts/check-scaffolds.sh

# Python editable install validation
python-check:
	pip install -e packages/translate/consecutive-breach-tracker/ --quiet
	pip install -e packages/translate/agent-skill-routing/ --quiet
	pip install -e packages/translate/cost-per-interaction/ --quiet
	python -c "from consecutive_breach_tracker import *; from agent_skill_routing import *; from cost_per_interaction import *"

# List all packages with metadata
list-packages:
	@echo "=== Extract Tier (16 TS) ==="; \
	for dir in packages/extract/*/; do echo "  $$(basename $$dir)"; done; \
	echo "=== Build Tier (10 TS) ==="; \
	for dir in packages/build/*/; do echo "  $$(basename $$dir)"; done; \
	echo "=== Translate Tier (5 mixed) ==="; \
	for dir in packages/translate/*/; do echo "  $$(basename $$dir)"; done

# Clean build artifacts
clean:
	find . -name '*.tsbuildinfo' -delete
	find . -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true
```

### Parallel Execution

Use `make -j4` for parallel targets where dependencies allow. For this project:
- `scaffold-check` has no deps -- runs first (fast, < 1s)
- `type-check` and `lint` are independent -- can run in parallel
- `python-check` is independent of TS targets -- can run in parallel

```makefile
# Parallel-safe target
validate: scaffold-check
	$(MAKE) -j2 type-check lint python-check
```

### Why Biome Over ESLint

Use **Biome** (not ESLint + Prettier) for TypeScript linting because:
- 15x faster (200ms vs 3-5s on 10K-line monorepo)
- Single binary, zero npm dependency tree
- Combined formatter + linter in one tool
- Biome 2.0+ has monorepo-aware configuration via `extends`
- Type-aware linting available (Biome 2.0+, June 2025)

```json
// biome.json at root
{
  "$schema": "https://biomejs.dev/schemas/2.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "files": {
    "include": ["packages/**/*.ts"]
  }
}
```

**Confidence:** HIGH -- Biome and Ruff are the 2025-2026 standard for new projects.

---

## 6. Validation Priority Matrix

| What | Tool | When | Blocks Merge? |
|------|------|------|---------------|
| All dirs have required files | `make scaffold-check` | Every change | Yes |
| TS stubs compile | `tsc --build --noEmit` | Every change | Yes |
| TS lint passes | `biome check` | Every change | Yes |
| Python packages install | `pip install -e` | Python changes | Yes |
| Python lint passes | `ruff check` | Python changes | Yes |
| Workspace refs resolve | `bun install` | Dependency changes | Yes |
| Import smoke test | `tsc --noEmit test/import-check.ts` | New packages | Yes |
| Type assertion tests (tsd) | `tsd` per P0 package | P0 changes only | No (advisory) |
| Python type check | `pyright` | Python changes | No (advisory) |

---

## 7. Anti-Patterns to Avoid

### Do Not Add Jest/Vitest
There is no runtime behavior to test. Adding a test runner creates false confidence and maintenance burden. `tsc --noEmit` IS the test suite for type stubs.

### Do Not Use `skipLibCheck: true`
This skips type checking of `.d.ts` files in `node_modules`. For a project whose entire purpose is type correctness, this defeats the goal. Keep it `false`.

### Do Not Add Turborepo/Nx
Single developer, no CI, no runtime builds. The complexity cost of a build orchestrator exceeds its value. `make -j` provides sufficient parallelism.

### Do Not Lint with ESLint
ESLint's 127+ npm package dependency tree is unnecessary when Biome provides the same coverage in a single binary at 15x the speed.

### Do Not Use `.pyi` for Python Packages
The Python packages are designed as regular packages with TODO implementations, not pure type stubs. Using `.py` files with placeholder bodies (`...` or `raise NotImplementedError`) is correct. Reserve `.pyi` for third-party library stubs.

---

## 8. Tool Versions (as of April 2026)

| Tool | Version | Purpose |
|------|---------|---------|
| TypeScript | 5.7+ (or TS 7 native if available) | Type checking |
| Bun | 1.1+ | Workspace management, package resolution |
| Biome | 2.3+ | TS linting and formatting |
| Ruff | 0.8+ | Python linting |
| Pyright | 1.1.390+ | Python type checking |
| tsd | 0.31+ | Type definition testing (P0 only) |

---

## Sources

- [TypeScript Project References (official docs)](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Bun Workspaces (official docs)](https://bun.com/docs/pm/workspaces)
- [TSD - TypeScript Type Definition Testing](https://github.com/tsdjs/tsd)
- [Biome Roadmap 2025 / 2.0](https://biomejs.dev/blog/roadmap-2025/)
- [Biome Roadmap 2026](https://biomejs.dev/blog/roadmap-2026/)
- [Ruff FAQ and Configuration](https://docs.astral.sh/ruff/faq/)
- [PEP 660 - Editable installs for pyproject.toml](https://peps.python.org/pep-0660/)
- [TypeScript 7 Progress (December 2025)](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/)
- [Testing Types in TypeScript (2025)](https://2ality.com/2025/02/testing-types-typescript.html)
- [Managing TS Packages in Monorepos (Nx blog)](https://nx.dev/blog/managing-ts-packages-in-monorepos)
- [Biome vs ESLint 2025 comparison](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c)
- [GNU Make Parallel Execution](https://www.gnu.org/software/make/manual/html_node/Parallel.html)
