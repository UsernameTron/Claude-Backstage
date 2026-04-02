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

## Archived
<!-- Rules that no longer apply -->
