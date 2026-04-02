/**
 * @claude-patterns/tool-schema-cache
 *
 * Per-session tool schema caching to prevent prompt jitter from feature flag changes.
 * Freezes tool schema set at session start, only updates on explicit refresh.
 *
 * @source Tool schema caching (Section 21.3)
 * @kb Section 21.3 (Tool Schema Caching), Section 6.3 (Cache-Stable Tool Ordering)
 */

// Types & Interfaces

export interface CachedToolSchema {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  cachedAt: number;
}

export type CachePolicy = "freeze_on_start" | "refresh_on_change" | "manual";

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

// Class

export class ToolSchemaCache {
  constructor(_policy: CachePolicy) {
    throw new Error("TODO: build from tool schema caching pattern (Section 21.3)");
  }

  get(_toolName: string): CachedToolSchema | undefined {
    throw new Error("TODO: build from tool schema caching pattern (Section 21.3)");
  }

  set(_toolName: string, _schema: CachedToolSchema): void {
    throw new Error("TODO: build from tool schema caching pattern (Section 21.3)");
  }

  refresh(_tools: Tool[]): void {
    throw new Error("TODO: build from tool schema caching pattern (Section 21.3)");
  }

  invalidate(): void {
    throw new Error("TODO: build from tool schema caching pattern (Section 21.3)");
  }

  getStableSchemaList(): CachedToolSchema[] {
    throw new Error("TODO: build from tool schema caching pattern (Section 21.3)");
  }
}
