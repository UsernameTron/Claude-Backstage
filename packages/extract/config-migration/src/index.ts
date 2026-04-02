/**
 * @claude-patterns/config-migration
 *
 * Database migration pattern applied to CLI configuration.
 * Source: migrations/ (11 files, 603 LOC)
 * KB: Section 4 — Config Migration
 * Tier: Extract P2
 */

export const CURRENT_MIGRATION_VERSION = 11;

export interface Migration {
  version: number;
  name: string;
  migrate: (config: Record<string, unknown>) => Record<string, unknown>;
}

export interface MigrationResult {
  fromVersion: number;
  toVersion: number;
  migrationsRun: string[];
  config: Record<string, unknown>;
}

// Runs all pending migrations sequentially from current version to CURRENT_MIGRATION_VERSION
export function runMigrations(
  config: Record<string, unknown>,
  fromVersion: number,
): MigrationResult {
  // TODO: extract from migrations/
  throw new Error("TODO: extract from migrations/");
}

// Returns the list of all registered migrations
export function getMigrations(): Migration[] {
  // TODO: extract from migrations/
  throw new Error("TODO: extract from migrations/");
}
