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
 * Assembles the full system prompt from static sections + boundary + dynamic sections.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function getSystemPrompt(_config?: SystemPromptConfig): string {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Factory function for creating a SystemPromptSection.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function systemPromptSection(
  _id: string,
  _content: string,
  _type?: "static" | "dynamic",
): SystemPromptSection {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Filters null sections and returns their content strings.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function resolveSystemPromptSections(
  _sections: SystemPromptSection[],
): string[] {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Returns the intro section, or null if output style overrides it.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function getSimpleIntroSection(
  _outputStyleConfig?: Record<string, unknown>,
): SystemPromptSection | null {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Returns the core system identity section.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function getSimpleSystemSection(): SystemPromptSection | null {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Returns the task execution guidance section.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function getSimpleDoingTasksSection(): SystemPromptSection | null {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Returns the actions/capabilities section.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function getActionsSection(): SystemPromptSection | null {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Returns the tool usage guidance section filtered by enabled tools.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function getUsingYourToolsSection(
  _enabledTools?: string[],
): SystemPromptSection | null {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Returns the tone and style guidance section.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function getSimpleToneAndStyleSection(): SystemPromptSection | null {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Returns the output efficiency section.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function getOutputEfficiencySection(): SystemPromptSection | null {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}

/**
 * Determines whether global cache scope should be used based on org config.
 * TODO: build from constants/prompts.ts + systemPromptSections.ts
 */
export function shouldUseGlobalCacheScope(): boolean {
  throw new Error(
    "TODO: build from constants/prompts.ts + systemPromptSections.ts",
  );
}
