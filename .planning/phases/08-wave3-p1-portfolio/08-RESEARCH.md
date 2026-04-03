# Phase 8: Wave 3 -- P1 Portfolio - Research

**Researched:** 2026-04-02
**Domain:** TypeScript/Python package implementation with cross-package dependencies
**Confidence:** HIGH

## Summary

Phase 8 implements 11 P1 packages across three tiers: 6 extract (token-estimation, streaming-tool-executor, state-store, yolo-classifier, auto-compact, claudemd-memory), 3 build (multi-agent-coordinator, agent-dialogue-loop, skills-system), 1 translate/TS (ivr-call-flow-validator), and 1 translate/Python (agent-skill-routing). This is the largest implementation phase so far -- nearly 3x the package count of any prior phase.

The key challenge is dependency ordering. Four packages have cross-package dependencies: yolo-classifier depends on permission-system (Phase 7, done), auto-compact depends on token-estimation (this phase), agent-dialogue-loop depends on streaming-tool-executor + state-store + token-estimation (all this phase), and skills-system depends on claudemd-memory (this phase). Multi-agent-coordinator depends on mcp-integration (Phase 9 stub), but only for type imports which already resolve from stubs.

**Primary recommendation:** Split into 4 plans across 2 waves. Wave 1 (3 plans, parallelizable): standalone packages + packages depending only on Phase 7 outputs. Wave 2 (1 plan): packages with intra-phase dependencies (auto-compact, agent-dialogue-loop, skills-system).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None explicitly locked -- all implementation choices are at Claude's discretion.

### Claude's Discretion
All implementation choices are at Claude's discretion -- pure infrastructure phase. Follow the proven TDD workflow: RED (stubs throw) -> GREEN (implement) -> verify (tsc + bun test).

Key constraints:
- Preserve all existing type signatures -- only TODO throw bodies get replaced
- Cross-package imports must resolve (yolo-classifier imports from permission-system)
- agent-dialogue-loop integrates streaming-tool-executor + state-store + token-estimation
- bun binary at $HOME/.bun/bin/bun, tsconfig extends ../../../tsconfig.base.json

### Deferred Ideas (OUT OF SCOPE)
None -- discuss phase skipped.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| W3-01 | token-estimation (Extract, Template 1, KB 18.4) | Standalone, no deps. 5 functions: countTokensWithAPI, roughTokenCountEstimation, roughTokenCountEstimationForMessages, bytesPerTokenForFileType, tokenCountWithEstimation. ~4 chars/token heuristic. |
| W3-02 | streaming-tool-executor (Extract, Template 1, KB 31) | Standalone, no deps. Class with addTool, getCompletedResults, getRemainingResults, getUpdatedContext. Promise-based concurrent execution. |
| W3-03 | state-store (Extract, Template 1, KB 7) | Standalone, no deps. createStore factory with getState/setState/subscribe. Object.is reference equality. DeepImmutable utility type. |
| W3-04 | yolo-classifier (Extract, Template 1, KB 8.5) | Depends on permission-system (Phase 7, done). 3 functions: classifierDecision (async), classifierShared, classifierToPermission. Imports PermissionMode, PermissionResult types. |
| W3-05 | auto-compact (Extract, Template 1, KB 18) | Depends on token-estimation (W3-01, this phase). 4 functions + constants. Threshold math: effectiveWindow = modelContextWindow - min(maxOutputTokens, 20_000). |
| W3-06 | claudemd-memory (Extract, Template 1, KB 17) | Standalone, no deps. 4 functions: getMemoryFiles (4-tier hierarchy), getClaudeMds, processMemoryFile, resolveIncludes. MAX_MEMORY_CHARACTER_COUNT = 40_000. |
| W3-07 | multi-agent-coordinator (Build, Template 2, KB 25) | Depends on mcp-integration (Phase 9 stub, type imports only -- already resolves). 4 functions: isCoordinatorMode, getCoordinatorSystemPrompt, getCoordinatorUserContext, dispatchTask. |
| W3-08 | agent-dialogue-loop (Build, Template 2, KB 5) | Depends on W3-01 + W3-02 + W3-03 (all this phase). QueryEngine class with async generator ask(). StreamEvent union type. Must implement after deps. |
| W3-09 | ivr-call-flow-validator (Translate/TS, Template 3, Recipe 5) | Standalone, no deps. FSM validation: validate, getUnreachableNodes, getTransitionCoverage. Graph reachability + DTMF coverage. |
| W3-10 | agent-skill-routing (Translate/Python, Template 3, Recipe 1 + 43) | Standalone, no deps. Python: evaluate_rules (deny>ask>allow cascade), load_rules, check_compliance. Dataclass-based. |
| W3-11 | skills-system (Build, Template 2, KB 22) | Depends on claudemd-memory (W3-06, this phase). 5 functions: getSkillDirCommands, registerBundledSkill, estimateSkillFrontmatterTokens, loadSkill, parseFrontmatter. |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Bun | latest | Runtime, test runner, workspace manager | Project standard since Phase 1 |
| TypeScript | strict mode, ES2022 | Type checking | Project standard |
| Biome | latest | TS linting | Project standard |
| Ruff | latest | Python linting | Project standard for translate/Py |
| pytest | latest | Python testing | Project standard for Python packages |

### Tooling
| Tool | Command | Purpose |
|------|---------|---------|
| bun test | `$HOME/.bun/bin/bun test` | Run TS tests |
| tsc | `npx tsc --noEmit -p <pkg>/tsconfig.json` | Type checking |
| make type-check | `make type-check` | Full monorepo type check |
| make lint | `make lint` | Full monorepo lint |

## Architecture Patterns

### Dependency Graph (Critical for Plan Ordering)

```
Wave 1 (no intra-phase deps -- parallelizable):
  token-estimation       (standalone)
  streaming-tool-executor (standalone)
  state-store            (standalone)
  yolo-classifier        (depends on permission-system -- Phase 7 done)
  claudemd-memory        (standalone)
  multi-agent-coordinator (depends on mcp-integration stub -- types resolve)
  ivr-call-flow-validator (standalone)
  agent-skill-routing     (standalone Python)

Wave 2 (depends on Wave 1 outputs):
  auto-compact           (depends on token-estimation)
  agent-dialogue-loop    (depends on streaming-tool-executor + state-store + token-estimation)
  skills-system          (depends on claudemd-memory)
```

### Recommended Plan Structure

```
Plan 08-01: Extract standalone (token-estimation, streaming-tool-executor, state-store, claudemd-memory)
  - 4 extract packages, no deps, Template 1
  - Wave 1 parallel

Plan 08-02: Extract with deps + translate TS (yolo-classifier, ivr-call-flow-validator)
  - yolo-classifier imports from permission-system (done)
  - ivr-call-flow-validator is standalone translate/TS
  - Wave 1 parallel

Plan 08-03: Build standalone + Python (multi-agent-coordinator, agent-skill-routing)
  - multi-agent-coordinator: type-only imports from mcp-integration stub
  - agent-skill-routing: Python, standalone
  - Wave 1 parallel

Plan 08-04: Dep-chain packages (auto-compact, agent-dialogue-loop, skills-system)
  - auto-compact depends on token-estimation (Plan 08-01)
  - agent-dialogue-loop depends on 3 packages (Plan 08-01)
  - skills-system depends on claudemd-memory (Plan 08-01)
  - Wave 2 (after Wave 1 completes)
```

### Proven TDD Pattern (from Phase 6-7)

```
1. Read stub file (existing type signatures)
2. Write failing tests (bun:test for TS, pytest for Python)
3. Implement -- replace TODO throws, preserve signatures
4. Verify: tsc --noEmit + bun test (TS) or ruff + pytest (Python)
```

### Test File Naming Convention (from existing packages)

| Tier | Pattern | Example |
|------|---------|---------|
| Extract/TS | `src/{package-name}.test.ts` | `cost-tracker.test.ts` |
| Build/TS | `src/{package-name}.test.ts` | `prompt-system.test.ts` |
| Translate/TS | `src/{package-name}.test.ts` | `prompt-cache-optimizer.test.ts` |
| Translate/Python | `src/{pkg_name}/test_{module}.py` | `test_tracker.py` |

### Implementation Patterns (from Phase 6-7 implementations)

**Module-level state storage:**
```typescript
// Use module-level Maps/arrays for state
const storage = new Map<string, Entry>();
```

**Shallow copy for readonly contracts:**
```typescript
getState(): State {
  return { ...internalState };
}
```

**Cross-package imports:**
```typescript
// Value imports for runtime use
import { evaluatePermission } from "@claude-patterns/permission-system";
// Type imports for type-only use
import type { PermissionMode } from "@claude-patterns/permission-system";
```

**workspace:* dependencies in package.json:**
```json
{
  "dependencies": {
    "@claude-patterns/permission-system": "workspace:*"
  }
}
```

### Anti-Patterns to Avoid
- **Changing type signatures:** Only TODO throw bodies get replaced. All exports, parameters, return types must remain identical.
- **Adding new dependencies:** Package.json dependencies are already declared. Do not add new ones.
- **Implementing actual API calls:** These are pattern implementations, not production code. Simulate behavior (e.g., classifierDecision returns mock decisions, not real API calls).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token estimation | Actual tokenizer | ~4 chars/token heuristic | KB pattern uses rough estimation, not tiktoken |
| Graph reachability | Custom BFS from scratch | Standard BFS with Set tracking | Well-known algorithm, but implement it simply |
| YAML/TOML parsing for skill frontmatter | Custom parser | Simple regex for YAML-like frontmatter | Stubs show simple key-value frontmatter |
| Async generator patterns | Complex state machines | Standard async generator with yield | TypeScript native async generators work well |

## Common Pitfalls

### Pitfall 1: Dependency Ordering in Plans
**What goes wrong:** Planning auto-compact before token-estimation is implemented causes import failures at test time.
**Why it happens:** 11 packages is complex; easy to miss that auto-compact imports Message/TokenUsage from token-estimation.
**How to avoid:** Wave 1 must complete before Wave 2. Plans 08-01/02/03 are parallel; Plan 08-04 depends on 08-01.
**Warning signs:** "Cannot find module" errors during bun test.

### Pitfall 2: multi-agent-coordinator's mcp-integration Dependency
**What goes wrong:** Attempting to implement actual MCP functionality when mcp-integration is still a stub.
**Why it happens:** multi-agent-coordinator imports McpServerConfig and McpConnection from mcp-integration (Phase 9).
**How to avoid:** The types already resolve from stubs. Implementation should use the types but mock the MCP connection (dispatchTask returns a resolved promise with status update). The dependency is type-level only for now.
**Warning signs:** Trying to import runtime implementations from mcp-integration.

### Pitfall 3: agent-dialogue-loop Complexity
**What goes wrong:** Over-engineering the async generator pattern.
**Why it happens:** QueryEngine.ask() returns AsyncGenerator<StreamEvent, QueryResult> -- complex signature.
**How to avoid:** Implement a simple streaming loop: yield text events, handle tool_use by delegating to StreamingToolExecutor, yield tool_result events, yield done. The generator return value is the accumulated QueryResult.
**Warning signs:** Implementation exceeding 200 lines for a build-tier package.

### Pitfall 4: Python Package Test Location
**What goes wrong:** Putting Python tests in wrong directory.
**Why it happens:** Convention differs from TS (tests live inside the Python package directory, not a separate tests/ folder).
**How to avoid:** Follow Phase 6 pattern: `src/{pkg_name}/test_{module}.py` (e.g., `src/agent_skill_routing/test_routing.py`).
**Warning signs:** pytest can't discover tests.

### Pitfall 5: Bun Binary Path
**What goes wrong:** Using `bun` instead of `$HOME/.bun/bin/bun`.
**How to avoid:** Always use full path: `$HOME/.bun/bin/bun test`.

## Code Examples

### Extract Tier Pattern (from cost-tracker)
```typescript
// Source: packages/extract/cost-tracker/src/index.ts
import { describe, test, expect, beforeEach } from "bun:test";
import { addToTotalSessionCost, getStoredSessionCosts } from "./index";

describe("CostTracker", () => {
  beforeEach(() => { resetState(); });
  test("adds entry and returns stored costs", () => {
    addToTotalSessionCost(makeEntry());
    const costs = getStoredSessionCosts();
    expect(costs.entries).toHaveLength(1);
  });
});
```

### Python Translate Tier Pattern (from consecutive-breach-tracker)
```python
# Test file: src/consecutive_breach_tracker/test_tracker.py
# Uses pytest with dataclass-based domain objects
# Functions raise NotImplementedError in stubs -> implement real logic
```

### Async Generator Pattern (for agent-dialogue-loop)
```typescript
async *ask(params: QueryParams): AsyncGenerator<StreamEvent, QueryResult> {
  const results: ToolResult[] = [];
  // Simulate streaming text
  yield { type: "text", content: "response" };
  // Handle tool use if tools configured
  if (this.config.tools?.length) {
    yield { type: "tool_use", toolName: "example", input: {} };
    const result = await this.executor.getRemainingResults();
    results.push(...result);
    yield { type: "tool_result", result: result[0] };
  }
  yield { type: "done" };
  return { messages: params.messages, tokenUsage: {...}, toolResults: results };
}
```

### Graph Reachability Pattern (for ivr-call-flow-validator)
```typescript
export function getUnreachableNodes(flow: IVRCallFlow): string[] {
  const visited = new Set<string>();
  const queue = [flow.entryNode];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    const node = flow.nodes[nodeId];
    if (!node) continue;
    for (const t of node.transitions) {
      if (!visited.has(t.targetNode)) queue.push(t.targetNode);
    }
    if (node.defaultTransition && !visited.has(node.defaultTransition.targetNode)) {
      queue.push(node.defaultTransition.targetNode);
    }
  }
  return Object.keys(flow.nodes).filter(id => !visited.has(id));
}
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test (TS), pytest (Python) |
| Config file | None needed -- bun auto-discovers .test.ts, pytest auto-discovers test_*.py |
| Quick run command | `$HOME/.bun/bin/bun test <pkg-path>` or `python -m pytest <pkg-path>` |
| Full suite command | `make type-check && make lint` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| W3-01 | token-estimation functions return numeric values | unit | `$HOME/.bun/bin/bun test packages/extract/token-estimation` | Wave 0 |
| W3-02 | streaming-tool-executor manages concurrent tool results | unit | `$HOME/.bun/bin/bun test packages/extract/streaming-tool-executor` | Wave 0 |
| W3-03 | createStore provides getState/setState/subscribe | unit | `$HOME/.bun/bin/bun test packages/extract/state-store` | Wave 0 |
| W3-04 | yolo-classifier maps to permission results | unit | `$HOME/.bun/bin/bun test packages/extract/yolo-classifier` | Wave 0 |
| W3-05 | auto-compact threshold math and compaction logic | unit | `$HOME/.bun/bin/bun test packages/extract/auto-compact` | Wave 0 |
| W3-06 | claudemd-memory 4-tier hierarchy and include resolution | unit | `$HOME/.bun/bin/bun test packages/extract/claudemd-memory` | Wave 0 |
| W3-07 | multi-agent-coordinator mode detection and task dispatch | unit | `$HOME/.bun/bin/bun test packages/build/multi-agent-coordinator` | Wave 0 |
| W3-08 | agent-dialogue-loop async generator yields events | unit | `$HOME/.bun/bin/bun test packages/build/agent-dialogue-loop` | Wave 0 |
| W3-09 | ivr-call-flow-validator graph validation | unit | `$HOME/.bun/bin/bun test packages/translate/ivr-call-flow-validator` | Wave 0 |
| W3-10 | agent-skill-routing deny>ask>allow cascade | unit | `python -m pytest packages/translate/agent-skill-routing` | Wave 0 |
| W3-11 | skills-system frontmatter parsing and skill loading | unit | `$HOME/.bun/bin/bun test packages/build/skills-system` | Wave 0 |
| NFR-01 | All TS compiles with tsc --noEmit | integration | `make type-check` | Exists |
| NFR-02 | Python passes ruff lint | integration | `make lint` | Exists |
| NFR-03 | No TODO throws remain | smoke | `grep -r "TODO" packages/*/src/index.ts` | N/A |
| NFR-04 | Cross-package imports resolve | integration | `$HOME/.bun/bin/bun test` on dependent packages | Wave 0 |
| NFR-06 | make type-check and make lint pass | integration | `make type-check && make lint` | Exists |

### Sampling Rate
- **Per task commit:** `$HOME/.bun/bin/bun test <pkg-path>` + `npx tsc --noEmit -p <pkg-path>/tsconfig.json`
- **Per wave merge:** `make type-check && make lint`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] 10 new TS test files (one per TS package): `src/{package-name}.test.ts`
- [ ] 1 new Python test file: `src/agent_skill_routing/test_routing.py`
- No framework install needed -- bun:test and pytest already available

## Sources

### Primary (HIGH confidence)
- Existing codebase: All 11 package stubs read directly from `packages/` directories
- Phase 6-7 implementations: Pattern reference from denial-tracking, cost-tracker, permission-system, prompt-system, context-injection, prompt-cache-optimizer
- Package.json files: Dependency declarations verified for all 11 packages
- Makefile: Build commands verified

### Secondary (MEDIUM confidence)
- KB sections referenced in stubs (not read directly, but section numbers documented in each stub header)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - identical to Phase 6-7, fully proven
- Architecture: HIGH - dependency graph derived from actual package.json files
- Pitfalls: HIGH - based on direct codebase analysis and Phase 6-7 experience

**Research date:** 2026-04-02
**Valid until:** 2026-04-16 (stable monorepo, internal project)
