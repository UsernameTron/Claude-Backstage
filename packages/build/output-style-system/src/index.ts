// output-style-system — Output styles and markdown rendering
// Source Pattern: Section 35 — custom styles from user/project dirs, LRU token cache (500 entries), plain-text fast path
// KB: Section 35

// --- Types & Interfaces ---

/**
 * An output style definition loaded from user or project directories.
 * Styles control how Claude's response is formatted and rendered.
 */
export interface OutputStyle {
  name: string;
  description: string;
  keepCodingInstructions: boolean;
  forceForPlugin: boolean;
  content: string;
}

/**
 * Configuration for loading output styles from filesystem directories.
 */
export interface OutputStyleConfig {
  userStyleDir: string;
  projectStyleDir: string;
}

/**
 * Configuration for the markdown token cache.
 * Uses LRU eviction with a configurable max size and sample size for plain-text detection.
 */
export interface MarkdownCacheConfig {
  maxEntries: number;
  sampleSize: number;
}

/**
 * LRU cache for rendered markdown tokens.
 * Avoids re-rendering identical markdown content across turns.
 */
export interface MarkdownCache {
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  has: (key: string) => boolean;
  clear: () => void;
  size: () => number;
}

// --- Functions ---

/**
 * Loads output styles from user and project style directories.
 * Merges both sources with project styles taking precedence.
 * TODO: implement style loading from user/project directories
 */
export function loadOutputStyles(_config: OutputStyleConfig): OutputStyle[] {
  throw new Error(
    "TODO: implement style loading from user/project directories",
  );
}

/**
 * Applies an output style to content, transforming formatting as specified.
 * TODO: implement style application with keepCodingInstructions and forceForPlugin
 */
export function applyOutputStyle(
  _content: string,
  _style: OutputStyle,
): string {
  throw new Error(
    "TODO: implement style application with keepCodingInstructions and forceForPlugin",
  );
}

/**
 * Fast-path check for plain text content.
 * Samples the first N characters (default 500) for markdown syntax markers.
 * Returns true if no markdown syntax is detected.
 * TODO: implement plain-text detection by sampling first 500 chars
 */
export function isPlainText(
  _content: string,
  _sampleSize?: number,
): boolean {
  throw new Error(
    "TODO: implement plain-text detection by sampling first 500 chars",
  );
}

/**
 * Creates an LRU markdown cache with configurable size.
 * Default: 500 max entries.
 * TODO: implement LRU cache with eviction
 */
export function createMarkdownCache(
  _config?: MarkdownCacheConfig,
): MarkdownCache {
  throw new Error("TODO: implement LRU cache with eviction");
}
