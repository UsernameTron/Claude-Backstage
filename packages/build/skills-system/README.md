# @claude-patterns/skills-system

Skill loading, registration, frontmatter parsing, and token estimation.

## Source

- `skills/` (20 files, 4,066 LOC)
- KB Pattern 12

## Tier

Build P1

## Dependencies

- `@claude-patterns/claudemd-memory` — memory file types for skill context resolution

## Exports

- `BundledSkillDefinition` — programmatic skill definition
- `SkillFrontmatter` — parsed SKILL.md frontmatter
- `SkillCommand` — slash-command registration type
- `SkillLoadResult` — loaded skill with memory files and token estimate
- `getSkillDirCommands()` — discover skills in a directory
- `registerBundledSkill()` — register a bundled skill
- `estimateSkillFrontmatterTokens()` — estimate frontmatter token cost
- `loadSkill()` — load skill from disk
- `parseFrontmatter()` — parse SKILL.md frontmatter
