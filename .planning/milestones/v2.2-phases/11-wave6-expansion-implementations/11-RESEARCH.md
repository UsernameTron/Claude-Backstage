# Phase 11: Wave 6 -- Expansion Implementations - Research

**Researched:** 2026-04-03
**Domain:** TypeScript + Python package implementation (11 TS + 1 Python, #32-43)
**Confidence:** HIGH

## Summary

Phase 11 implements 12 expansion packages added during the v2.1 scaffold expansion. All have existing type stubs with TODO throws. The packages split across two tiers: 9 build-tier TypeScript, 2 translate-tier TypeScript, and 1 translate-tier Python. One cross-package dependency exists: multi-step-ivr-input-validator imports from ivr-call-flow-validator (already implemented in Phase 8).

The implementation pattern is identical to Phases 6-10: preserve all type signatures, replace TODO throw bodies with working logic, write TDD test suites using bun:test (TS) or pytest-style (Python), verify with tsc + bun test + ruff. Package complexity varies from simple (tool-schema-cache: Map-based cache) to moderate (onboarding-flow-engine: dependency-ordered step execution, dialogue-history-manager: JSONL persistence pattern).

**Primary recommendation:** Split into 4 plans of 3 packages each. Plan 01 (Wave 1): tool-schema-cache + tool-registry + voice-input-gating (standalone, simple). Plan 02 (Wave 1): system-reminder-injection + output-style-system + dialogue-history-manager (standalone, moderate). Plan 03 (Wave 1): plugin-lifecycle-manager + sdk-bridge + onboarding-flow-engine (standalone, moderate). Plan 04 (Wave 1): workforce-scheduling-coordinator (Python) + genesys-flow-security-validator + multi-step-ivr-input-validator (translate tier; multi-step depends on ivr-call-flow-validator but that is already implemented). All autonomous with TDD.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None explicitly locked -- all implementation choices are at Claude's discretion.

### Claude's Discretion
All implementation choices are at Claude's discretion -- pure infrastructure phase with well-defined packages and success criteria. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints:
- multi-step-ivr-input-validator must correctly import from ivr-call-flow-validator
- All Python packages must pass ruff + pip install -e
- make scaffold-check 43/43, make type-check 39/0, make lint clean
- Follow patterns established in Phases 6-10 (prior implementation waves)

### Deferred Ideas (OUT OF SCOPE)
None -- infrastructure phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| W6-01 | workforce-scheduling-coordinator (Translate/Python, Template 3, KB 24) | Python dataclass-based coordinator. SchedulingCoordinator class with dispatch_job, get_active_jobs, cancel_job, get_shared_context. Dict-based job registry, status-based dispatch. Follow consecutive-breach-tracker Python pattern. |
| W6-02 | genesys-flow-security-validator (Translate/TS, Template 3, KB 8-10, 38) | validateFlow + getBuiltInRules. Built-in rules check: unprotected data actions, PII in debug nodes, unvalidated external inputs. Rule-based iteration over flow nodes. |
| W6-03 | multi-step-ivr-input-validator (Translate/TS, Template 3, KB 8.6) | Imports IVRCallFlow/IVRNode from @claude-patterns/ivr-call-flow-validator (workspace:* dep already in package.json). 4 functions: validateSequence (walk flow graph step-by-step), decomposeInput (split "1,3,2" etc.), generateAllSequences (BFS up to maxDepth), findDeadEndSequences. |
| W6-04 | tool-schema-cache (Build/TS, Template 2, KB 21.3) | ToolSchemaCache class with Map-based storage. get/set/refresh/invalidate/getStableSchemaList. Stable list sorts by name for cache key determinism. |
| W6-05 | tool-registry (Build/TS, Template 2, KB 6.2-6.3) | Module-level registry array. assembleToolPool merges built-in + external then filters by deny rules. filterToolsByDenyRules uses name matching. sortForCacheStability sorts by name. registerTool/getAllTools manage global state. |
| W6-06 | dialogue-history-manager (Build/TS, Template 2, KB 19) | DialogueHistoryManager class with in-memory message array. JSONL persistence via JSON.stringify per line. Compact boundary splits effective messages. Write-before-response = persist before return. |
| W6-07 | system-reminder-injection (Build/TS, Template 2, KB 20) | 4 functions: injectReminder appends wrapped content to message. wrapInReminderTags wraps in XML tags. extractReminders parses tags from string. shouldInjectReminder uses source-type rules. |
| W6-08 | plugin-lifecycle-manager (Build/TS, Template 2, KB 25) | PluginLifecycleManager class with 4-phase lifecycle. Map-based state tracking. discover scans seed dirs (simulated). loadFromCache reads cached manifests. cleanupOrphaned removes stale entries. |
| W6-09 | sdk-bridge (Build/TS, Template 2, KB 26) | SDKBridge class with simulated WebSocket lifecycle. NDJSON message framing (JSON.stringify + newline). Handler registry for onMessage. Control request approval flow. |
| W6-10 | voice-input-gating (Build/TS, Template 2, KB 34) | 5 functions: checkVoiceGating runs 3 layers with fail-fast. checkRemoteFlag/checkAuthentication/checkRuntimeSupport are individual layer checks. compositeGateCheck evaluates ordered layers. |
| W6-11 | output-style-system (Build/TS, Template 2, KB 35) | 4 functions: loadOutputStyles merges user + project dirs (simulated). applyOutputStyle transforms content per style flags. isPlainText samples first N chars for markdown markers. createMarkdownCache returns LRU Map with eviction. |
| W6-12 | onboarding-flow-engine (Build/TS, Template 2, KB 36) | OnboardingFlowEngine class with step assembly and dependency-ordered execution. assembleSteps filters by shouldSkip and validates deps. run executes in order, tracks state. skipTo marks intermediates as skipped. |
| NFR-01 | All TS implementations compile with tsc --noEmit strict mode | 11 TS packages must pass strict compilation |
| NFR-02 | All Python implementations pass ruff lint + pip install -e | workforce-scheduling-coordinator must pass ruff + pip install -e |
| NFR-03 | No TODO throws remain in implemented packages | All 12 packages: TODO throw bodies replaced with working implementations |
| NFR-06 | make type-check and make lint pass after wave | Final verification: 39 packages checked, 0 failed; lint clean |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | strict, ES2022 | All 11 TS packages | Project convention |
| Bun | workspace protocol | Test runner + package manager | Project convention |
| bun:test | built-in | TS test framework | Established in Phases 6-10 |
| Python | 3.11+ | workforce-scheduling-coordinator | Project convention |
| Ruff | latest | Python linting | Project convention |

No external dependencies needed. All packages are self-contained implementations using TypeScript built-ins, Node.js standard library types, or Python stdlib only. The one workspace dependency (multi-step-ivr-input-validator -> ivr-call-flow-validator) is already declared in package.json.

## Architecture Patterns

### Package Structure (established)

**TypeScript (11 packages):**
```
packages/{tier}/{name}/
  src/
    index.ts              # Implementation (replace TODO throws)
    {name}.test.ts        # TDD test suite (bun:test)
  package.json            # @claude-patterns/{name} scope
  tsconfig.json           # extends to tsconfig.base.json
  README.md               # Package documentation
```

**Python (1 package):**
```
packages/translate/{name}/
  src/
    {snake_name}/
      __init__.py         # Implementation (replace NotImplementedError)
      test_{module}.py    # TDD test suite
  pyproject.toml          # setuptools build backend
  README.md               # Package documentation
```

### Pattern 1: Build Tier Implementation
**What:** Read type stubs, implement working logic matching the exported contract.
**When to use:** All 9 build-tier packages.
**Approach:**
- Preserve all exported type/interface definitions exactly
- Replace `throw new Error("TODO: ...")` with working implementations
- Use module-level state (Maps, arrays) for storage -- no external deps
- Class constructors store config and initialize internal state
- Test file co-located as `src/{name}.test.ts`

### Pattern 2: Translate Tier TS Implementation
**What:** Apply Claude Code patterns to domain-specific contexts.
**When to use:** genesys-flow-security-validator, multi-step-ivr-input-validator.
**Approach:**
- Same as build tier but implementations translate source patterns to new domains
- Cross-package imports use `import type` for type-only and value imports for re-exports

### Pattern 3: Translate Tier Python Implementation
**What:** Implement Python packages using dataclass patterns.
**When to use:** workforce-scheduling-coordinator.
**Approach:**
- Keep dataclass/enum definitions as-is
- Replace `raise NotImplementedError(...)` with working logic
- Use dict-based internal storage
- Test file co-located as `test_{module}.py` inside the package directory

### Anti-Patterns to Avoid
- **Adding external dependencies:** All packages must remain zero-dep (except workspace deps)
- **Changing type signatures:** All exported types, interfaces, function signatures must be preserved exactly
- **Using real filesystem/network:** Simulate I/O operations in-memory (e.g., dialogue-history-manager JSONL = in-memory array with serialize methods)
- **Deep class hierarchies:** Use flat composition -- single class with methods, or standalone functions

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LRU cache (output-style-system) | Custom doubly-linked list | Map with size check + oldest-key deletion | Map preserves insertion order in JS; delete + re-set moves to end |
| JSONL parsing (dialogue-history-manager) | Custom parser | split('\n').filter(Boolean).map(JSON.parse) | Standard one-liner pattern |
| XML tag wrapping (system-reminder-injection) | XML library | Template literal: `<${tag}>${content}</${tag}>` | No need for full XML parser for simple wrapping |
| DTMF sequence decomposition (multi-step-ivr-input-validator) | Complex parser | regex split on common separators + char-by-char for digits | Simple input formats: "1,3,2" or "1-3-2" or "132" |

## Common Pitfalls

### Pitfall 1: multi-step-ivr-input-validator Import Resolution
**What goes wrong:** Cross-package workspace import fails at type-check time.
**Why it happens:** Bun workspace:* dependencies require the target package to have matching exports.
**How to avoid:** ivr-call-flow-validator is already implemented (Phase 8) with all exported types. The package.json already declares the dependency. Just use `import type` for type-only imports and re-export as shown in the stub.
**Warning signs:** tsc error "Cannot find module '@claude-patterns/ivr-call-flow-validator'"

### Pitfall 2: Async Signatures in Plugin Lifecycle Manager
**What goes wrong:** cleanupOrphaned is declared `async` -- implementation must return Promise<number>.
**Why it happens:** Easy to miss `async` in stub signature and implement synchronously.
**How to avoid:** Check stub signatures carefully. If async, implementation must use async/await or return Promise.
**Warning signs:** Type error on return type mismatch.

### Pitfall 3: Module-level State Leaks Between Tests
**What goes wrong:** Tests pass individually but fail when run together because module-level state (Maps, arrays) persists.
**Why it happens:** tool-registry, sdk-bridge, and similar use module-level registries.
**How to avoid:** Export a reset/clear function and call it in test beforeEach. Or create new instances per test.
**Warning signs:** Tests pass in isolation, fail in suite.

### Pitfall 4: Python Package Test Discovery
**What goes wrong:** Tests not found by pytest or ruff errors on test file.
**Why it happens:** Test file must be inside the package directory with proper naming.
**How to avoid:** Place test file at `src/{snake_name}/test_{module}.py`, use `from . import ...` for imports.
**Warning signs:** `ruff check` shows import errors, tests not discovered.

## Code Examples

### Build Tier: Map-based Cache (tool-schema-cache pattern)
```typescript
// Source: Established pattern from Phases 6-10
export class ToolSchemaCache {
  private cache = new Map<string, CachedToolSchema>();

  get(toolName: string): CachedToolSchema | undefined {
    return this.cache.get(toolName);
  }

  set(toolName: string, schema: CachedToolSchema): void {
    this.cache.set(toolName, schema);
  }

  refresh(tools: Tool[]): void {
    this.cache.clear();
    const now = Date.now();
    for (const tool of tools) {
      this.cache.set(tool.name, { ...tool, cachedAt: now });
    }
  }

  invalidate(): void {
    this.cache.clear();
  }

  getStableSchemaList(): CachedToolSchema[] {
    return [...this.cache.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
}
```

### Translate Tier: Flow Graph Walking (multi-step-ivr-input-validator pattern)
```typescript
// Source: Compound decomposition from ivr-call-flow-validator BFS pattern (Phase 8)
export function validateSequence(
  flow: IVRCallFlow,
  sequence: string[]
): SequenceValidationResult {
  const steps: DTMFStep[] = [];
  let currentNodeId = flow.entryNode;

  for (let i = 0; i < sequence.length; i++) {
    const input = sequence[i];
    const node = flow.nodes[currentNodeId];
    if (!node) {
      return { valid: false, failedAtStep: i, steps, reachableEndpoint: null };
    }
    const transition = node.transitions.find(t => t.input === input)
      ?? (node.defaultTransition?.input === input ? node.defaultTransition : undefined);
    // ... walk to next node
  }
}
```

### Python Translate: Coordinator Pattern (workforce-scheduling-coordinator)
```python
# Source: consecutive-breach-tracker pattern from Phase 6
class SchedulingCoordinator:
    def __init__(self, config: CoordinatorConfig) -> None:
        self._config = config
        self._jobs: dict[str, SchedulingJob] = {}
        self._context: dict = {}

    def dispatch_job(self, job: SchedulingJob) -> WorkerResult:
        job.status = "running"
        self._jobs[job.job_id] = job
        # Simulate worker execution
        result = WorkerResult(
            worker_id=f"worker-{job.job_type.value}",
            job_id=job.job_id,
            status="completed",
            output={},
            duration_seconds=0.0,
        )
        job.status = "completed"
        job.result = result.output
        return result
```

### TDD Test Pattern (established)
```typescript
// Source: All prior wave test files
import { describe, test, expect } from "bun:test";
import { ToolSchemaCache, type Tool } from "./index";

describe("tool-schema-cache", () => {
  test("get returns undefined for unknown tool", () => {
    const cache = new ToolSchemaCache();
    expect(cache.get("unknown")).toBeUndefined();
  });
  // ... more tests
});
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test (TS), pytest-style in-package (Python) |
| Config file | None needed -- bun:test discovers .test.ts files automatically |
| Quick run command | `cd packages/{tier}/{name} && bun test` |
| Full suite command | `make type-check && make lint` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| W6-01 | Coordinator dispatches jobs, tracks active jobs, cancels | unit | `cd packages/translate/workforce-scheduling-coordinator && python -m pytest src/` | Wave 0 |
| W6-02 | validateFlow detects security vulnerabilities in flows | unit | `cd packages/translate/genesys-flow-security-validator && bun test` | Wave 0 |
| W6-03 | validateSequence walks flow graph, decomposeInput splits DTMF | unit | `cd packages/translate/multi-step-ivr-input-validator && bun test` | Wave 0 |
| W6-04 | Cache get/set/refresh/invalidate/getStableSchemaList | unit | `cd packages/build/tool-schema-cache && bun test` | Wave 0 |
| W6-05 | assembleToolPool merges + filters, sortForCacheStability orders | unit | `cd packages/build/tool-registry && bun test` | Wave 0 |
| W6-06 | DialogueHistoryManager add/persist/load/compact boundary | unit | `cd packages/build/dialogue-history-manager && bun test` | Wave 0 |
| W6-07 | injectReminder/wrapInReminderTags/extractReminders/shouldInject | unit | `cd packages/build/system-reminder-injection && bun test` | Wave 0 |
| W6-08 | PluginLifecycleManager discover/cache/cleanup/activate | unit | `cd packages/build/plugin-lifecycle-manager && bun test` | Wave 0 |
| W6-09 | SDKBridge connect/send/onMessage/handleControlRequest/disconnect | unit | `cd packages/build/sdk-bridge && bun test` | Wave 0 |
| W6-10 | checkVoiceGating runs 3 layers with fail-fast | unit | `cd packages/build/voice-input-gating && bun test` | Wave 0 |
| W6-11 | loadOutputStyles/applyOutputStyle/isPlainText/createMarkdownCache | unit | `cd packages/build/output-style-system && bun test` | Wave 0 |
| W6-12 | OnboardingFlowEngine assembleSteps/run/skipTo with deps | unit | `cd packages/build/onboarding-flow-engine && bun test` | Wave 0 |
| NFR-01 | All TS compiles strict | integration | `make type-check` | Exists |
| NFR-06 | Full lint clean | integration | `make lint` | Exists |

### Sampling Rate
- **Per task commit:** `bun test` in each modified package
- **Per wave merge:** `make type-check && make lint`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- All 12 test files need creation (one per package)
- No framework install needed -- bun:test and pytest already available

## Implementation Complexity Assessment

| Package | Complexity | Key Challenge | Est. Lines |
|---------|-----------|---------------|-----------|
| tool-schema-cache | Simple | Map operations + sort | ~40 |
| tool-registry | Simple | Array ops + module-level state | ~50 |
| voice-input-gating | Simple | Sequential boolean checks | ~40 |
| system-reminder-injection | Simple | String manipulation + XML tags | ~50 |
| output-style-system | Medium | LRU cache eviction logic | ~70 |
| workforce-scheduling-coordinator | Medium | Dict-based job lifecycle | ~50 |
| genesys-flow-security-validator | Medium | Rule-based node iteration | ~80 |
| plugin-lifecycle-manager | Medium | 4-phase lifecycle state machine | ~70 |
| sdk-bridge | Medium | Handler registry + async patterns | ~60 |
| dialogue-history-manager | Medium | JSONL serialization + compact boundary | ~80 |
| multi-step-ivr-input-validator | Medium | Graph walking + BFS sequence generation | ~90 |
| onboarding-flow-engine | Medium | Dependency-ordered async execution | ~80 |

## Plan Grouping Recommendation

| Plan | Packages | Language | Dependencies | Rationale |
|------|----------|----------|-------------|-----------|
| 11-01 | tool-schema-cache, tool-registry, voice-input-gating | TS | None | Simple standalone build-tier packages |
| 11-02 | system-reminder-injection, output-style-system, dialogue-history-manager | TS | None | Moderate standalone build-tier packages |
| 11-03 | plugin-lifecycle-manager, sdk-bridge, onboarding-flow-engine | TS | None | Moderate standalone build-tier packages |
| 11-04 | workforce-scheduling-coordinator, genesys-flow-security-validator, multi-step-ivr-input-validator | Mixed | W6-03 imports from ivr-call-flow-validator (already done) | Translate tier packages, Python + TS mixed |

All 4 plans are Wave 1 (no inter-plan dependencies). All autonomous with TDD.

## Sources

### Primary (HIGH confidence)
- Existing codebase: All 12 package stubs read and analyzed
- Prior wave implementations (Phases 6-10): Pattern established and verified across 31 packages
- ivr-call-flow-validator implementation (Phase 8): Cross-package dependency already working
- Makefile: Build system targets confirmed

### Secondary (MEDIUM confidence)
- None needed -- all patterns established from prior phases

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- identical to Phases 6-10, no new deps
- Architecture: HIGH -- all patterns established and proven across 31 packages
- Pitfalls: HIGH -- known from prior waves, documented with mitigations

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable -- no external dependency changes expected)
