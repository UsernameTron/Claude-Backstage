# @claude-patterns/claudemd-memory

CLAUDE.md memory system: 4-tier hierarchy, @include directives, frontmatter conditionals.

## Source Reference

- **Files:** `utils/claudemd.ts` + `skills/loadSkillsDir.ts`
- **LOC:** 2,565
- **KB Section:** 17 — CLAUDE.md Memory System
- **Tier:** Extract P1

## Key Concepts

- **4-tier hierarchy** — managed -> user -> project -> local (last = highest priority)
- **@include directives** — @path, @./relative, @~/home, @/absolute with circular ref protection
- **Frontmatter conditionals** — Path-scoped CLAUDE.md via glob patterns
- **40K char limit** — MAX_MEMORY_CHARACTER_COUNT prevents context bloat
- **HTML comment stripping** — Comments removed before injection

## Exports

- `MAX_MEMORY_CHARACTER_COUNT` — 40,000 character limit constant
- `MemoryTier` — Type: managed, user, project, local
- `MemoryFile` — Interface: path, tier, content, frontmatter
- `MemoryFrontmatter` — Interface: paths (glob patterns)
- `IncludeResult` — Interface: resolvedContent, includedPaths, circularRefs
- `getMemoryFiles()` — Get all memory files from 4-tier hierarchy
- `getClaudeMds()` — Traverse upward from CWD to find CLAUDE.md files
- `processMemoryFile()` — Parse frontmatter, resolve includes, strip comments
- `resolveIncludes()` — Resolve @include directives with circular ref protection

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** skills-system (Phase 4)
