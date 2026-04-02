/**
 * @claude-patterns/cli-startup-optimization
 *
 * CLI startup phases, lazy module loading, and fast-path patterns.
 * Source: main.tsx + setup.ts (~2,000 LOC)
 * KB: Recipe 4, Section 26 — CLI Startup Optimization
 * Tier: Build P2
 */

// Ordered startup phases
export type StartupPhase =
  | "pre_init"
  | "config_load"
  | "auth_check"
  | "mcp_connect"
  | "prompt_assemble"
  | "ready";

// Configuration for startup behavior
export interface StartupConfig {
  bareMode?: boolean;
  nonInteractive?: boolean;
  printMode?: boolean;
  resumeConversation?: boolean;
  model?: string;
}

// Lazy-loaded module descriptor with priority scheduling
export interface LazyModule {
  name: string;
  load: () => Promise<unknown>;
  priority: "critical" | "deferred" | "idle";
}

// Startup timing metrics per phase
export interface StartupMetrics {
  totalMs: number;
  phases: Record<StartupPhase, number>;
  lazyModulesDeferred: number;
}

// CLI entry point — parses args, runs startup phases, enters main loop
export async function main(_args?: string[]): Promise<void> {
  // TODO: extract from main.tsx entry point
  throw new Error("TODO: extract from main.tsx entry point");
}

// Setup function — runs config load, auth check, MCP connect
export async function setup(_config?: StartupConfig): Promise<void> {
  // TODO: extract from setup.ts initialization
  throw new Error("TODO: extract from setup.ts initialization");
}

// Register a module for lazy loading based on priority
export function registerLazyModule(_module: LazyModule): void {
  // TODO: extract from lazy module registration pattern
  throw new Error("TODO: extract from lazy module registration pattern");
}

// Get timing metrics for the most recent startup
export function getStartupMetrics(): StartupMetrics {
  // TODO: extract from startup metrics collection
  throw new Error("TODO: extract from startup metrics collection");
}
