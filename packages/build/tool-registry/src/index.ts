/**
 * @claude-patterns/tool-registry
 *
 * Three-layer tool assembly: compile-time elimination, runtime deny-rule filtering,
 * and built-in/external merge with cache-stable ordering.
 *
 * @source Tool system + three-layer filtering (Section 6.2-6.3)
 * @kb Section 6 (Tool System), Section 6.3 (Three-Layer Tool Filtering)
 */

// Types & Interfaces

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  call: (...args: unknown[]) => unknown;
  permissions: string[];
}

export interface ToolPool {
  tools: Tool[];
  getByName(name: string): Tool | undefined;
  filter(predicate: (tool: Tool) => boolean): Tool[];
}

export type ToolFilterLayer = "compile" | "runtime_deny" | "assembly";

// Function stubs

export function assembleToolPool(
  _builtInTools: Tool[],
  _externalTools: Tool[],
  _denyRules: string[],
): ToolPool {
  throw new Error("TODO: build from three-layer tool filtering (Section 6.2-6.3)");
}

export function filterToolsByDenyRules(_tools: Tool[], _denyRules: string[]): Tool[] {
  throw new Error("TODO: build from three-layer tool filtering (Section 6.2-6.3)");
}

export function sortForCacheStability(_tools: Tool[]): Tool[] {
  throw new Error("TODO: build from cache-stable tool ordering (Section 6.3)");
}

export function registerTool(_tool: Tool): void {
  throw new Error("TODO: build from tool system (Section 6.2)");
}

export function getAllTools(): Tool[] {
  throw new Error("TODO: build from tool system (Section 6.2)");
}
