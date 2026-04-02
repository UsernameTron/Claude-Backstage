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

// --- Functions ---

/**
 * Assembles a ToolPool by merging built-in and external tools,
 * then applying deny-rule filtering.
 * TODO: implement three-layer tool assembly from Section 6.2-6.3
 */
export function assembleToolPool(
  _builtInTools: Tool[],
  _externalTools: Tool[],
  _denyRules: string[],
): ToolPool {
  throw new Error(
    "TODO: implement three-layer tool assembly from Section 6.2-6.3",
  );
}

/**
 * Filters tools by deny rules, removing any tool whose name matches a rule.
 * TODO: implement deny-rule filtering from Section 6.3
 */
export function filterToolsByDenyRules(
  _tools: Tool[],
  _denyRules: string[],
): Tool[] {
  throw new Error("TODO: implement deny-rule filtering from Section 6.3");
}

/**
 * Sorts tools in deterministic order for prompt cache stability.
 * TODO: implement stable sort for cache key generation
 */
export function sortForCacheStability(_tools: Tool[]): Tool[] {
  throw new Error("TODO: implement stable sort for cache key generation");
}

/**
 * Registers a tool in the global tool registry.
 * TODO: implement global tool registration
 */
export function registerTool(_tool: Tool): void {
  throw new Error("TODO: implement global tool registration");
}

/**
 * Returns all registered tools from the global registry.
 * TODO: implement global tool retrieval
 */
export function getAllTools(): Tool[] {
  throw new Error("TODO: implement global tool retrieval");
}
