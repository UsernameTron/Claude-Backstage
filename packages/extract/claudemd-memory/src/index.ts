/**
 * @claude-patterns/claudemd-memory
 *
 * CLAUDE.md memory system: 4-tier hierarchy, @include directives, frontmatter conditionals.
 * Source: utils/claudemd.ts + skills/loadSkillsDir.ts (2,565 LOC)
 * KB: Section 17 — CLAUDE.md Memory System
 * Tier: Extract P1
 */

import * as path from "node:path";
import * as os from "node:os";

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

/**
 * Determine tier from file path.
 *
 * managed: /Library/Application Support/ClaudeCode/CLAUDE.md (system-wide)
 * user: ~/.claude/CLAUDE.md
 * local: ./.claude/CLAUDE.md (hidden dir in project)
 * project: ./CLAUDE.md (project root)
 */
function detectTier(filePath: string): MemoryTier {
  if (filePath.includes("/Library/Application Support/ClaudeCode")) {
    return "managed";
  }
  const home = os.homedir();
  if (filePath.startsWith(path.join(home, ".claude"))) {
    return "user";
  }
  if (filePath.includes("/.claude/CLAUDE.md")) {
    return "local";
  }
  return "project";
}

/**
 * Parse simple YAML-ish frontmatter from content.
 * Looks for --- delimited block at start of content.
 */
function parseFrontmatter(
  content: string,
): { frontmatter?: MemoryFrontmatter; body: string } {
  if (!content.startsWith("---")) {
    return { body: content };
  }
  const endIdx = content.indexOf("---", 3);
  if (endIdx === -1) {
    return { body: content };
  }
  const fmBlock = content.slice(3, endIdx).trim();
  const body = content.slice(endIdx + 3).trim();

  const frontmatter: MemoryFrontmatter = {};
  const pathsMatch = fmBlock.match(/paths:\s*\[([^\]]*)\]/);
  if (pathsMatch) {
    frontmatter.paths = pathsMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/['"]/g, ""))
      .filter(Boolean);
  }

  return { frontmatter, body };
}

/**
 * Get all memory files from the 4-tier hierarchy.
 * managed -> user -> project -> local (last = highest priority).
 *
 * In pattern lib: returns simulated 4-tier file list without real filesystem reads.
 */
export function getMemoryFiles(workingDirectory: string): MemoryFile[] {
  const home = os.homedir();
  const files: MemoryFile[] = [];

  // Tier 1: Managed (system-wide)
  const managedPath = "/Library/Application Support/ClaudeCode/CLAUDE.md";
  files.push({
    path: managedPath,
    tier: "managed",
    content: "# Managed CLAUDE.md",
  });

  // Tier 2: User
  const userPath = path.join(home, ".claude", "CLAUDE.md");
  files.push({
    path: userPath,
    tier: "user",
    content: "# User CLAUDE.md",
  });

  // Tier 3: Project
  const projectPath = path.join(workingDirectory, "CLAUDE.md");
  files.push({
    path: projectPath,
    tier: "project",
    content: "# Project CLAUDE.md",
  });

  // Tier 4: Local
  const localPath = path.join(workingDirectory, ".claude", "CLAUDE.md");
  files.push({
    path: localPath,
    tier: "local",
    content: "# Local CLAUDE.md",
  });

  return files;
}

/**
 * Get CLAUDE.md files traversing upward from startDir to root.
 * Returns array of CLAUDE.md paths found along the way.
 */
export function getClaudeMds(startDir: string): string[] {
  const results: string[] = [];
  let current = path.resolve(startDir);
  const root = path.parse(current).root;

  while (current !== root) {
    results.push(path.join(current, "CLAUDE.md"));
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return results;
}

/**
 * Process a single memory file: detect tier from path, parse frontmatter.
 * In pattern lib, uses simulated content since real filesystem is not available.
 */
export function processMemoryFile(filePath: string): MemoryFile {
  const tier = detectTier(filePath);
  const simulatedContent = `# ${tier.charAt(0).toUpperCase() + tier.slice(1)} CLAUDE.md\n\nLoaded from: ${filePath}`;
  const { frontmatter, body } = parseFrontmatter(simulatedContent);

  return {
    path: filePath,
    tier,
    content: body,
    frontmatter,
  };
}

/**
 * Resolve @include directives: @path, @./relative, @~/home, @/absolute.
 * Tracks circular references via visited set. Only text file types (~80+ extensions).
 *
 * In pattern lib: detects @include patterns and reports them without real file reads.
 */
export function resolveIncludes(
  content: string,
  basePath: string,
  visited?: Set<string>,
): IncludeResult {
  const includedPaths: string[] = [];
  const circularRefs: string[] = [];
  const visitedSet = visited ?? new Set<string>();

  // Pattern: lines starting with @ followed by a path
  const includePattern = /^@(.+)$/gm;
  let resolvedContent = content;
  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
  while ((match = includePattern.exec(content)) !== null) {
    const includePath = match[1].trim();
    let resolvedPath: string;

    if (includePath.startsWith("~/")) {
      resolvedPath = path.join(os.homedir(), includePath.slice(2));
    } else if (includePath.startsWith("/")) {
      resolvedPath = includePath;
    } else if (includePath.startsWith("./")) {
      resolvedPath = path.join(basePath, includePath);
    } else {
      resolvedPath = path.join(basePath, includePath);
    }

    if (visitedSet.has(resolvedPath)) {
      circularRefs.push(resolvedPath);
      continue;
    }

    visitedSet.add(resolvedPath);
    includedPaths.push(resolvedPath);
    resolvedContent = resolvedContent.replace(
      match[0],
      `[included: ${resolvedPath}]`,
    );
  }

  return { resolvedContent, includedPaths, circularRefs };
}
