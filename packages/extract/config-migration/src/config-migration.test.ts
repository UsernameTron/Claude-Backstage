import { describe, test, expect } from "bun:test";
import {
  getMigrations,
  runMigrations,
  CURRENT_MIGRATION_VERSION,
} from "./index";
import type { Migration, MigrationResult } from "./index";

describe("config-migration", () => {
  test("CURRENT_MIGRATION_VERSION equals 11", () => {
    expect(CURRENT_MIGRATION_VERSION).toBe(11);
  });

  test("getMigrations returns 11 Migration objects", () => {
    const migrations = getMigrations();
    expect(migrations.length).toBe(11);
  });

  test("getMigrations returns migrations sorted by version ascending", () => {
    const migrations = getMigrations();
    for (let i = 1; i < migrations.length; i++) {
      expect(migrations[i].version).toBeGreaterThan(migrations[i - 1].version);
    }
  });

  test("each migration has version, name, and migrate function", () => {
    const migrations = getMigrations();
    for (const m of migrations) {
      expect(typeof m.version).toBe("number");
      expect(typeof m.name).toBe("string");
      expect(m.name.length).toBeGreaterThan(0);
      expect(typeof m.migrate).toBe("function");
    }
  });

  test("runMigrations from 0 applies all 11 migrations", () => {
    const result = runMigrations({}, 0);
    expect(result.fromVersion).toBe(0);
    expect(result.toVersion).toBe(CURRENT_MIGRATION_VERSION);
    expect(result.migrationsRun.length).toBe(11);
    expect(typeof result.config).toBe("object");
  });

  test("runMigrations from CURRENT_MIGRATION_VERSION is a no-op", () => {
    const config = { existing: "value" };
    const result = runMigrations(config, CURRENT_MIGRATION_VERSION);
    expect(result.fromVersion).toBe(CURRENT_MIGRATION_VERSION);
    expect(result.toVersion).toBe(CURRENT_MIGRATION_VERSION);
    expect(result.migrationsRun.length).toBe(0);
    expect(result.config).toEqual(config);
  });

  test("runMigrations from version 5 applies only migrations 6-11", () => {
    const result = runMigrations({}, 5);
    expect(result.fromVersion).toBe(5);
    expect(result.toVersion).toBe(CURRENT_MIGRATION_VERSION);
    expect(result.migrationsRun.length).toBe(6);
  });

  test("each migration transforms config immutably", () => {
    const original = { keepMe: "untouched" };
    const originalCopy = { ...original };
    runMigrations(original, 0);
    // Original should not be mutated
    expect(original).toEqual(originalCopy);
  });

  test("full migration produces expected config structure", () => {
    const result = runMigrations({}, 0);
    const cfg = result.config;
    // v1 adds configVersion
    expect(cfg.configVersion).toBeDefined();
    // v3 adds permissions
    expect(cfg.permissions).toBeDefined();
    // v4 adds sandbox
    expect(cfg.sandbox).toBeDefined();
    // v11 adds cleanupPeriodDays
    expect(cfg.cleanupPeriodDays).toBeDefined();
  });
});
