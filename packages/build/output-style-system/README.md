# @claude-patterns/output-style-system

**Tier:** Build | **Priority:** P3 | **KB:** Section 35

Output styles and markdown rendering with LRU token cache and plain-text fast path.

## Source Pattern

- Section 35: Output style system — custom styles loaded from user/project directories, LRU token cache (500 entries), plain-text fast path for non-markdown content

## Architecture

The output style system controls how Claude's responses are formatted and rendered. Styles are loaded from two filesystem locations (user-level and project-level), with project styles taking precedence on name collisions.

### Style Loading

Styles are discovered by scanning configured directories for style definition files. Each style specifies formatting rules, whether to preserve coding instructions, and whether to force the style for plugin contexts.

### Markdown Cache

An LRU cache (default 500 entries) stores rendered markdown tokens to avoid re-rendering identical content across turns. The cache uses string keys derived from content hashes.

### Plain-Text Fast Path

Before invoking the full markdown renderer, a fast-path check samples the first 500 characters for markdown syntax markers (headers, links, code blocks, etc.). If none are found, the content is treated as plain text and bypasses rendering entirely.

## Exports

### Types

- `OutputStyle` — style definition with name, description, formatting flags, and content
- `OutputStyleConfig` — user and project style directory paths
- `MarkdownCacheConfig` — max entries and sample size for cache
- `MarkdownCache` — LRU cache interface with get, set, has, clear, size

### Functions

- `loadOutputStyles(config)` — load and merge styles from directories
- `applyOutputStyle(content, style)` — apply style to content
- `isPlainText(content, sampleSize?)` — fast-path plain text detection
- `createMarkdownCache(config?)` — create LRU cache instance

## Dependencies

None.

## Status

Type stubs only. All functions throw `TODO` errors referencing implementation notes.
