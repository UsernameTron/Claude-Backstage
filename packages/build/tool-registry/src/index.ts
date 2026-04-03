// tool-registry — Three-layer tool assembly and registry
// Source: Section 6.2-6.3 — compile-time elimination, runtime deny-rule
// filtering, merge built-in + external tools
// KB: Sections 6.2, 6.3

// --- Types & Interfaces ---

/**
 * A registered tool with its callable implementation and permission metadata.
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  call: (...args: unknown[]) => Promise<unknown>;
  permissions: string[];
}

/**
 * A pool of assembled tools with lookup and filtering capabilities.
 */
export interface ToolPool {
  tools: Tool[];
  getByName: (name: string) => Tool | undefined;
  filter: (predicate: (tool: Tool) => boolean) => Tool[];
}

/**
 * The three filtering layers applied during tool assembly:
 * - compile: static elimination of disabled tools at build time
 * - runtime_deny: dynamic deny-rule filtering per session/request
 * - assembly: final merge of built-in and external tools
 */
export type ToolFilterLayer = "compile" | "runtime_deny" | "assembly";

// --- Module-level registry ---

const registry: Tool[] = [];

/**
 * Reset the module-level registry (for test isolation).
 */
export function resetRegistry(): void {
  registry.length = 0;
}

// --- Functions ---

/**
 * Registers a tool in the global tool registry.
 */
export function registerTool(tool: Tool): void {
  registry.push(tool);
}

/**
 * Returns all registered tools from the global registry.
 */
export function getAllTools(): Tool[] {
  return [...registry];
}

/**
 * Filters tools by deny rules, removing any tool whose name matches a rule.
 */
export function filterToolsByDenyRules(
  tools: Tool[],
  denyRules: string[],
): Tool[] {
  return tools.filter((t) => !denyRules.includes(t.name));
}

/**
 * Sorts tools in deterministic order for prompt cache stability.
 */
export function sortForCacheStability(tools: Tool[]): Tool[] {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Assembles a ToolPool by merging built-in and external tools,
 * then applying deny-rule filtering.
 */
export function assembleToolPool(
  builtInTools: Tool[],
  externalTools: Tool[],
  denyRules: string[],
): ToolPool {
  const merged = [...builtInTools, ...externalTools];
  const filtered = filterToolsByDenyRules(merged, denyRules);
  const tools = sortForCacheStability(filtered);
  return {
    tools,
    getByName: (name: string) => tools.find((t) => t.name === name),
    filter: (predicate: (tool: Tool) => boolean) => tools.filter(predicate),
  };
}
