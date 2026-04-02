# External Integrations

**Analysis Date:** 2026-04-02

## APIs & External Services

**None.** This is a type-stub reference monorepo. All packages contain interface definitions, type stubs, and TODO placeholders. No packages make external API calls or connect to services.

## Source Reference: Claude Code Subsystems

The type stubs model interfaces for 43 Claude Code subsystems. These are design references, not live integrations:

**Permission & Security:**
- `packages/extract/permission-system/` — Models Claude Code's permission rule evaluation
- `packages/extract/sandbox-config/` — Models sandbox isolation configuration
- `packages/extract/dangerous-command-detection/` — Models bash command safety patterns
- `packages/extract/path-validation/` — Models file path security validation
- `packages/extract/subprocess-env-scrubbing/` — Models environment variable sanitization

**State & Session:**
- `packages/extract/state-store/` — Models session state persistence
- `packages/extract/cost-tracker/` — Models token cost tracking
- `packages/extract/denial-tracking/` — Models permission denial counters
- `packages/extract/analytics-killswitch/` — Models telemetry toggle

**AI/LLM Interface:**
- `packages/build/prompt-system/` — Models system prompt assembly
- `packages/build/context-injection/` — Models dual-position context injection
- `packages/build/agent-dialogue-loop/` — Models streaming tool execution loop
- `packages/build/multi-agent-coordinator/` — Models subagent orchestration
- `packages/build/mcp-integration/` — Models MCP server protocol stubs
- `packages/build/streaming-tool-executor/` — Models streaming tool execution (extract tier: `packages/extract/streaming-tool-executor/`)

**UI/CLI:**
- `packages/build/ink-renderer/` — Models React Ink terminal UI
- `packages/build/keyboard-shortcuts/` — Models key binding system
- `packages/build/vim-mode-fsm/` — Models Vim mode state machine
- `packages/build/cli-startup-optimization/` — Models startup performance patterns
- `packages/build/voice-input-gating/` — Models voice input handling
- `packages/build/onboarding-flow-engine/` — Models first-run onboarding

**Contact Center Translations (Python):**
- `packages/translate/consecutive-breach-tracker/` — SLA breach detection adapted from denial tracking
- `packages/translate/cost-per-interaction/` — Channel cost aggregation adapted from cost tracker
- `packages/translate/agent-skill-routing/` — Skill-based routing adapted from permissions
- `packages/translate/workforce-scheduling-coordinator/` — Scheduling adapted from multi-agent coordinator

## Data Storage

**Databases:** None (type stubs only)
**File Storage:** Local filesystem only (source files)
**Caching:** None

## Authentication & Identity

Not applicable — no runtime, no auth.

## Monitoring & Observability

**Error Tracking:** None
**Logs:** None (reference-only codebase)

## CI/CD & Deployment

**Hosting:** Not deployed — local development reference repo
**CI Pipeline:** None detected (no `.github/workflows/`, no CI config files)

## Environment Configuration

**Required env vars:** None
**Secrets:** None — `.env` files are not present

## Webhooks & Callbacks

**Incoming:** None
**Outgoing:** None

## Third-Party Package Dependencies

**TypeScript (dev only):**
| Package | Version | Purpose |
|---------|---------|---------|
| `@biomejs/biome` | ^2.4.10 | Linting and formatting |
| `bun-types` | ^1.3.11 | Bun runtime type definitions |
| `typescript` | ^6.0.2 | Type checking (`tsc --noEmit`) |

**Python (build only):**
| Package | Version | Purpose |
|---------|---------|---------|
| `setuptools` | >=68.0 | Package build backend |

**No runtime dependencies exist anywhere in the monorepo.** All 43 packages are self-contained type stubs with zero external imports.

## MCP Servers

No `.mcp.json` file present. No MCP server configuration detected.

The `packages/build/mcp-integration/` package models MCP protocol types as stubs but does not connect to any MCP server.

## Inter-Package Dependencies (Design-Time)

These are architectural dependencies documented in CLAUDE.md — not enforced by package managers:

```
permission-system <- yolo-classifier, dangerous-command-detection
token-estimation  <- auto-compact
path-validation   <- sandbox-config, dangerous-command-detection
claudemd-memory   <- skills-system
mcp-integration   <- multi-agent-coordinator
streaming-tool-executor + state-store + token-estimation <- agent-dialogue-loop
```

No `dependencies` or `peerDependencies` fields exist in any `package.json`. These relationships are design documentation for future implementation.

---

*Integration audit: 2026-04-02*
