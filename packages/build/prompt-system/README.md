# @claude-patterns/prompt-system

**Tier:** Build | **Priority:** P0 | **KB:** Section 15

System prompt assembly with static/dynamic boundary for prompt cache optimization.

## Source Reference

- `constants/prompts.ts` + `systemPromptSections.ts` (2,368 LOC)
- Claude Code source: `~/projects/Inside Claude Code/claude-code/src/`

## Architecture

The system prompt is divided into **static** and **dynamic** sections separated by `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`. This boundary drives prompt cache optimization:

- **Static sections** (above boundary): Identity, capabilities, tool descriptions. Globally cacheable across turns. Cached at the API level to reduce latency and cost.
- **Dynamic sections** (below boundary): Session guidance, memory, environment info, language, output style, MCP instructions, scratchpad, FRC, token budget. Recomputed per-turn or per-org.

### Cache Scoping

Three cache scope tiers control which static content is shared:

1. **Global** — shared across all orgs/users (identity, base capabilities)
2. **Org** — shared within an organization (org-specific tool configs)
3. **Null** — no caching (fully dynamic prompts)

## Exports

### Types

- `SystemPromptSection` — section with id, content, type (static/dynamic), cached flag
- `SystemPromptConfig` — assembly config (output style, enabled tools, cache scope)
- `DynamicSectionType` — union of 9 dynamic section identifiers

### Constants

- `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` — `"--- DYNAMIC CONTENT BELOW ---"`

### Functions

- `getSystemPrompt(config?)` — assemble full prompt from sections
- `systemPromptSection(id, content, type?)` — factory for creating sections
- `resolveSystemPromptSections(sections)` — filter nulls, return content strings
- `getSimpleIntroSection(outputStyleConfig?)` — intro section
- `getSimpleSystemSection()` — core system identity
- `getSimpleDoingTasksSection()` — task execution guidance
- `getActionsSection()` — actions/capabilities
- `getUsingYourToolsSection(enabledTools?)` — tool usage guidance
- `getSimpleToneAndStyleSection()` — tone and style
- `getOutputEfficiencySection()` — output efficiency
- `shouldUseGlobalCacheScope()` — cache scope determination

## Status

Type stubs only. All functions throw `TODO` errors referencing source paths.
