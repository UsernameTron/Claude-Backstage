/**
 * @claude-patterns/claudemd-memory
 *
 * CLAUDE.md memory system: 4-tier hierarchy, @include directives, frontmatter conditionals.
 * Source: utils/claudemd.ts + skills/loadSkillsDir.ts (2,565 LOC)
 * KB: Section 17 — CLAUDE.md Memory System
 * Tier: Extract P1
 */

// Maximum characters per CLAUDE.md file
export const MAX_MEMORY_CHARACTER_COUNT = 40_000;

// Memory file tier in the 4-tier hierarchy
export type MemoryTier = "managed" | "user" | "project" | "local";

// Represents a loaded CLAUDE.md memory file
export interface MemoryFile {
  path: string;
  tier: MemoryTier;
  content: string;
  frontmatter?: MemoryFrontmatter;
}

// Frontmatter conditional rules for path-scoped CLAUDE.md
export interface MemoryFrontmatter {
  paths?: string[]; // glob patterns like src/components/**
}

// @include directive resolution result
export interface IncludeResult {
  resolvedContent: string;
  includedPaths: string[];
  circularRefs: string[];
}

// Get all memory files from the 4-tier hierarchy
// managed -> user -> project -> local (last = highest priority)
export function getMemoryFiles(workingDirectory: string): MemoryFile[] {
  // TODO: extract from utils/claudemd.ts
  throw new Error("TODO: extract from utils/claudemd.ts");
}

// Get CLAUDE.md files traversing upward from CWD to root
export function getClaudeMds(startDir: string): string[] {
  // TODO: extract from utils/claudemd.ts
  throw new Error("TODO: extract from utils/claudemd.ts");
}

// Process a single memory file: parse frontmatter, resolve @include, strip HTML comments
export function processMemoryFile(filePath: string): MemoryFile {
  // TODO: extract from utils/claudemd.ts
  throw new Error("TODO: extract from utils/claudemd.ts");
}

// Resolve @include directives: @path, @./relative, @~/home, @/absolute
// Tracks circular references. Only text file types (~80+ extensions).
export function resolveIncludes(
  content: string,
  basePath: string,
): IncludeResult {
  // TODO: extract from utils/claudemd.ts
  throw new Error("TODO: extract from utils/claudemd.ts");
}
