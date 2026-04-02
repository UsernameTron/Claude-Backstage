/**
 * @claude-patterns/subprocess-env-scrubbing
 *
 * Prevents credential leakage to child processes in CI environments.
 * Source: utils/subprocessEnv.ts (99 LOC)
 * KB: Section 12.1 — Subprocess Environment Scrubbing
 * Tier: Extract P2
 */

// Complete list of environment variables scrubbed from child processes in CI
export const GHA_SUBPROCESS_SCRUB = [
  "ANTHROPIC_API_KEY",
  "CLAUDE_CODE_OAUTH_TOKEN",
  "ANTHROPIC_AUTH_TOKEN",
  "ANTHROPIC_FOUNDRY_API_KEY",
  "ANTHROPIC_CUSTOM_HEADERS",
  "OTEL_EXPORTER_OTLP_HEADERS",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_SESSION_TOKEN",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "AZURE_CLIENT_SECRET",
  "ACTIONS_ID_TOKEN_REQUEST_TOKEN",
  "ACTIONS_ID_TOKEN_REQUEST_URL",
  "ACTIONS_RUNTIME_TOKEN",
  "ACTIONS_RUNTIME_URL",
  "ALL_INPUTS",
  "SSH_SIGNING_KEY",
] as const;

// Returns sanitized env vars for child process spawning.
// GITHUB_TOKEN intentionally NOT scrubbed (task-scoped, auto-expiring).
export function subprocessEnv(): Record<string, string | undefined> {
  // TODO: extract from utils/subprocessEnv.ts
  throw new Error("TODO: extract from utils/subprocessEnv.ts");
}
