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
  phases: Record<string, number>;
  lazyModulesDeferred: number;
}

// Module-level state
const registeredModules = new Map<string, LazyModule>();
let startupMetrics: StartupMetrics = {
  totalMs: 0,
  phases: {} as Record<string, number>,
  lazyModulesDeferred: 0,
};
let currentPhase: StartupPhase | null = null;

/** Reset module-level state — used by tests to isolate runs. */
export function resetState(): void {
  registeredModules.clear();
  startupMetrics = {
    totalMs: 0,
    phases: {} as Record<string, number>,
    lazyModulesDeferred: 0,
  };
  currentPhase = null;
}

/** Record timing for a single phase by running a simulated phase function. */
async function runPhase(phase: StartupPhase): Promise<void> {
  currentPhase = phase;
  const start = performance.now();
  // Pattern library: each phase is simulated (no real I/O)
  // In production, each phase would perform actual work (parse args, load config, etc.)
  const end = performance.now();
  startupMetrics.phases[phase] = end - start;
}

// CLI entry point — parses args, runs startup phases, enters main loop
export async function main(_args?: string[]): Promise<void> {
  const totalStart = performance.now();

  // Run all 6 phases in order
  await runPhase("pre_init");
  await runPhase("config_load");
  await runPhase("auth_check");
  await runPhase("mcp_connect");
  await runPhase("prompt_assemble");
  await runPhase("ready");

  const totalEnd = performance.now();
  startupMetrics.totalMs = totalEnd - totalStart;
  startupMetrics.lazyModulesDeferred = countDeferredModules();
}

// Setup function — runs config load, auth check, MCP connect
export async function setup(config?: StartupConfig): Promise<void> {
  const totalStart = performance.now();

  await runPhase("config_load");
  await runPhase("auth_check");

  if (!config?.bareMode) {
    await runPhase("mcp_connect");
  }

  const totalEnd = performance.now();
  startupMetrics.totalMs = totalEnd - totalStart;
  startupMetrics.lazyModulesDeferred = countDeferredModules();
}

// Register a module for lazy loading based on priority
export function registerLazyModule(module: LazyModule): void {
  registeredModules.set(module.name, module);

  if (module.priority === "critical") {
    // Critical modules load immediately
    module.load();
  }
  // Deferred and idle modules are stored for later scheduling
}

// Get timing metrics for the most recent startup
export function getStartupMetrics(): StartupMetrics {
  return { ...startupMetrics };
}

/** Count non-critical registered modules. */
function countDeferredModules(): number {
  let count = 0;
  for (const mod of registeredModules.values()) {
    if (mod.priority !== "critical") {
      count++;
    }
  }
  return count;
}
