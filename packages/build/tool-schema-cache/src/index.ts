// tool-schema-cache — Tool schema caching pattern for prompt cache stability
// Source: Section 21.3 — freezes tool schemas at session start to prevent
// prompt cache invalidation from feature flag changes
// KB: Section 21

// --- Types & Interfaces ---

/**
 * Policy controlling when cached schemas are refreshed.
 * - freeze_on_start: lock schemas at session init (default for cache stability)
 * - refresh_on_change: re-cache when tool set changes
 * - manual: only refresh on explicit invalidate() call
 */
export type CachePolicy = "freeze_on_start" | "refresh_on_change" | "manual";

/**
 * Minimal tool representation used as input to the cache.
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

/**
 * A tool schema snapshot stored in the cache with a timestamp.
 */
export interface CachedToolSchema {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  cachedAt: number;
}

// --- Class ---

/**
 * Caches tool schemas at session start to maintain prompt cache stability.
 * Schemas are frozen so that feature-flag changes mid-session do not
 * invalidate the prompt cache prefix.
 */
export class ToolSchemaCache {
  private cache = new Map<string, CachedToolSchema>();

  /**
   * Retrieve a cached schema by tool name.
   */
  get(toolName: string): CachedToolSchema | undefined {
    return this.cache.get(toolName);
  }

  /**
   * Store or update a schema in the cache.
   */
  set(toolName: string, schema: CachedToolSchema): void {
    this.cache.set(toolName, schema);
  }

  /**
   * Refresh cache from a full tool list (e.g., at session start).
   */
  refresh(tools: Tool[]): void {
    this.cache.clear();
    const now = Date.now();
    for (const tool of tools) {
      this.cache.set(tool.name, { ...tool, cachedAt: now });
    }
  }

  /**
   * Clear all cached schemas, forcing a re-cache on next refresh.
   */
  invalidate(): void {
    this.cache.clear();
  }

  /**
   * Returns all cached schemas in deterministic (sorted) order
   * for stable prompt cache key generation.
   */
  getStableSchemaList(): CachedToolSchema[] {
    return [...this.cache.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }
}
