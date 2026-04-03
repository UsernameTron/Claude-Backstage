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
  private config: PluginLifecycleConfig;
  private plugins = new Map<string, { manifest: PluginManifest; state: PluginState }>();
  private activePlugins: PluginManifest[] = [];

  /**
   * Initialize the lifecycle manager with directory and cache configuration.
   */
  constructor(config: PluginLifecycleConfig) {
    this.config = config;
  }

  /**
   * Scan seed directories for plugin manifests.
   * Returns simulated manifests and sets state to "discovered".
   */
  discover(): PluginManifest[] {
    const manifests: PluginManifest[] = [
      {
        name: "test-plugin-1",
        version: "1.0.0",
        description: "Test plugin 1",
        skills: ["skill-a"],
        mcpServers: [],
        hooks: {},
      },
      {
        name: "test-plugin-2",
        version: "1.0.0",
        description: "Test plugin 2",
        skills: [],
        mcpServers: ["server-a"],
        hooks: {},
      },
    ];

    for (const manifest of manifests) {
      this.plugins.set(manifest.name, { manifest, state: "discovered" });
    }

    return manifests;
  }

  /**
   * Load plugin manifests from the cache directory.
   * Returns simulated cached manifest with state "cached".
   */
  loadFromCache(): PluginManifest[] {
    const cached: PluginManifest = {
      name: "cached-plugin",
      version: "0.9.0",
      description: "Cached plugin",
      skills: [],
      mcpServers: [],
      hooks: {},
    };

    this.plugins.set(cached.name, { manifest: cached, state: "cached" });
    return [cached];
  }

  /**
   * Remove orphaned plugins that are cached but no longer in seed directories.
   * Returns the count of plugins removed.
   */
  async cleanupOrphaned(): Promise<number> {
    let removed = 0;
    for (const [name, entry] of this.plugins) {
      if (entry.state === "orphaned") {
        this.plugins.delete(name);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Log the set of active plugins for session telemetry.
   */
  logSessionPlugins(active: PluginManifest[]): void {
    this.activePlugins = active;
  }

  /**
   * Get the current lifecycle state of a plugin by name.
   */
  getState(pluginName: string): PluginState {
    return this.plugins.get(pluginName)?.state ?? "error";
  }

  /**
   * Activate a plugin, transitioning it from discovered/cached to active.
   */
  activate(pluginName: string): void {
    const entry = this.plugins.get(pluginName);
    if (!entry) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }
    entry.state = "active";
  }
}
