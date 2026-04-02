// plugin-lifecycle-manager — Plugin system lifecycle management
// Source: Section 25 — four-phase lifecycle: Discovery -> Cache -> Cleanup -> Telemetry
// KB: Section 25

// --- Types & Interfaces ---

/**
 * States a plugin can be in during its lifecycle.
 * - discovered: found in seed directories
 * - cached: manifest loaded from cache
 * - active: currently loaded and providing tools/skills
 * - orphaned: cached but no longer in seed directories
 * - error: failed to load or activate
 */
export type PluginState =
  | "discovered"
  | "cached"
  | "active"
  | "orphaned"
  | "error";

/**
 * A plugin's manifest describing its capabilities and components.
 */
export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  skills: string[];
  mcpServers: string[];
  hooks: Record<string, unknown>;
}

/**
 * Configuration for the plugin lifecycle manager.
 */
export interface PluginLifecycleConfig {
  seedDirs: string[];
  cacheDir: string;
  maxCacheAge: number;
}

// --- Class ---

/**
 * Manages the four-phase plugin lifecycle:
 * 1. Discovery — scan seed directories for plugin manifests
 * 2. Cache — persist manifests for fast startup
 * 3. Cleanup — remove orphaned plugins no longer in seed dirs
 * 4. Telemetry — log active plugins for session analytics
 */
export class PluginLifecycleManager {
  /**
   * Initialize the lifecycle manager with directory and cache configuration.
   * TODO: implement constructor with seed directory and cache setup
   */
  constructor(_config: PluginLifecycleConfig) {
    throw new Error(
      "TODO: implement constructor with seed directory and cache setup",
    );
  }

  /**
   * Scan seed directories for plugin manifests.
   * TODO: implement plugin discovery from seed directories
   */
  discover(): PluginManifest[] {
    throw new Error("TODO: implement plugin discovery from seed directories");
  }

  /**
   * Load plugin manifests from the cache directory.
   * TODO: implement cache loading for fast startup
   */
  loadFromCache(): PluginManifest[] {
    throw new Error("TODO: implement cache loading for fast startup");
  }

  /**
   * Remove orphaned plugins that are cached but no longer in seed directories.
   * Returns the count of plugins removed.
   * TODO: implement orphaned plugin cleanup
   */
  async cleanupOrphaned(): Promise<number> {
    throw new Error("TODO: implement orphaned plugin cleanup");
  }

  /**
   * Log the set of active plugins for session telemetry.
   * TODO: implement session plugin telemetry logging
   */
  logSessionPlugins(_active: PluginManifest[]): void {
    throw new Error("TODO: implement session plugin telemetry logging");
  }

  /**
   * Get the current lifecycle state of a plugin by name.
   * TODO: implement plugin state lookup
   */
  getState(_pluginName: string): PluginState {
    throw new Error("TODO: implement plugin state lookup");
  }

  /**
   * Activate a plugin, transitioning it from discovered/cached to active.
   * TODO: implement plugin activation
   */
  activate(_pluginName: string): void {
    throw new Error("TODO: implement plugin activation");
  }
}
