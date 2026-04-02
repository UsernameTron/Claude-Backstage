# @claude-patterns/config-migration

Database migration pattern applied to CLI configuration.

## Source Reference

- **Files:** `migrations/` (11 files)
- **LOC:** 603
- **KB Section:** 4 — Config Migration
- **Tier:** Extract P2

## Key Concepts

- **Sequential migration** — Runs pending migrations in version order
- **Version tracking** — `CURRENT_MIGRATION_VERSION` constant tracks latest
- **Model evolution naming** — Migration names track model evolution (Fennec, Opus, Sonnet)

## Exports

- `CURRENT_MIGRATION_VERSION` — Current migration version constant (11)
- `Migration` — Interface: version, name, migrate function
- `MigrationResult` — Interface: fromVersion, toVersion, migrationsRun, config
- `runMigrations()` — Run all pending migrations from a given version
- `getMigrations()` — Get list of all registered migrations

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** None
