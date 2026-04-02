# Lessons

## Active Rules

### Seed Rules
- [2026-04-01] [Config]: Never modify shared config files without checking downstream consumers.
- [2026-04-01] [Scope]: If a "quick fix" requires 3+ files, it is not quick. Re-plan.
- [2026-04-01] [Testing]: Run the full test suite, not just tests for the changed module.
- [2026-04-01] [Dependencies]: Never add dependencies without explicit user approval.
- [2026-04-01] [Data]: Never delete production data, migrations, or seed data without approval.

### Learned Rules
- [2026-04-01] [Git]: When working in a subdirectory of a parent repo with a restrictive .gitignore (`*` rule), initialize a separate git repo for the subdirectory. The parent repo's negation patterns only apply at root level. Triggered by: repeated `skipped_gitignored` failures when trying to commit via gsd-tools.
- [2026-04-01] [Source Access]: The claude-code/src/ directory is not accessible for direct inspection. Build type stubs from KB v2.1 and plan outline specifications instead. Triggered by: Explore agent confirmed source tree inaccessible.
- [2026-04-02] [tsconfig]: Package tsconfig.json extends path is ../../../tsconfig.base.json (3 levels), not ../../ (2 levels). The packages/ tier structure adds an extra directory level. Triggered by: 3 independent executors all auto-corrected this.
- [2026-04-02] [Python]: Use `setuptools.build_meta` as build backend, not legacy backends. Python 3.14 breaks on `setuptools.backends._legacy:_Backend`. Triggered by: pip install -e failure in Phase 2.
- [2026-04-02] [Bun]: bun binary is at $HOME/.bun/bin/bun, not in default PATH. Always pass full path to executor agents. Triggered by: `bun install` failing with command not found.
- [2026-04-02] [Workspace Deps]: When a package imports from another package in the monorepo, its package.json MUST include `"dependencies": { "@claude-patterns/{dep}": "workspace:*" }`. Without this, tsc --noEmit fails with TS2307. Triggered by: multi-step-ivr-input-validator missing dep on ivr-call-flow-validator.
- [2026-04-02] [Reference Docs]: IMPLEMENTATION-PLAYBOOK.md and KB-v2.1-Build-Inventory.md live in the parent project directory, not the worktree. KB file is gitignored by pattern `KB-v2.1-*.md`. Copy into worktree before editing. Triggered by: assumed files didn't exist when they were in parent dir.

## Archived
<!-- Rules that no longer apply -->
