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
  /**
   * Retrieve a cached schema by tool name.
   * TODO: implement cache lookup
   */
  get(_toolName: string): CachedToolSchema | undefined {
    throw new Error("TODO: implement cache lookup for tool schema");
  }

  /**
   * Store or update a schema in the cache.
   * TODO: implement cache storage
   */
  set(_toolName: string, _schema: CachedToolSchema): void {
    throw new Error("TODO: implement cache storage for tool schema");
  }

  /**
   * Refresh cache from a full tool list (e.g., at session start).
   * TODO: implement bulk cache refresh from tool array
   */
  refresh(_tools: Tool[]): void {
    throw new Error("TODO: implement bulk cache refresh from tool array");
  }

  /**
   * Clear all cached schemas, forcing a re-cache on next refresh.
   * TODO: implement cache invalidation
   */
  invalidate(): void {
    throw new Error("TODO: implement cache invalidation");
  }

  /**
   * Returns all cached schemas in deterministic (sorted) order
   * for stable prompt cache key generation.
   * TODO: implement stable schema list ordering
   */
  getStableSchemaList(): CachedToolSchema[] {
    throw new Error("TODO: implement stable schema list ordering");
  }
}
