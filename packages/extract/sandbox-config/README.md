# @claude-patterns/sandbox-config

Sandbox configuration and self-referential security. Settings files are always denied write access, cryptographic nonce paths isolate sandboxed processes, and compound command decomposition prevents excluded-command bypass.

- **Source:** `utils/sandbox/` + `entrypoints/sandboxTypes.ts` (1,153 LOC)
- **KB:** Section 9
- **Tier:** Extract P2
- **Depends:** path-validation
- **Downstream:** none

## Key Pattern

Self-referential security ensures the sandbox configuration files themselves cannot be modified by sandboxed processes. The runtime config converter always appends deny rules for settings files, `.claude/skills`, and bare git repo files regardless of user configuration.

## Status

Working implementation. Exports `convertToSandboxRuntimeConfig()` (always appends self-referential deny rules for settings/skills/git files), `resolveSandboxFilesystemPath()`, `shouldUseSandbox()`, and `containsExcludedCommand()` (compound decomposition to prevent excluded-command bypass). Tests in `src/sandbox-config.test.ts`.
