# Domain Pitfalls

**Domain:** Type-stub monorepo
**Researched:** 2026-04-01

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Bun Filter Does Not Match Scoped Packages
**What goes wrong:** Running `bun --filter '*' <script>` silently skips all `@claude-patterns/` packages.
**Why it happens:** Known Bun bug (issue #12300) -- the glob `*` does not match scoped package names starting with `@`.
**Consequences:** Scripts appear to succeed but only run on non-scoped packages. Type-checking or linting passes when it should not.
**Prevention:** Always use `bun --filter '@claude-patterns/*'` or path-based filters like `bun --filter './extract/*'`. Better yet, use Makefile targets that explicitly enumerate packages or use `bunx tsc` directly.
**Detection:** If a Makefile target finishes suspiciously fast, check whether it actually processed all packages.

### Pitfall 2: tsconfig Paths Masking Missing Dependencies
**What goes wrong:** A package imports `@claude-patterns/permission-system` but does not declare it in `dependencies`. TypeScript resolves it anyway via workspace paths, so `tsc --noEmit` passes.
**Why it happens:** Bun workspace hoisting puts all packages in root `node_modules`, so resolution works even without explicit dependency declarations.
**Consequences:** Dependency graph documentation becomes incorrect. If packages were ever used outside the monorepo, imports would fail.
**Prevention:** Keep per-package `paths` in tsconfig minimal -- only map dependencies that are declared in that package's `package.json`. Run `scaffold-check` to verify dependencies match imports.
**Detection:** Audit `package.json` dependencies against actual imports periodically.

### Pitfall 3: Python Packages Breaking on Missing Virtual Environment
**What goes wrong:** Running `pip install -e translate/consecutive-breach-tracker` installs into system Python.
**Why it happens:** No `.venv` activated, or Makefile doesn't check for venv.
**Consequences:** System Python pollution, version conflicts, hard-to-debug import errors.
**Prevention:** Makefile `python-check` target should verify `.venv` exists and is active before running any pip commands. Add a guard: `@test -n "$$VIRTUAL_ENV" || (echo "Activate .venv first" && exit 1)`.
**Detection:** Check `which python3` output in Makefile before proceeding.

## Moderate Pitfalls

### Pitfall 1: Biome Config Not Covering All Tiers
**What goes wrong:** Root `biome.json` uses `include` patterns that miss some tier directories.
**Prevention:** Use a single root `biome.json` without `include` restrictions. Biome's default behavior checks all files in the project. Add `ignore` for `node_modules`, `.venv`, and Python files only.

### Pitfall 2: TypeScript `moduleResolution` Mismatch
**What goes wrong:** Using `"moduleResolution": "node"` instead of `"bundler"` causes Bun workspace resolution to fail for packages without `main`/`types` fields.
**Prevention:** Always use `"moduleResolution": "bundler"` in tsconfig.base.json. This matches Bun's native resolution behavior.

### Pitfall 3: Workspace Protocol in Dependencies
**What goes wrong:** Using `"workspace:*"` vs `"*"` vs explicit version in cross-package dependencies causes confusion.
**Prevention:** Standardize on `"workspace:*"` for all intra-monorepo dependencies. Document this convention in CLAUDE.md.

### Pitfall 4: Python Package Naming (Hyphens vs Underscores)
**What goes wrong:** Package named `consecutive-breach-tracker` but Python module is `consecutive_breach_tracker`. Import fails.
**Prevention:** pyproject.toml `[project] name` uses hyphens (pip convention). Directory under `src/` uses underscores (Python convention). Document the mapping in each package's README.

## Minor Pitfalls

### Pitfall 1: Stale tsconfig.base.json
**What goes wrong:** Adding a new compiler option to some packages but not updating the base config.
**Prevention:** All shared compiler options go in `tsconfig.base.json`. Per-package tsconfig only overrides `rootDir`, `baseUrl`, `paths`, and `include`.

### Pitfall 2: Missing `"private": true` in Package.json
**What goes wrong:** Accidentally publishing stubs to npm during a `bun publish` or similar command.
**Prevention:** Every package.json must have `"private": true`. Check in `scaffold-check`.

### Pitfall 3: Biome vs tsc Disagreement on Unused Imports
**What goes wrong:** Biome auto-removes an import that tsc needs for type-only usage.
**Prevention:** Use `import type { Foo }` syntax explicitly for type-only imports. Biome respects `type` imports.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Root scaffold | Bun filter scoped package bug | Use Makefile with explicit paths, not `--filter '*'` |
| P0 packages | Cross-package type resolution | Test `@claude-patterns/permission-system` import from another package early |
| Extract tier (bulk) | Inconsistent package structure | Run `scaffold-check` after each batch |
| Python packages | Missing venv, naming mismatch | Venv guard in Makefile, document hyphen/underscore mapping |
| Dependency graph | Implicit deps via workspace hoisting | Validate declared deps match actual imports |

## Sources

- [Bun scoped filter bug #12300](https://github.com/oven-sh/bun/issues/12300)
- [Bun scoped filter bug #10322](https://github.com/oven-sh/bun/issues/10322)
- [Ruff configuration -- hierarchical config](https://docs.astral.sh/ruff/configuration/)
- [Biome v2 monorepo support](https://biomejs.dev/blog/biome-v2/)
