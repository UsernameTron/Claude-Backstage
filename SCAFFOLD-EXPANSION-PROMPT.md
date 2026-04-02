# Scaffold Expansion: Add 12 Missing Packages (#32–#43)

## Instructions for Claude Code

You are expanding the `claude-code-patterns` monorepo from 31 packages to 43 packages. The 12 new packages were identified from a gap analysis of the Knowledge Base v2.1 against the existing scaffold. Every new package follows the exact same stub pattern as the existing 31.

**CRITICAL RULES:**
- Do NOT modify any existing package. Only create new directories and files.
- Do NOT implement any logic. Every function body must throw `new Error("TODO: ...")` or `raise NotImplementedError("TODO: ...")`.
- Match the exact file structure, naming, and formatting conventions of existing packages.
- After creating all packages, update the root config files (listed at the bottom).

---

## Reference: Existing Conventions

### TypeScript Package Structure
```
packages/{tier}/{name}/
├── README.md
├── package.json          # { "name": "@claude-patterns/{name}", "version": "0.0.0", "private": true, "main": "src/index.ts", "types": "src/index.ts" }
├── tsconfig.json         # { "extends": "../../../tsconfig.base.json", "compilerOptions": { "rootDir": "src", "outDir": "dist" }, "include": ["src"] }
└── src/
    └── index.ts          # JSDoc header → types/interfaces → constants → function stubs (all throw Error("TODO: ..."))
```

### Python Package Structure
```
packages/translate/{name}/
├── README.md
├── pyproject.toml        # name: "claude-patterns-{name}", version: "0.0.0", requires-python: ">=3.11"
└── src/
    └── {name_underscored}/
        └── __init__.py   # Module docstring → imports → types/dataclasses → class stubs (all raise NotImplementedError)
```

### README.md Format
```markdown
# @claude-patterns/{name}

One-sentence description.

## Tier

**{Extract|Build|Translate}** — {tier description}.

## Priority

**{P1|P2|P3}** — {priority rationale}.

## Source {Pattern|Reference}

- **Source file**: `{path}` ({LOC} LOC)
- **KB sections**: Section {N} — {title}

## {Domain Translation table if Translate tier}

## Exports

- `ExportName` — Description

## Dependencies

{None or list of @claude-patterns/ dependencies}

## Status

Type stubs only. {All functions throw|All methods raise} `{Error|NotImplementedError}`.
```

---

## Package #32: workforce-scheduling-coordinator

**Tier:** Translate (Python)
**Priority:** P1
**Source Pattern:** Multi-agent coordinator (Section 24, Pattern from coordinator/coordinatorMode.ts 369 LOC)
**KB Sections:** Section 24 (Multi-Agent Orchestration), Section 43 (Contact Center — Workforce scheduling)

### Domain Translation

| Claude Code Concept | WFM Concept |
|---------------------|-------------|
| Coordinator mode | Scheduling engine |
| Sub-agent (AgentTool) | Specialist worker (forecaster, scheduler, adherence monitor) |
| Task dispatch | Scheduling job dispatch (generate forecast, optimize shifts, check adherence) |
| XML task-notification | Job completion callback with results |
| Scratchpad directory | Shared schedule context (demand forecast shared across workers) |

### Exports

- `SchedulingCoordinator` — Main coordinator class. Dispatches jobs to specialist workers.
- `SchedulingJob` — Dataclass: job_id, job_type, status, parameters, result
- `JobType` — Enum: FORECAST, OPTIMIZE_SHIFTS, CHECK_ADHERENCE, GENERATE_REPORT, INTRADAY_REBALANCE
- `WorkerResult` — Dataclass: worker_id, job_id, status, output, duration_seconds
- `CoordinatorConfig` — Dataclass: max_concurrent_workers, job_timeout_seconds

### Methods on SchedulingCoordinator

- `__init__(config: CoordinatorConfig)` → NotImplementedError
- `dispatch_job(job: SchedulingJob) -> WorkerResult` → NotImplementedError
- `get_active_jobs() -> list[SchedulingJob]` → NotImplementedError
- `cancel_job(job_id: str) -> bool` → NotImplementedError
- `get_shared_context() -> dict` → NotImplementedError

### File: `packages/translate/workforce-scheduling-coordinator/src/workforce_scheduling_coordinator/__init__.py`

---

## Package #33: genesys-flow-security-validator

**Tier:** Translate (TypeScript)
**Priority:** P1
**Source Pattern:** Security audit patterns (Sections 8–10, Section 38 Threat Model)
**KB Sections:** Section 8 (Permission System), Section 9 (Sandbox), Section 10 (File System Security), Section 38 (Threat Model), Section 43 (Genesys flow security)

### Domain Translation

| Claude Code Concept | Genesys Architect Concept |
|---------------------|--------------------------|
| Permission check chain (deny→ask→allow) | Flow validation rule chain |
| Dangerous command patterns | Dangerous flow patterns (open transfer, unvalidated external data) |
| Path validation (traversal, injection) | Data action URL validation |
| Sandbox write deny list | Protected flow element deny list (production queues, trunk configs) |
| Threat model attack vectors | Architect flow vulnerability patterns |

### Exports

- `FlowValidationRule` — Interface: id, severity, check function, description
- `FlowVulnerability` — Interface: ruleId, severity, nodeId, flowName, description, remediation
- `FlowValidationResult` — Interface: valid, vulnerabilities, checkedRules, flowName
- `ValidationSeverity` — Type: "critical" | "warning" | "info"
- `validateFlow(flow: ArchitectFlow): FlowValidationResult` → throws TODO
- `getBuiltInRules(): FlowValidationRule[]` → throws TODO (returns rules for: open transfers, unvalidated data actions, missing error handling, infinite loop detection, PII exposure in logs, unauthorized queue routing)
- `ArchitectFlow` — Interface: id, name, type, nodes, edges, version
- `ArchitectNode` — Interface: id, type, label, properties, outgoingEdges

### File: `packages/translate/genesys-flow-security-validator/src/index.ts`

---

## Package #34: multi-step-ivr-input-validator

**Tier:** Translate (TypeScript)
**Priority:** P2
**Source Pattern:** Compound command decomposition (Section 8.6, Pattern 8)
**KB Sections:** Section 8.6 (Compound Command Decomposition), Section 43 (Multi-step IVR input)

### Domain Translation

| Claude Code Concept | IVR Concept |
|---------------------|-------------|
| Compound command (`cmd1 && cmd2`) | Multi-step DTMF sequence (press 1, then 3, then 2) |
| Subcommand decomposition | Step-by-step input decomposition |
| Per-subcommand validation | Per-step DTMF validation against current menu state |
| Injection detection (`safe && evil`) | Invalid sequence detection (valid step 1, invalid step 2) |
| Pattern: validate each independently | Pattern: validate each DTMF against the node it reaches |

### Exports

- `DTMFSequence` — Interface: steps (DTMFStep[]), entryNodeId
- `DTMFStep` — Interface: input, expectedNodeId, actualNodeId
- `SequenceValidationResult` — Interface: valid, failedAtStep, steps, reachableEndpoint
- `validateSequence(flow: IVRCallFlow, sequence: string[]): SequenceValidationResult` → throws TODO
- `decomposeInput(rawInput: string): string[]` → throws TODO (splits "1,3,2" or "1-3-2" into individual steps)
- `generateAllSequences(flow: IVRCallFlow, maxDepth?: number): DTMFSequence[]` → throws TODO (enumerate all paths)
- `findDeadEndSequences(flow: IVRCallFlow): DTMFSequence[]` → throws TODO

Note: This package imports types from `@claude-patterns/ivr-call-flow-validator` (IVRCallFlow, IVRNode).

### File: `packages/translate/multi-step-ivr-input-validator/src/index.ts`

---

## Package #35: tool-schema-cache

**Tier:** Build (TypeScript)
**Priority:** P2
**Source Pattern:** Tool schema caching (Section 21.3)
**KB Sections:** Section 21.3 (Tool Schema Caching), Section 6.3 (Cache-Stable Tool Ordering)

### Architecture

API tool schemas are cached per-session to prevent prompt jitter. When feature flags flip mid-session, tools may appear/disappear. Without caching, every tool list change invalidates the entire prompt cache downstream. The cache freezes the tool schema set at session start and only updates on explicit refresh.

### Exports

- `ToolSchemaCache` — Class: manages cached tool schemas
- `CachedToolSchema` — Interface: name, description, inputSchema, cachedAt
- `CachePolicy` — Type: "freeze_on_start" | "refresh_on_change" | "manual"
- `ToolSchemaCache.get(toolName: string): CachedToolSchema | undefined` → throws TODO
- `ToolSchemaCache.set(toolName: string, schema: CachedToolSchema): void` → throws TODO
- `ToolSchemaCache.refresh(tools: Tool[]): void` → throws TODO
- `ToolSchemaCache.invalidate(): void` → throws TODO
- `ToolSchemaCache.getStableSchemaList(): CachedToolSchema[]` → throws TODO (returns schemas in deterministic order)

### File: `packages/build/tool-schema-cache/src/index.ts`

---

## Package #36: tool-registry

**Tier:** Build (TypeScript)
**Priority:** P2
**Source Pattern:** Tool system + three-layer filtering (Section 6.2–6.3)
**KB Sections:** Section 6 (Tool System), Section 6.3 (Three-Layer Tool Filtering)

### Architecture

Three-layer tool assembly: compile-time elimination (feature flags) → runtime deny-rule filtering → merge built-in + external tools. The `assembleToolPool()` pattern ensures built-in tools are a sorted contiguous prefix for cache stability, with external (MCP) tools appended after.

### Exports

- `Tool` — Interface: name, description, inputSchema, call, permissions
- `ToolPool` — Interface: tools, getByName, filter
- `ToolFilterLayer` — Type: "compile" | "runtime_deny" | "assembly"
- `assembleToolPool(builtInTools: Tool[], externalTools: Tool[], denyRules: string[]): ToolPool` → throws TODO
- `filterToolsByDenyRules(tools: Tool[], denyRules: string[]): Tool[]` → throws TODO
- `sortForCacheStability(tools: Tool[]): Tool[]` → throws TODO (built-in prefix, external suffix, deterministic within each group)
- `registerTool(tool: Tool): void` → throws TODO
- `getAllTools(): Tool[]` → throws TODO

### File: `packages/build/tool-registry/src/index.ts`

---

## Package #37: dialogue-history-manager

**Tier:** Build (TypeScript)
**Priority:** P2
**Source Pattern:** Dialogue history management (Section 19)
**KB Sections:** Section 19 (Multi-Round Dialogue History Management), Section 18.3 (200K Token Handling)

### Architecture

Manages the full message lifecycle: message types (User, Assistant, Attachment, System, CompactBoundary, ToolUseSummary, Progress), persistence to JSONL, transcript write-before-response for crash safety, large paste external storage via hash, image caching, and `getMessagesAfterCompactBoundary()` for effective message windowing.

### Exports

- `MessageType` — Type union: "user" | "assistant" | "attachment" | "system" | "compact_boundary" | "tool_use_summary" | "progress"
- `DialogueMessage` — Interface: type, content, timestamp, metadata
- `CompactBoundaryMessage` — Interface: extends DialogueMessage with summary, originalMessageCount
- `HistoryConfig` — Interface: maxRecords (default 100), storePath, externalStorageThreshold
- `DialogueHistoryManager` — Class
- `DialogueHistoryManager.addMessage(msg: DialogueMessage): void` → throws TODO
- `DialogueHistoryManager.getMessagesAfterCompactBoundary(): DialogueMessage[]` → throws TODO
- `DialogueHistoryManager.persist(): void` → throws TODO (write-before-response pattern)
- `DialogueHistoryManager.loadFromDisk(path: string): DialogueMessage[]` → throws TODO
- `DialogueHistoryManager.getEffectiveMessages(): DialogueMessage[]` → throws TODO
- `DialogueHistoryManager.insertCompactBoundary(summary: string): void` → throws TODO

### File: `packages/build/dialogue-history-manager/src/index.ts`

---

## Package #38: system-reminder-injection

**Tier:** Build (TypeScript)
**Priority:** P2
**Source Pattern:** System reminder mechanism (Section 20)
**KB Sections:** Section 20 (System Reminder Mechanism)

### Architecture

`<system-reminder>` tags are injected into user messages, tool results, and attachment messages. Sources include: user context injection, tool results, TodoWrite reminders, deferred tool notifications, and MCP connection status changes. The system prompt instructs the model that these tags are automatically added and bear no direct relation to the messages in which they appear.

### Exports

- `SystemReminderSource` — Type: "user_context" | "tool_result" | "attachment" | "todo_write" | "deferred_tools" | "mcp_status"
- `SystemReminder` — Interface: source, content, targetMessageIndex
- `ReminderInjectionConfig` — Interface: wrapInTags (boolean), tagName (default "system-reminder")
- `injectReminder(message: string, reminder: SystemReminder): string` → throws TODO
- `wrapInReminderTags(content: string, tagName?: string): string` → throws TODO
- `extractReminders(message: string): SystemReminder[]` → throws TODO (parse existing reminders from message text)
- `shouldInjectReminder(source: SystemReminderSource, turnCount: number): boolean` → throws TODO

### File: `packages/build/system-reminder-injection/src/index.ts`

---

## Package #39: plugin-lifecycle-manager

**Tier:** Build (TypeScript)
**Priority:** P2
**Source Pattern:** Plugin system lifecycle (Section 25)
**KB Sections:** Section 25 (Plugin System)

### Architecture

Four-phase lifecycle: Discovery (`getPluginSeedDirs()`) → Cache (`loadAllPluginsCacheOnly()`) → Cleanup (`cleanupOrphanedPluginVersionsInBackground()`) → Telemetry (`logPluginsEnabledForSession()`). Manages plugin installation, versioning, cache invalidation, and session-level activation tracking.

### Exports

- `PluginManifest` — Interface: name, version, description, skills, mcpServers, hooks
- `PluginState` — Type: "discovered" | "cached" | "active" | "orphaned" | "error"
- `PluginLifecycleConfig` — Interface: seedDirs, cacheDir, maxCacheAge
- `PluginLifecycleManager` — Class
- `PluginLifecycleManager.discover(): PluginManifest[]` → throws TODO
- `PluginLifecycleManager.loadFromCache(): PluginManifest[]` → throws TODO
- `PluginLifecycleManager.cleanupOrphaned(): Promise<number>` → throws TODO (returns count removed)
- `PluginLifecycleManager.logSessionPlugins(active: PluginManifest[]): void` → throws TODO
- `PluginLifecycleManager.getState(pluginName: string): PluginState` → throws TODO
- `PluginLifecycleManager.activate(pluginName: string): void` → throws TODO

### File: `packages/build/plugin-lifecycle-manager/src/index.ts`

---

## Package #40: sdk-bridge

**Tier:** Build (TypeScript)
**Priority:** P3
**Source Pattern:** Server and SDK mode (Section 26)
**KB Sections:** Section 26 (Server and SDK Mode)

### Architecture

WebSocket-based session management for SDK/Direct Connect mode. `DirectConnectSessionManager` handles NDJSON message framing, SDKMessage dispatch, and `control_request` permission prompts. REPL bridge connects local instance to remote Claude.ai with optional `replBridgeOutboundOnly` mode.

### Exports

- `SDKMessage` — Interface: type, payload, messageId
- `SessionConfig` — Interface: mode ("sdk" | "direct_connect" | "repl_bridge"), connectionUrl, outboundOnly
- `ControlRequest` — Interface: requestId, action, description, requiresApproval
- `SDKBridge` — Class
- `SDKBridge.connect(config: SessionConfig): Promise<void>` → throws TODO
- `SDKBridge.send(message: SDKMessage): void` → throws TODO
- `SDKBridge.onMessage(handler: (msg: SDKMessage) => void): void` → throws TODO
- `SDKBridge.handleControlRequest(request: ControlRequest): Promise<boolean>` → throws TODO
- `SDKBridge.disconnect(): void` → throws TODO

### File: `packages/build/sdk-bridge/src/index.ts`

---

## Package #41: voice-input-gating

**Tier:** Build (TypeScript)
**Priority:** P3
**Source Pattern:** Voice input system (Section 34)
**KB Sections:** Section 34 (Voice Input System)

### Architecture

Three-layer feature gating: remote flag check (GrowthBook kill switch) → authentication check (OAuth token for Claude.ai voice_stream endpoint) → runtime composite check (combines flag + auth + platform support). Demonstrates the pattern of layered feature gates where each layer is independently controllable.

### Exports

- `GateLayer` — Type: "remote_flag" | "authentication" | "runtime"
- `GateResult` — Interface: allowed, deniedBy (GateLayer | null), reason
- `VoiceGatingConfig` — Interface: featureFlagKey, requiredAuthType, supportedPlatforms
- `checkVoiceGating(config: VoiceGatingConfig): GateResult` → throws TODO
- `checkRemoteFlag(flagKey: string): boolean` → throws TODO
- `checkAuthentication(requiredType: string): boolean` → throws TODO
- `checkRuntimeSupport(platform: string): boolean` → throws TODO
- `compositeGateCheck(gates: GateLayer[]): GateResult` → throws TODO (check all layers in order, fail fast)

### File: `packages/build/voice-input-gating/src/index.ts`

---

## Package #42: output-style-system

**Tier:** Build (TypeScript)
**Priority:** P3
**Source Pattern:** Output styles and markdown rendering (Section 35)
**KB Sections:** Section 35 (Output Styles and Markdown Rendering)

### Architecture

Custom output styles loaded from user/project directories with frontmatter config. LRU token cache (500 entries) for rendered markdown. Plain-text fast path checks first 500 characters for markdown syntax before invoking the full parser, saving ~3ms per render.

### Exports

- `OutputStyle` — Interface: name, description, keepCodingInstructions, forceForPlugin, content
- `OutputStyleConfig` — Interface: userStyleDir, projectStyleDir
- `MarkdownCacheConfig` — Interface: maxEntries (default 500), sampleSize (default 500)
- `loadOutputStyles(config: OutputStyleConfig): OutputStyle[]` → throws TODO
- `applyOutputStyle(content: string, style: OutputStyle): string` → throws TODO
- `isPlainText(content: string, sampleSize?: number): boolean` → throws TODO (fast path check)
- `createMarkdownCache(config?: MarkdownCacheConfig): MarkdownCache` → throws TODO
- `MarkdownCache` — Interface: get, set, has, clear, size

### File: `packages/build/output-style-system/src/index.ts`

---

## Package #43: onboarding-flow-engine

**Tier:** Build (TypeScript)
**Priority:** P3
**Source Pattern:** Onboarding flow (Section 36)
**KB Sections:** Section 36 (Onboarding Flow)

### Architecture

Dynamic multi-step onboarding with conditional assembly. Steps: `preflight` → `theme` → `oauth` → `api-key` → `security` → `terminal-setup`. Steps are dynamically assembled based on authentication method and environment — not all steps run for all users. The pattern is a configurable step pipeline where each step can conditionally skip based on runtime state.

### Exports

- `OnboardingStep` — Interface: id, label, execute (async function), shouldSkip (predicate), dependsOn (step ids)
- `OnboardingConfig` — Interface: steps, authMethod, environment
- `OnboardingState` — Interface: currentStep, completedSteps, skippedSteps, errors
- `StepResult` — Interface: success, nextStep (override), error
- `OnboardingFlowEngine` — Class
- `OnboardingFlowEngine.assembleSteps(config: OnboardingConfig): OnboardingStep[]` → throws TODO
- `OnboardingFlowEngine.runStep(step: OnboardingStep): Promise<StepResult>` → throws TODO
- `OnboardingFlowEngine.run(): Promise<OnboardingState>` → throws TODO (runs all assembled steps in order)
- `OnboardingFlowEngine.getState(): OnboardingState` → throws TODO
- `OnboardingFlowEngine.skipTo(stepId: string): void` → throws TODO

### File: `packages/build/onboarding-flow-engine/src/index.ts`

---

## Root Configuration Updates

After scaffolding all 12 new packages, update these files:

### 1. `Makefile` — Add to package lists

```makefile
# UPDATE these lines:
BUILD_PKGS := prompt-system context-injection agent-dialogue-loop \
  skills-system multi-agent-coordinator mcp-integration vim-mode-fsm \
  keyboard-shortcuts ink-renderer cli-startup-optimization \
  tool-schema-cache tool-registry dialogue-history-manager \
  system-reminder-injection plugin-lifecycle-manager sdk-bridge \
  voice-input-gating output-style-system onboarding-flow-engine

TRANSLATE_TS_PKGS := ivr-call-flow-validator prompt-cache-optimizer \
  genesys-flow-security-validator multi-step-ivr-input-validator

TRANSLATE_PY_PKGS := consecutive-breach-tracker cost-per-interaction \
  agent-skill-routing workforce-scheduling-coordinator

# UPDATE the list-packages target echo lines:
# "=== Build Tier (19 TS) ==="
# "=== Translate Tier (4 TS + 4 Python) ==="
# "43 packages total (35 TS + 4 Python) [was 28 TS + 3 Python]"
# Note: extract stays at 16
```

### 2. `package.json` — Add new TS translate packages to workspaces

```json
{
  "workspaces": [
    "packages/extract/*",
    "packages/build/*",
    "packages/translate/ivr-call-flow-validator",
    "packages/translate/prompt-cache-optimizer",
    "packages/translate/genesys-flow-security-validator",
    "packages/translate/multi-step-ivr-input-validator"
  ]
}
```

Python packages (`workforce-scheduling-coordinator`) are NOT added to Bun workspaces.

### 3. `CLAUDE.md` — Update counts and add new packages

```markdown
# claude-code-patterns

Type-stub monorepo for 43 Claude Code subsystems. Build reference only — no implementations.

## Tiers

- **extract/** (16 TS) — Copy, adapt, ship. Direct extraction targets from source.
- **build/** (19 TS) — Design reference. Architectural patterns for new builds.
- **translate/** (8 mixed) — New builds from pattern adaptation. 4 Python + 4 TypeScript.
```

Add to Dependencies section:
```
ivr-call-flow-validator <- multi-step-ivr-input-validator
```

### 4. `dependency-graph.md` — Add new dependency chain

```markdown
### ivr-call-flow-validator

\`\`\`
ivr-call-flow-validator
  <- multi-step-ivr-input-validator
\`\`\`

Multi-step IVR input validator imports IVRCallFlow and IVRNode types from the call flow validator.
```

Add all 11 other new packages to the "Independent Packages" section (they have no cross-package dependencies).

### 5. `KB-v2.1-Build-Inventory.md` — Append new section

Add a new section after the existing Tier 3 table:

```markdown
## Tier 3 Expansion: Additional Cross-Domain Translations

| # | System | Source Pattern | Tier | Language | Priority |
|---|--------|---------------|------|----------|----------|
| 32 | Workforce Scheduling Coordinator | Multi-agent coordinator (Sec 24) | Translate | Python | P1 |
| 33 | Genesys Flow Security Validator | Security audit patterns (Sec 8-10, 38) | Translate | TS | P1 |
| 34 | Multi-Step IVR Input Validator | Compound command decomposition (Sec 8.6) | Translate | TS | P2 |
| 35 | Tool Schema Cache | Tool schema caching (Sec 21.3) | Build | TS | P2 |
| 36 | Tool Registry + Three-Layer Filtering | Tool system (Sec 6.2-6.3) | Build | TS | P2 |
| 37 | Dialogue History Manager | Dialogue history (Sec 19) | Build | TS | P2 |
| 38 | System Reminder Injection | System reminder mechanism (Sec 20) | Build | TS | P2 |
| 39 | Plugin Lifecycle Manager | Plugin system (Sec 25) | Build | TS | P2 |
| 40 | SDK Bridge | Server/SDK mode (Sec 26) | Build | TS | P3 |
| 41 | Voice Input Gating | Voice input system (Sec 34) | Build | TS | P3 |
| 42 | Output Style System | Output styles + markdown (Sec 35) | Build | TS | P3 |
| 43 | Onboarding Flow Engine | Onboarding flow (Sec 36) | Build | TS | P3 |
```

### 6. `README.md` — Update the package count table and add new rows

Update the header counts and add rows for all 12 new packages to the package inventory table.

### 7. `IMPLEMENTATION-PLAYBOOK.md` — Update progress tracker

Add new Wave 6 to the progress tracker:

```markdown
Wave 6 — Expansion Packages (#32-43)
[ ] 32. workforce-scheduling-coordinator (Python, P1)
[ ] 33. genesys-flow-security-validator (TS, P1)
[ ] 34. multi-step-ivr-input-validator (TS, P2, needs #28)
[ ] 35. tool-schema-cache (TS, P2)
[ ] 36. tool-registry (TS, P2)
[ ] 37. dialogue-history-manager (TS, P2)
[ ] 38. system-reminder-injection (TS, P2)
[ ] 39. plugin-lifecycle-manager (TS, P2)
[ ] 40. sdk-bridge (TS, P3)
[ ] 41. voice-input-gating (TS, P3)
[ ] 42. output-style-system (TS, P3)
[ ] 43. onboarding-flow-engine (TS, P3)
```

---

## Validation

After all scaffolding is complete, run:

```bash
make scaffold-check   # Should report 43/43 packages present
make type-check       # All 35 TS packages should compile (no errors from stubs with TODO throws)
make lint             # Biome for TS, Ruff for Python — zero warnings
```

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Total packages | 31 | 43 |
| Extract (TS) | 16 | 16 (unchanged) |
| Build (TS) | 10 | 19 (+9) |
| Translate (TS) | 2 | 4 (+2) |
| Translate (Python) | 3 | 4 (+1) |
| KB sections covered | 31 of 44 | 43 of 44 (only Section 41 Anti-Patterns remains a design principle, not a package) |
