# @claude-patterns/subprocess-env-scrubbing

Prevents credential leakage to child processes in CI environments.

## Source Reference

- **Files:** `utils/subprocessEnv.ts`
- **LOC:** 99
- **KB Section:** 12.1 — Subprocess Environment Scrubbing
- **Tier:** Extract P2

## Key Concepts

- **Scrub list** — 16 environment variables removed from child process environments
- **GITHUB_TOKEN exception** — Intentionally NOT scrubbed because it is task-scoped and auto-expiring
- **CI-focused** — Primary defense against credential leakage in GitHub Actions

## Exports

- `GHA_SUBPROCESS_SCRUB` — Readonly array of env var names to scrub
- `subprocessEnv()` — Returns sanitized env vars for child process spawning

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** None
