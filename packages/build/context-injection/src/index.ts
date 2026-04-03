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

// --- Module State ---

let cachedSystemContext: SystemContext | null = null;
let cachedClaudeMd: string | null = null;

// --- Functions ---

/**
 * Side-channel cache for YOLO classifier access to CLAUDE.md content.
 * Breaks circular dependency: classifier -> memory -> context -> classifier.
 */
export function setCachedClaudeMdContent(
  content: string | null,
): void {
  cachedClaudeMd = content;
}

/**
 * Collects CLAUDE.md content and current date.
 * Injected as FIRST user message wrapped in <system-reminder> tags
 * for conversational framing.
 */
export function getUserContext(): UserContext {
  return {
    claudeMdContent: cachedClaudeMd,
    currentDate: new Date().toISOString().split("T")[0],
  };
}

/**
 * Collects git status, branch, user, and recent commits.
 * Memoized — computed once per session. Injected at END of system prompt
 * for high positional attention weight (transformer recency bias).
 */
export function getSystemContext(): SystemContext {
  if (cachedSystemContext) return cachedSystemContext;
  try {
    const run = (cmd: string[]): string => {
      const result = Bun.spawnSync(cmd);
      return result.stdout?.toString().trim() || "";
    };
    cachedSystemContext = {
      gitBranch: run(["git", "branch", "--show-current"]) || "unknown",
      mainBranch:
        run(["git", "rev-parse", "--abbrev-ref", "origin/HEAD"]).replace(
          "origin/",
          "",
        ) || "main",
      gitUser: run(["git", "config", "user.name"]) || "unknown",
      gitStatus: run(["git", "status", "--short"]).slice(0, 2000),
      recentCommits: run(["git", "log", "--oneline", "-5"])
        .split("\n")
        .filter(Boolean),
    };
  } catch {
    cachedSystemContext = {
      gitBranch: "unknown",
      mainBranch: "main",
      gitUser: "unknown",
      gitStatus: "",
      recentCommits: [],
    };
  }
  return cachedSystemContext;
}

/**
 * Appends system context to the end of the system prompt string.
 * Exploits transformer recency bias — content at the end of the system
 * prompt receives higher attention weight during generation.
 */
export function appendSystemContext(
  systemPrompt: string,
  context: SystemContext,
): string {
  const lines = [
    `Current branch: ${context.gitBranch}`,
    `Main branch: ${context.mainBranch}`,
    `Git user: ${context.gitUser}`,
    `Status: ${context.gitStatus}`,
    `Recent commits: ${context.recentCommits.join(", ")}`,
  ];
  if (context.cacheBreaker) lines.push(context.cacheBreaker);
  return `${systemPrompt}\n\n${lines.join("\n")}`;
}

/**
 * Prepends user context as the first user message with <system-reminder> wrapping.
 * Sets the conversational frame before any actual user messages, ensuring
 * CLAUDE.md directives and date context influence the entire conversation.
 */
export function prependUserContext(
  messages: unknown[],
  context: UserContext,
): unknown[] {
  const parts: string[] = [];
  if (context.claudeMdContent) parts.push(context.claudeMdContent);
  parts.push(`Current date: ${context.currentDate}`);
  if (context.additionalContext) {
    for (const [key, value] of Object.entries(context.additionalContext)) {
      parts.push(`${key}: ${value}`);
    }
  }
  const reminderContent = `<system-reminder>\n${parts.join("\n")}\n</system-reminder>`;
  const reminderMessage = { role: "user", content: reminderContent };
  return [reminderMessage, ...messages];
}

/**
 * Generates a cache breaker string for forced cache invalidation.
 * Used when system context changes mid-session require prompt cache eviction.
 * Returns null by default — cache breaking is opt-in.
 */
export function getSystemPromptInjection(): string | null {
  return null;
}
