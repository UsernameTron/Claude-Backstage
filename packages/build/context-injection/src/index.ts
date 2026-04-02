// context-injection — Dual-position context injection for transformer attention optimization
// Source: context.ts + QueryEngine.ts (1,484 LOC)
// KB: Section 16

// --- Types & Interfaces ---

/**
 * Git-derived context injected at END of system prompt.
 * Positioned last for transformer recency bias — the model pays more
 * attention to tokens near the end of the system prompt.
 */
export interface SystemContext {
  gitBranch: string;
  mainBranch: string;
  gitUser: string;
  /** Truncated to 2000 chars to avoid prompt bloat */
  gitStatus: string;
  recentCommits: string[];
  cacheBreaker?: string;
}

/**
 * User-facing context injected as FIRST user message.
 * Positioned first to set the conversational frame — the model treats
 * early user messages as establishing context for the entire conversation.
 */
export interface UserContext {
  claudeMdContent: string | null;
  currentDate: string;
  additionalContext?: Record<string, string>;
}

/**
 * Specifies where context gets injected in the message stream.
 * - system_end: appended to system prompt (recency bias)
 * - first_user_message: prepended as first user message (conversational framing)
 */
export type InjectionPosition = "system_end" | "first_user_message";

/**
 * A fully resolved injection with content, target position, and wrapping config.
 */
export interface ContextInjection {
  content: string;
  position: InjectionPosition;
  wrapInSystemReminder: boolean;
}

// --- Functions ---

/**
 * Collects git status, branch, user, and recent commits.
 * Memoized — computed once per session. Injected at END of system prompt
 * for high positional attention weight (transformer recency bias).
 * TODO: build from context.ts + QueryEngine.ts
 */
export function getSystemContext(): SystemContext {
  throw new Error("TODO: build from context.ts + QueryEngine.ts");
}

/**
 * Collects CLAUDE.md content and current date.
 * Injected as FIRST user message wrapped in <system-reminder> tags
 * for conversational framing.
 * TODO: build from context.ts + QueryEngine.ts
 */
export function getUserContext(): UserContext {
  throw new Error("TODO: build from context.ts + QueryEngine.ts");
}

/**
 * Appends system context to the end of the system prompt string.
 * Exploits transformer recency bias — content at the end of the system
 * prompt receives higher attention weight during generation.
 * TODO: build from context.ts + QueryEngine.ts
 */
export function appendSystemContext(
  _systemPrompt: string,
  _context: SystemContext,
): string {
  throw new Error("TODO: build from context.ts + QueryEngine.ts");
}

/**
 * Prepends user context as the first user message with <system-reminder> wrapping.
 * Sets the conversational frame before any actual user messages, ensuring
 * CLAUDE.md directives and date context influence the entire conversation.
 * TODO: build from context.ts + QueryEngine.ts
 */
export function prependUserContext(
  _messages: unknown[],
  _context: UserContext,
): unknown[] {
  throw new Error("TODO: build from context.ts + QueryEngine.ts");
}

/**
 * Generates a cache breaker string for forced cache invalidation.
 * Used when system context changes mid-session require prompt cache eviction.
 * TODO: build from context.ts + QueryEngine.ts
 */
export function getSystemPromptInjection(): string | null {
  throw new Error("TODO: build from context.ts + QueryEngine.ts");
}

/**
 * Side-channel cache for YOLO classifier access to CLAUDE.md content.
 * Breaks circular dependency: classifier -> memory -> context -> classifier.
 * The classifier needs CLAUDE.md content to evaluate permission rules,
 * but loading it through the normal path would trigger context injection.
 * TODO: build from context.ts + QueryEngine.ts
 */
export function setCachedClaudeMdContent(
  _content: string | null,
): void {
  throw new Error("TODO: build from context.ts + QueryEngine.ts");
}
