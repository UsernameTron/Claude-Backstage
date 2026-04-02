# @claude-patterns/output-style-system

Custom output styles with frontmatter config, LRU token cache, and plain-text fast path.

## Tier

**Build** — Design reference. Architectural patterns for new builds.

## Priority

**P3** — Output formatting and markdown rendering optimization.

## Source Reference

- **Source pattern**: Output styles and markdown rendering (Section 35)
- **KB sections**: Section 35 (Output Styles and Markdown Rendering)

## Architecture

Custom output styles loaded from user/project directories with frontmatter config. LRU token cache (500 entries) for rendered markdown. Plain-text fast path checks first 500 characters for markdown syntax before invoking the full parser, saving ~3ms per render.

The fast path optimization is significant at scale: most tool outputs are plain text, so skipping the markdown parser entirely for those cases compounds across hundreds of tool calls per session.

## Exports

- `OutputStyle` — Interface for a loaded style with name, description, flags, and content
- `OutputStyleConfig` — Configuration for user and project style directories
- `MarkdownCacheConfig` — LRU cache configuration with max entries and sample size
- `MarkdownCache` — Interface for the LRU cache with get/set/has/clear/size
- `loadOutputStyles` — Load styles from configured directories
- `applyOutputStyle` — Apply a style to content
- `isPlainText` — Fast path check for markdown syntax
- `createMarkdownCache` — Factory for the LRU markdown cache

## Dependencies

None

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
