# Requirements: claude-code-patterns

Generated: 2026-04-01

## Functional Requirements

### FR-1: Monorepo Infrastructure
| REQ | Description | Priority | Acceptance Criteria |
|-----|-------------|----------|-------------------|
| FR-1.1 | Bun workspace root with `@claude-patterns/` scope | P0 | `bun install` resolves all 28 TS packages |
| FR-1.2 | Shared tsconfig.base.json (strict, ES2022, Bun types) | P0 | All packages extend base config successfully |
| FR-1.3 | Makefile with scaffold-check, type-check, lint targets | P0 | `make scaffold-check` validates 31 packages |
| FR-1.4 | ARCHITECTURE.md with full ADR for Option B | P0 | Documents evaluation of 3 options against 6 criteria |
| FR-1.5 | dependency-graph.md with cross-package relationships | P1 | Shows all 6 dependency chains accurately |
| FR-1.6 | Biome v2 linter config for TS packages | P2 | `make lint` passes on all TS stubs |
| FR-1.7 | Ruff config for Python packages | P2 | Python linting passes on 3 translate packages |

### FR-2: Extract Tier (16 TypeScript Packages)
| REQ | Package | Priority | Key Exports |
|-----|---------|----------|-------------|
| FR-2.1 | permission-system | P0 | `hasPermissionsToUseTool`, `PermissionMode`, `PermissionRule`, `PermissionResult` |
| FR-2.2 | denial-tracking | P0 | Denial counter, adaptive fallback logic |
| FR-2.3 | yolo-classifier | P1 | `classifierDecision`, `classifierShared` types (depends: FR-2.1) |
| FR-2.4 | streaming-tool-executor | P1 | `StreamingToolExecutor` class with `addTool()`, `getCompletedResults()` |
| FR-2.5 | state-store | P2 | `Store<T>`, `createStore<T>()`, `DeepImmutable<T>` |
| FR-2.6 | auto-compact | P1 | `compactConversation()`, `CompactionResult` (depends: FR-2.7) |
| FR-2.7 | token-estimation | P1 | `countTokensWithAPI()`, `roughTokenCountEstimation()` |
| FR-2.8 | cost-tracker | P0 | `getStoredSessionCosts()`, `formatTotalCost()` |
| FR-2.9 | subprocess-env-scrubbing | P2 | Env scrubbing function (99 LOC) |
| FR-2.10 | config-migration | P2 | Migration runner, `CURRENT_MIGRATION_VERSION` |
| FR-2.11 | sandbox-config | P2 | `ISandboxManager`, `convertToSandboxRuntimeConfig()` (depends: FR-2.12) |
| FR-2.12 | path-validation | P2 | `validatePath()`, `isPathAllowed()`, `PathCheckResult` |
| FR-2.13 | dangerous-command-detection | P2 | `DANGEROUS_BASH_PATTERNS`, compound decomposition (depends: FR-2.1, FR-2.12) |
| FR-2.14 | read-only-validation | P2 | Read-only command allowlist and validation |
| FR-2.15 | analytics-killswitch | P3 | Event logger, killswitch check, telemetry sink |
| FR-2.16 | claudemd-memory | P1 | `getMemoryFiles()`, `getClaudeMds()`, `MAX_MEMORY_CHARACTER_COUNT` |

### FR-3: Build Tier (10 TypeScript Packages)
| REQ | Package | Priority | Key Exports |
|-----|---------|----------|-------------|
| FR-3.1 | prompt-system | P0 | `getSystemPrompt()`, `SystemPromptSection`, `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` |
| FR-3.2 | context-injection | P0 | `getSystemContext()`, `getUserContext()`, dual-position injection types |
| FR-3.3 | agent-dialogue-loop | P1 | `QueryEngine` class, `ask()` async generator (depends: FR-2.4, FR-2.5, FR-2.7) |
| FR-3.4 | vim-mode-fsm | P3 | `VimState`, `transition()`, operator/motion/textObject types |
| FR-3.5 | keyboard-shortcuts | P3 | `loadKeybindings()`, `resolveKey()`, `ParsedBinding` |
| FR-3.6 | ink-renderer | P3 | `render()`, `Ink` class, `Box`, `Text` components |
| FR-3.7 | skills-system | P1 | `getSkillDirCommands()`, `BundledSkillDefinition` (depends: FR-2.16) |
| FR-3.8 | mcp-integration | P2 | `connectToServer()`, `McpServerConfig` union type |
| FR-3.9 | multi-agent-coordinator | P1 | `isCoordinatorMode()`, `getCoordinatorSystemPrompt()` (depends: FR-3.8) |
| FR-3.10 | cli-startup-optimization | P2 | `main()`, `setup()`, lazy loading strategies |

### FR-4: Translate Tier (3 Python + 2 TypeScript)
| REQ | Package | Priority | Language | Key Exports |
|-----|---------|----------|----------|-------------|
| FR-4.1 | consecutive-breach-tracker | P0 | Python | `ConsecutiveBreachTracker` class, `record_breach()`, `get_action()` |
| FR-4.2 | ivr-call-flow-validator | P1 | TypeScript | `IVRNode`, `IVRCallFlow`, `validate()` | DONE |
| FR-4.3 | agent-skill-routing | P1 | Python | `RoutingRule`, `evaluate_rules()` -> deny/ask/allow | DONE |
| FR-4.4 | cost-per-interaction | P0 | Python | `ChannelCostAggregator`, `get_cost_per_contact()` |
| FR-4.5 | prompt-cache-optimizer | P0 | TypeScript | `optimizeCacheOrder()`, `CacheScope` enum |

### FR-5: Documentation
| REQ | Description | Priority | Acceptance Criteria |
|-----|-------------|----------|-------------------|
| FR-5.1 | CLAUDE.md under 2K tokens | P0 | Provides useful context when injected into Claude Code session |
| FR-5.2 | README.md with full 31-package inventory | P0 | Tier legend, priority matrix, quick start |
| FR-5.3 | Per-package README.md with source refs | P1 | Description, source paths, LOC, deps, KB section |
| FR-5.4 | docs/DEVOPS-HANDOFF.md | P1 | Environment, how to run, security, known debt |

## Non-Functional Requirements

| REQ | Description | Priority | Acceptance Criteria |
|-----|-------------|----------|-------------------|
| NFR-1 | `tsc --noEmit` passes all 28 TS packages | P0 | Zero compilation errors in strict mode |
| NFR-2 | `pip install -e` works for all 3 Python packages | P0 | Each Python package installs successfully |
| NFR-3 | Cross-package workspace imports resolve | P0 | `@claude-patterns/permission-system` importable from dependent packages |
| NFR-4 | Scaffold validation covers all 31 packages | P1 | Each has README.md + entry point + manifest |
| NFR-5 | No runtime code — type stubs only | P0 | All implementations are TODO comments |

## Out of Scope

- Runtime implementations beyond type stubs
- Unit/integration tests (no behavior to test)
- CI/CD pipelines (single-developer reference)
- npm registry publishing
- Claude Code source vendoring

## Dependency Map

```
FR-2.1 (permission-system) <- FR-2.3 (yolo-classifier)
FR-2.1 (permission-system) <- FR-2.13 (dangerous-command-detection)
FR-2.7 (token-estimation) <- FR-2.6 (auto-compact)
FR-2.12 (path-validation) <- FR-2.11 (sandbox-config)
FR-2.12 (path-validation) <- FR-2.13 (dangerous-command-detection)
FR-2.16 (claudemd-memory) <- FR-3.7 (skills-system)
FR-3.8 (mcp-integration) <- FR-3.9 (multi-agent-coordinator)
FR-2.4 + FR-2.5 + FR-2.7 <- FR-3.3 (agent-dialogue-loop)
```
