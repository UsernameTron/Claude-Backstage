# @claude-patterns/context-injection

**Tier:** Build | **Priority:** P0 | **KB:** Section 16

Dual-position context injection exploiting transformer attention patterns.

## Source Reference

- `context.ts` + `QueryEngine.ts` (1,484 LOC)
- Claude Code source: `~/projects/Inside Claude Code/claude-code/src/`

## Architecture

### Why Dual-Position Injection?

Context injection uses two distinct positions in the message stream, each targeting a different transformer attention mechanism:

1. **System prompt end** (`system_end`) — Git branch, status, user, recent commits. Placed at the END of the system prompt because transformers exhibit recency bias: tokens near the end of the system prompt receive higher attention weight during generation. This ensures the model "knows" the current repository state without it being buried mid-prompt.

2. **First user message** (`first_user_message`) — CLAUDE.md content and current date, wrapped in `<system-reminder>` tags. Placed as the FIRST user message because early messages in a conversation set the conversational frame. The model treats this as establishing context for everything that follows, making CLAUDE.md directives persistent across the entire conversation.

### Cache Breaker

The `cacheBreaker` field in `SystemContext` forces prompt cache invalidation when system context changes mid-session (e.g., user switches git branches). Without this, the cached prompt would contain stale branch/status information.

### Circular Dependency Breaking

`setCachedClaudeMdContent()` exists to break a circular dependency: the YOLO classifier needs CLAUDE.md content to evaluate permission rules, but loading CLAUDE.md through the normal path would trigger context injection, which itself depends on the classifier. The side-channel cache provides CLAUDE.md content without going through the full context pipeline.

## Exports

### Types

- `SystemContext` — git-derived context (branch, status, user, commits, cache breaker)
- `UserContext` — CLAUDE.md content and date
- `InjectionPosition` — `"system_end" | "first_user_message"`
- `ContextInjection` — resolved injection with content, position, and wrapping config

### Functions

- `getSystemContext()` — collect git context (memoized per session)
- `getUserContext()` — collect CLAUDE.md and date
- `appendSystemContext(systemPrompt, context)` — append to system prompt end
- `prependUserContext(messages, context)` — prepend as first user message
- `getSystemPromptInjection()` — generate cache breaker string
- `setCachedClaudeMdContent(content)` — side-channel cache for circular dependency breaking

## Status

Working implementation. All exported functions are fully implemented: `getSystemContext()` collects live git state via `Bun.spawnSync`, `getUserContext()` returns cached CLAUDE.md content and current date, `appendSystemContext()` and `prependUserContext()` perform string assembly, and `setCachedClaudeMdContent()` manages the circular-dependency cache. Tests verify dual-position injection behavior (see `__tests__/`).
