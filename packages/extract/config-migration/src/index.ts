/**
 * @claude-patterns/config-migration
 *
 * Database migration pattern applied to CLI configuration.
 * Source: migrations/ (11 files, 603 LOC)
 * KB: Section 4 — Config Migration
 * Tier: Extract P2
 */

export const CURRENT_MIGRATION_VERSION = 11;

/** Runtime check: returns the value if it is a non-null object (record-like), otherwise fallback. */
function asRecord(
  value: unknown,
  fallback: Record<string, unknown>,
): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return fallback;
}

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

/**
 * 11 sequential config migrations representing realistic CLI config evolution.
 * Each migration transforms the config object immutably (returns a new object).
 */
const migrations: Migration[] = [
  {
    version: 1,
    name: "add-config-version",
    migrate: (config) => ({ ...config, configVersion: 1 }),
  },
  {
    version: 2,
    name: "rename-api-key",
    migrate: (config) => {
      const { apiKey, ...rest } = config;
      return { ...rest, anthropicApiKey: apiKey ?? rest.anthropicApiKey ?? "" };
    },
  },
  {
    version: 3,
    name: "add-permissions-defaults",
    migrate: (config) => ({
      ...config,
      permissions: asRecord(config.permissions, {
        allow: [],
        deny: [],
        ask: [],
        defaultMode: "default",
      }),
    }),
  },
  {
    version: 4,
    name: "add-sandbox-defaults",
    migrate: (config) => ({
      ...config,
      sandbox: asRecord(config.sandbox, {
        enabled: false,
        autoAllowBashIfSandboxed: false,
      }),
    }),
  },
  {
    version: 5,
    name: "move-env-to-namespace",
    migrate: (config) => ({
      ...config,
      env: asRecord(config.env, {}),
    }),
  },
  {
    version: 6,
    name: "add-mcp-server-config",
    migrate: (config) => ({
      ...config,
      mcpServers: asRecord(config.mcpServers, {}),
    }),
  },
  {
    version: 7,
    name: "normalize-permission-rules",
    migrate: (config) => {
      const permissions = asRecord(config.permissions, {});
      return {
        ...config,
        permissions: {
          ...permissions,
          allow: Array.isArray(permissions.allow) ? permissions.allow : [],
          deny: Array.isArray(permissions.deny) ? permissions.deny : [],
          ask: Array.isArray(permissions.ask) ? permissions.ask : [],
        },
      };
    },
  },
  {
    version: 8,
    name: "add-hook-configuration",
    migrate: (config) => ({
      ...config,
      hooks: asRecord(config.hooks, {}),
    }),
  },
  {
    version: 9,
    name: "add-model-preferences",
    migrate: (config) => ({
      ...config,
      model: config.model ?? "claude-sonnet-4-5-20250929",
    }),
  },
  {
    version: 10,
    name: "add-telemetry-opt-out",
    migrate: (config) => ({
      ...config,
      telemetryEnabled: config.telemetryEnabled ?? true,
    }),
  },
  {
    version: 11,
    name: "add-cleanup-period-days",
    migrate: (config) => ({
      ...config,
      cleanupPeriodDays: config.cleanupPeriodDays ?? 30,
    }),
  },
];

// Runs all pending migrations sequentially from current version to CURRENT_MIGRATION_VERSION
export function runMigrations(
  config: Record<string, unknown>,
  fromVersion: number,
): MigrationResult {
  const pending = migrations.filter((m) => m.version > fromVersion);
  const migrationsRun: string[] = [];

  let current = { ...config };
  for (const migration of pending) {
    current = migration.migrate(current);
    migrationsRun.push(migration.name);
  }

  return {
    fromVersion,
    toVersion: pending.length > 0 ? pending[pending.length - 1].version : fromVersion,
    migrationsRun,
    config: current,
  };
}

// Returns the list of all registered migrations
export function getMigrations(): Migration[] {
  return [...migrations];
}
