// prompt-system — System prompt assembly with static/dynamic boundary
// Source: constants/prompts.ts + systemPromptSections.ts (2,368 LOC)
// KB: Section 15

// --- Types & Interfaces ---

/**
 * Represents a single section of the system prompt.
 * Static sections are globally cacheable; dynamic sections change per-turn or per-org.
 */
export interface SystemPromptSection {
  id: string;
  content: string;
  type: "static" | "dynamic";
  cached: boolean;
}

/**
 * Configuration for system prompt assembly.
 * Controls output style, enabled tools, and cache scoping.
 */
export interface SystemPromptConfig {
  outputStyleConfig?: Record<string, unknown>;
  enabledTools?: string[];
  cacheScope?: "global" | "org" | null;
}

/**
 * Union of all dynamic section identifiers.
 * Dynamic sections appear below the cache boundary and are recomputed each turn.
 */
export type DynamicSectionType =
  | "session_guidance"
  | "memory"
  | "env_info_simple"
  | "language"
  | "output_style"
  | "mcp_instructions"
  | "scratchpad"
  | "frc"
  | "token_budget";

// --- Constants ---

/**
 * Marker string separating static (cacheable) sections from dynamic sections.
 * Everything above this boundary is included in the prompt cache key;
 * everything below is recomputed per-turn.
 */
export const SYSTEM_PROMPT_DYNAMIC_BOUNDARY =
  "--- DYNAMIC CONTENT BELOW ---";

// --- Functions ---

/**
 * Factory function for creating a SystemPromptSection.
 * Static sections (default) are cached; dynamic sections are not.
 */
export function systemPromptSection(
  id: string,
  content: string,
  type?: "static" | "dynamic",
): SystemPromptSection {
  const resolvedType = type || "static";
  return {
    id,
    content,
    type: resolvedType,
    cached: resolvedType !== "dynamic",
  };
}

/**
 * Filters null sections and returns their content strings.
 */
export function resolveSystemPromptSections(
  sections: SystemPromptSection[],
): string[] {
  return sections.map((s) => s.content);
}

/**
 * Returns the intro section, or null if output style overrides it.
 */
export function getSimpleIntroSection(
  outputStyleConfig?: Record<string, unknown>,
): SystemPromptSection | null {
  if (outputStyleConfig?.skipIntro) return null;
  return systemPromptSection(
    "intro",
    "You are Claude, an AI assistant by Anthropic.",
  );
}

/**
 * Returns the core system identity section.
 */
export function getSimpleSystemSection(): SystemPromptSection | null {
  return systemPromptSection(
    "system",
    "You are helpful, harmless, and honest.",
  );
}

/**
 * Returns the task execution guidance section.
 */
export function getSimpleDoingTasksSection(): SystemPromptSection | null {
  return systemPromptSection(
    "doing_tasks",
    "When completing tasks, break them into clear steps.",
  );
}

/**
 * Returns the actions/capabilities section.
 */
export function getActionsSection(): SystemPromptSection | null {
  return systemPromptSection(
    "actions",
    "You can read files, write files, and execute commands.",
  );
}

/**
 * Returns the tool usage guidance section filtered by enabled tools.
 */
export function getUsingYourToolsSection(
  enabledTools?: string[],
): SystemPromptSection | null {
  return systemPromptSection(
    "using_tools",
    "Available tools: " + (enabledTools?.join(", ") || "all tools"),
  );
}

/**
 * Returns the tone and style guidance section.
 */
export function getSimpleToneAndStyleSection(): SystemPromptSection | null {
  return systemPromptSection(
    "tone_style",
    "Be concise and direct. Avoid unnecessary preamble.",
  );
}

/**
 * Returns the output efficiency section.
 */
export function getOutputEfficiencySection(): SystemPromptSection | null {
  return systemPromptSection(
    "output_efficiency",
    "Minimize token usage while maintaining clarity.",
  );
}

/**
 * Determines whether global cache scope should be used based on org config.
 * Returns true by default — most deployments use global caching.
 */
export function shouldUseGlobalCacheScope(): boolean {
  return true;
}

/**
 * Assembles the full system prompt from static sections + boundary + dynamic sections.
 * Static sections appear above the cache boundary; dynamic sections below.
 * The boundary marker determines where the prompt cache key ends.
 */
export function getSystemPrompt(config?: SystemPromptConfig): string {
  const staticSections = [
    getSimpleIntroSection(config?.outputStyleConfig),
    getSimpleSystemSection(),
    getSimpleDoingTasksSection(),
    getActionsSection(),
    getUsingYourToolsSection(config?.enabledTools),
    getSimpleToneAndStyleSection(),
    getOutputEfficiencySection(),
  ].filter((s): s is SystemPromptSection => s !== null);

  const staticContent = resolveSystemPromptSections(staticSections).join(
    "\n\n",
  );
  const boundary = shouldUseGlobalCacheScope()
    ? `\n\n${SYSTEM_PROMPT_DYNAMIC_BOUNDARY}\n\n`
    : "\n\n";
  const dynamicContent = ""; // Dynamic sections are injected at runtime by context-injection
  return staticContent + boundary + dynamicContent;
}
