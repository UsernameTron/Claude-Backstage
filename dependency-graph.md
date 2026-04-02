# Dependency Graph

Cross-package dependency map for all 31 claude-code-patterns packages. Dependencies resolve via `@claude-patterns/{name}` workspace references — tier directories are invisible to imports.

## Dependency Chains

### permission-system (P0 foundation)

```
permission-system
  <- yolo-classifier
  <- dangerous-command-detection (also depends on path-validation)
```

The permission system is the foundation package. Its 3-factor rule engine (deny > ask > allow) and 6 permission modes are consumed by two downstream packages.

### token-estimation

```
token-estimation
  <- auto-compact
```

Auto-compact uses token estimation to determine when context exceeds thresholds and needs compaction.

### path-validation

```
path-validation
  <- sandbox-config
  <- dangerous-command-detection (also depends on permission-system)
```

Path validation provides UNC, tilde, shell expansion, and case normalization used by both sandbox configuration and dangerous command detection.

### claudemd-memory

```
claudemd-memory
  <- skills-system
```

The skills system builds on the CLAUDE.md memory system's 4-tier hierarchy, @include resolution, and frontmatter parsing.

### mcp-integration

```
mcp-integration
  <- multi-agent-coordinator
```

The multi-agent coordinator dispatches tasks to agents via MCP integration's client, auth, and proxy tool infrastructure.

### agent-dialogue-loop (multi-dependency)

```
streaming-tool-executor + state-store + token-estimation
  <- agent-dialogue-loop
```

The dialogue loop combines streaming tool execution, lightweight state management, and token estimation for query orchestration.

## Visual Dependency Tree

```
                    ┌─────────────────────┐
                    │  permission-system   │ P0
                    └──────┬──────┬───────┘
                           │      │
                    ┌──────▼┐  ┌──▼──────────────────────┐
                    │ yolo- │  │ dangerous-command-       │
                    │ class.│  │ detection                │
                    └───────┘  └──────▲──────────────────┘
                                      │
                    ┌─────────────────┘
                    │
              ┌─────┴─────────┐
              │ path-validation│
              └─────┬─────────┘
                    │
              ┌─────▼─────────┐
              │ sandbox-config │
              └───────────────┘

   ┌──────────────────┐     ┌────────────┐     ┌──────────────┐
   │ streaming-tool-  │     │ state-store│     │ token-       │
   │ executor         │     │            │     │ estimation   │
   └────────┬─────────┘     └──────┬─────┘     └──┬───────┬──┘
            │                      │               │       │
            └──────────┬───────────┘───────────────┘       │
                       │                                   │
                ┌──────▼──────────┐              ┌────────▼────┐
                │ agent-dialogue- │              │ auto-compact │
                │ loop            │              └─────────────┘
                └─────────────────┘

   ┌────────────────┐              ┌─────────────────┐
   │ claudemd-memory│              │ mcp-integration  │
   └───────┬────────┘              └────────┬─────────┘
           │                                │
   ┌───────▼────────┐              ┌────────▼─────────────┐
   │ skills-system   │              │ multi-agent-          │
   │                 │              │ coordinator           │
   └─────────────────┘              └──────────────────────┘
```

## Independent Packages (no upstream dependencies)

These packages have no dependencies on other packages in the monorepo:

**P0:**
- `denial-tracking` — Denial counter with adaptive fallback
- `cost-tracker` — Per-model cost aggregation
- `prompt-system` — Multi-layered prompt assembly
- `context-injection` — Dual-position context injection
- `consecutive-breach-tracker` — Queue breach detection (Python)
- `cost-per-interaction` — Channel cost aggregation (Python)
- `prompt-cache-optimizer` — Cache ordering with 3-tier scoping

**P1-P3:**
- `subprocess-env-scrubbing` — Environment variable sanitization
- `config-migration` — Configuration version migration
- `read-only-validation` — Git/gh command allowlists
- `analytics-killswitch` — Analytics with remote kill switch
- `vim-mode-fsm` — 11-state finite state machine
- `keyboard-shortcuts` — 17-context shortcut system
- `ink-renderer` — Custom double-buffer renderer
- `cli-startup-optimization` — Fast path lazy imports
- `ivr-call-flow-validator` — IVR FSM validator (Python)
- `agent-skill-routing` — ACD permission rules (Python)

## Build Order Recommendation

1. **Independent P0 packages first** — No dependency resolution needed
2. **permission-system** — Foundation for downstream packages
3. **path-validation, token-estimation, claudemd-memory, mcp-integration** — Mid-tier with single downstream consumers
4. **Dependent packages last** — yolo-classifier, dangerous-command-detection, auto-compact, sandbox-config, skills-system, multi-agent-coordinator, agent-dialogue-loop
