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

// --- Default styles ---

const DEFAULT_STYLES: OutputStyle[] = [
  {
    name: "default",
    description: "Default output style with code preservation",
    keepCodingInstructions: true,
    forceForPlugin: false,
    content: "",
  },
  {
    name: "concise",
    description: "Concise output without code block preservation",
    keepCodingInstructions: false,
    forceForPlugin: false,
    content: "Be concise and direct.",
  },
];

// --- Markdown markers used for plain-text detection ---

const MARKDOWN_MARKERS = ["#", "**", "__", "`", "- ", "> ", "|", "["];

// --- Functions ---

/**
 * Loads output styles from user and project style directories.
 * Merges both sources with project styles taking precedence.
 * Returns simulated in-memory styles (no real filesystem access).
 */
export function loadOutputStyles(config: OutputStyleConfig): OutputStyle[] {
  // Simulated: return default styles. In production, would read from
  // config.userStyleDir and config.projectStyleDir, merging by name.
  void config;
  return DEFAULT_STYLES.map((s) => ({ ...s }));
}

/**
 * Applies an output style to content, transforming formatting as specified.
 * - forceForPlugin: wraps in <plugin-style> markers
 * - keepCodingInstructions: preserves code blocks as-is
 * - Appends style.content as suffix instruction
 */
export function applyOutputStyle(
  content: string,
  style: OutputStyle,
): string {
  let result = content;

  if (!style.keepCodingInstructions) {
    // Strip code blocks when not preserving coding instructions
    result = result.replace(/```[\s\S]*?```/g, "");
  }

  if (style.content) {
    result = `${result}\n\n${style.content}`;
  }

  if (style.forceForPlugin) {
    result = `<plugin-style>${result}</plugin-style>`;
  }

  return result;
}

/**
 * Fast-path check for plain text content.
 * Samples the first N characters (default 500) for markdown syntax markers.
 * Returns true if no markdown syntax is detected.
 */
export function isPlainText(
  content: string,
  sampleSize?: number,
): boolean {
  const size = sampleSize ?? 500;
  const sample = content.slice(0, size);
  return !MARKDOWN_MARKERS.some((marker) => sample.includes(marker));
}

/**
 * Creates an LRU markdown cache with configurable size.
 * Default: 500 max entries.
 * Uses Map insertion order for LRU tracking — on get, delete and re-insert
 * to move entry to end. On set, evict first key (oldest) when at capacity.
 */
export function createMarkdownCache(
  config?: MarkdownCacheConfig,
): MarkdownCache {
  const maxEntries = config?.maxEntries ?? 500;
  const map = new Map<string, string>();

  return {
    get(key: string): string | undefined {
      const value = map.get(key);
      if (value !== undefined) {
        // LRU refresh: delete and re-insert to move to end
        map.delete(key);
        map.set(key, value);
      }
      return value;
    },
    set(key: string, value: string): void {
      // If key exists, delete first to refresh position
      if (map.has(key)) {
        map.delete(key);
      } else if (map.size >= maxEntries) {
        // Evict oldest (first key in Map iteration order)
        const firstKey = map.keys().next().value;
        if (firstKey !== undefined) {
          map.delete(firstKey);
        }
      }
      map.set(key, value);
    },
    has(key: string): boolean {
      return map.has(key);
    },
    clear(): void {
      map.clear();
    },
    size(): number {
      return map.size;
    },
  };
}
