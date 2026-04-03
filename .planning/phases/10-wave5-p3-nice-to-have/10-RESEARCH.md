# Phase 10: Wave 5 -- P3 Nice to Have - Research

**Researched:** 2026-04-02
**Domain:** TypeScript package implementation (1 extract + 3 build tier)
**Confidence:** HIGH

## Summary

Phase 10 implements 4 P3 packages: analytics-killswitch (extract), vim-mode-fsm (build), keyboard-shortcuts (build), and ink-renderer (build). All have existing type stubs with TODO throws. None have cross-package dependencies -- all 4 are standalone. This makes the phase straightforward: no wave ordering needed, all plans can run in parallel.

The packages span distinct domains: analytics event routing with killswitch control, vim modal editing FSM, keybinding resolution with conflict detection, and terminal UI render pipeline. Each is self-contained with well-defined type signatures already in place. The implementation pattern is identical to Phases 6-9: preserve type signatures, replace TODO throws with working logic, write TDD test suites, verify with tsc + bun test.

**Primary recommendation:** Split into 2 plans (2 packages each), all Wave 1 (no dependencies). Plan 01: analytics-killswitch + vim-mode-fsm. Plan 02: keyboard-shortcuts + ink-renderer. All autonomous with TDD.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None explicitly locked -- all implementation choices are at Claude's discretion.

### Claude's Discretion
All implementation choices are at Claude's discretion -- pure infrastructure phase. Follow patterns established in Phases 6-9.

Key constraints:
- vim-mode-fsm must have working state machine with transition()
- ink-renderer must have working render pipeline types
- make type-check and make lint must pass
- Follow patterns established in Phases 6-9 (prior implementation waves)

### Deferred Ideas (OUT OF SCOPE)
None -- infrastructure phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| W5-01 | analytics-killswitch (Extract, Template 1, KB 14) | Standalone, no deps. 4 functions: logEvent, isKillswitchEnabled, initializeAnalytics, isProtectedField. Module-level event queue, sink array, killswitch boolean. _PROTO_ prefix detection for protected fields. |
| W5-02 | vim-mode-fsm (Build, Template 2, KB 34) | Standalone, no deps. 2 functions: transition (FSM core), createInitialVimState. 11-mode union type. Transition maps (state, input) to (nextState, sideEffects). Key modes: normal->insert (i), insert->normal (Escape), normal->visual (v), normal->operator_pending (d/c/y). |
| W5-03 | keyboard-shortcuts (Build, Template 2, KB 35) | Standalone, no deps. 4 functions: loadKeybindings, resolveKey, parseKeystroke, detectConflicts. 17 key contexts. Modifier parsing from "Ctrl+Shift+P" format. Conflict = same key+modifiers+context, different command. |
| W5-04 | ink-renderer (Build, Template 2, KB 33) | Standalone, no deps. Ink class + 4 functions: render, Box, Text, Button. Flexbox-model layout. RenderOptions with stdout/stdin streams. InkInstance with rerender/unmount/waitUntilExit/clear. FrameMetrics for performance. |
| NFR-01 | All TS implementations compile with tsc --noEmit strict mode | All 4 packages are TypeScript, must pass strict compilation |
| NFR-03 | No TODO throws remain in implemented packages | All TODO throw bodies replaced with working implementations |
| NFR-06 | make type-check and make lint pass after wave | Final plan runs full monorepo verification |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | strict, ES2022 | All 4 packages | Project convention |
| Bun | workspace protocol | Test runner + package manager | Project convention |
| bun:test | built-in | Test framework | Established in Phases 6-9 |

No external dependencies needed. All 4 packages are self-contained implementations using only TypeScript built-ins and Node.js standard library types.

## Architecture Patterns

### Package Structure (established)
```
packages/{tier}/{name}/
  src/
    index.ts              # Implementation (replace TODO throws)
    {name}.test.ts        # TDD test suite
  package.json            # @claude-patterns/{name} scope
  tsconfig.json           # extends ../../../tsconfig.base.json
  README.md               # Package documentation
```

### Pattern 1: Extract Tier (analytics-killswitch)
**What:** Read existing type stubs, implement working logic that matches the contract.
**When to use:** Package has exact source mapping (services/analytics/).
**Approach:**
- Module-level state: event queue array, sinks array, killswitch boolean, initialized flag
- logEvent queues events if not initialized, sends to sinks if initialized
- initializeAnalytics sets sinks, drains queue via queueMicrotask, sets initialized=true
- isKillswitchEnabled returns module-level killswitch state
- isProtectedField checks fieldName.startsWith("_PROTO_")

### Pattern 2: Build Tier (vim-mode-fsm, keyboard-shortcuts, ink-renderer)
**What:** Design-from-reference implementation. Not verbatim copy, but architecturally faithful.
**When to use:** Package has KB section reference but no direct source extraction.
**Approach:**
- Implement working logic that satisfies the type signatures
- Use module-level state where needed (Map/Set for registries)
- Include resetState() function for test isolation

### Pattern 3: FSM Implementation (vim-mode-fsm)
**What:** State machine with transition function mapping (state, input) -> (nextState, sideEffects).
**Key transitions to implement:**
- normal + "i" -> insert (mode_change)
- normal + "v" -> visual (mode_change)
- normal + "V" -> visual_line (mode_change)
- normal + "Ctrl-v" -> visual_block (mode_change)
- normal + "R" -> replace (mode_change)
- normal + ":" -> command_line (mode_change)
- normal + "/" -> search (mode_change)
- normal + "d"/"c"/"y" -> operator_pending (operator action)
- insert + "Escape" -> normal (mode_change)
- visual + "Escape" -> normal (mode_change)
- operator_pending + motion -> normal (execute operator + motion)
- Any unknown input in normal mode -> stay in normal, empty sideEffects

### Pattern 4: Keystroke Parsing (keyboard-shortcuts)
**What:** Parse "Ctrl+Shift+P" format into structured ParsedBinding.
**Key behaviors:**
- Split on "+" to extract modifiers and key
- Last token is the key, preceding tokens are modifiers
- Normalize modifier names (ctrl/Ctrl -> "ctrl")
- loadKeybindings returns array of ParsedBinding for a source
- resolveKey finds matching binding for key+modifiers+context, reports conflicts
- detectConflicts finds bindings with same key+modifiers+context but different commands

### Pattern 5: Render Pipeline (ink-renderer)
**What:** Simplified terminal render pipeline with component functions.
**Key behaviors:**
- Ink class stores options, manages render lifecycle
- render() creates Ink instance, returns InkInstance handle
- Box/Text/Button return structural representation (not actual React components)
- InkInstance.waitUntilExit returns Promise that resolves on unmount
- Keep implementation focused on types and pipeline -- this is a pattern reference, not a real renderer

### Anti-Patterns to Avoid
- **Over-engineering ink-renderer:** Source is 19,848 LOC. Keep implementation minimal -- high-level types and pipeline structure only (per Phase 4 decision).
- **Missing resetState():** Build-tier packages with module-level state MUST have resetState() for test isolation. Proven pattern from cli-startup-optimization.
- **Breaking type signatures:** All existing interfaces and type aliases must be preserved exactly as defined in stubs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Complex vim motions | Full vim emulation | Basic mode transitions + common keys | This is a pattern reference, not a real editor |
| React-like rendering | Actual reconciler | Structural return values from components | ink-renderer models the pipeline, doesn't run it |
| Full keystroke handling | OS-level key capture | String parsing of "Ctrl+Shift+P" format | Pattern reference only |

## Common Pitfalls

### Pitfall 1: Module-Level State Leaking Between Tests
**What goes wrong:** Tests pass individually but fail when run together.
**Why it happens:** Module-level variables (queues, registries, flags) persist across test cases.
**How to avoid:** Export resetState() function, call it in beforeEach or at test start.
**Warning signs:** Flaky tests, order-dependent failures.

### Pitfall 2: FSM Transition Gaps
**What goes wrong:** transition() throws or returns undefined for valid inputs.
**Why it happens:** Not handling all mode+input combinations.
**How to avoid:** Default case returns current state unchanged with empty sideEffects. Every mode handles "Escape" to return to normal.
**Warning signs:** Test failures on edge-case inputs.

### Pitfall 3: Keystroke Parsing Edge Cases
**What goes wrong:** "Ctrl++" or single-character keys like "a" fail to parse.
**Why it happens:** Naive "+" splitting.
**How to avoid:** Last token is always the key. If input has no "+", entire string is the key with no modifiers.
**Warning signs:** parseKeystroke("a") throwing.

### Pitfall 4: ink-renderer Over-Scoping
**What goes wrong:** Attempting to implement actual terminal rendering.
**Why it happens:** Source is 19,848 LOC, temptation to go deep.
**How to avoid:** Return structural objects from components. Ink class manages lifecycle state only. Phase 4 decision explicitly said "high-level types only."
**Warning signs:** Implementation exceeding 200 lines.

## Code Examples

### analytics-killswitch Implementation Pattern
```typescript
// Module-level state
const eventQueue: AnalyticsEvent[] = [];
const sinks: TelemetrySink[] = [];
let killswitchActive = false;
let initialized = false;

export function logEvent(event: AnalyticsEvent): void {
  if (killswitchActive) return;
  if (!initialized) {
    eventQueue.push(event);
    return;
  }
  for (const sink of sinks) {
    if (sink.isEnabled()) sink.send(event);
  }
}

export function initializeAnalytics(newSinks: TelemetrySink[]): void {
  sinks.length = 0;
  sinks.push(...newSinks);
  initialized = true;
  // Drain queue
  while (eventQueue.length > 0) {
    const event = eventQueue.shift()!;
    logEvent(event);
  }
}
```

### vim-mode-fsm Transition Pattern
```typescript
export function transition(state: VimState, input: string): TransitionResult {
  switch (state.mode) {
    case "normal":
      return handleNormalMode(state, input);
    case "insert":
      return handleInsertMode(state, input);
    case "visual":
    case "visual_line":
    case "visual_block":
      return handleVisualMode(state, input);
    case "operator_pending":
      return handleOperatorPending(state, input);
    // ... other modes
    default:
      return { nextState: state, sideEffects: [] };
  }
}
```

### keyboard-shortcuts Parse Pattern
```typescript
export function parseKeystroke(raw: string): ParsedBinding {
  const parts = raw.split("+");
  const key = parts.pop()!;
  const modifiers = parts.map(m => m.toLowerCase() as Modifier);
  return {
    key,
    modifiers,
    context: "global",
    command: "",
  };
}
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test (built-in) |
| Config file | none -- bun:test auto-discovers *.test.ts |
| Quick run command | `$HOME/.bun/bin/bun test packages/{tier}/{name}` |
| Full suite command | `make type-check && make lint` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| W5-01 | analytics-killswitch functions work | unit | `bun test packages/extract/analytics-killswitch` | Wave 0 |
| W5-02 | vim-mode-fsm transition() works | unit | `bun test packages/build/vim-mode-fsm` | Wave 0 |
| W5-03 | keyboard-shortcuts resolution works | unit | `bun test packages/build/keyboard-shortcuts` | Wave 0 |
| W5-04 | ink-renderer pipeline types work | unit | `bun test packages/build/ink-renderer` | Wave 0 |
| NFR-01 | tsc --noEmit passes | compile | `npx tsc --noEmit -p packages/{tier}/{name}/tsconfig.json` | N/A |
| NFR-03 | No TODO throws | grep | `grep -r "TODO" packages/{tier}/{name}/src/index.ts` | N/A |
| NFR-06 | Full monorepo passes | compile+lint | `make type-check && make lint` | N/A |

### Sampling Rate
- **Per task commit:** `bun test packages/{tier}/{name} && npx tsc --noEmit -p packages/{tier}/{name}/tsconfig.json`
- **Per wave merge:** `make type-check && make lint`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `packages/extract/analytics-killswitch/src/analytics-killswitch.test.ts` -- covers W5-01
- [ ] `packages/build/vim-mode-fsm/src/vim-mode-fsm.test.ts` -- covers W5-02
- [ ] `packages/build/keyboard-shortcuts/src/keyboard-shortcuts.test.ts` -- covers W5-03
- [ ] `packages/build/ink-renderer/src/ink-renderer.test.ts` -- covers W5-04

## Plan Structure Recommendation

All 4 packages are standalone (no cross-package dependencies). Split into 2 parallel plans:

| Plan | Packages | Tier | Wave | Rationale |
|------|----------|------|------|-----------|
| 10-01 | analytics-killswitch + vim-mode-fsm | extract + build | 1 | Analytics is simplest extract; vim-mode-fsm is the most algorithmic |
| 10-02 | keyboard-shortcuts + ink-renderer | build + build | 1 | Both build-tier, both UI-adjacent patterns |

Both plans run in Wave 1 (no depends_on). Each plan: 2 tasks (1 per package), TDD workflow, autonomous.

### Per-Package Complexity Estimate

| Package | Stub Functions | Est. Implementation LOC | Complexity |
|---------|---------------|------------------------|------------|
| analytics-killswitch | 4 | ~60-80 | Low -- queue + sink routing |
| vim-mode-fsm | 2 | ~120-160 | Medium -- mode dispatch table |
| keyboard-shortcuts | 4 | ~80-120 | Medium -- parsing + conflict detection |
| ink-renderer | 4 + Ink class | ~80-100 | Low -- structural returns, lifecycle state |

### Implementation Notes Per Package

**analytics-killswitch (W5-01):**
- Module-level: eventQueue[], sinks[], killswitchActive boolean, initialized boolean
- logEvent: queue if not initialized, skip if killswitch active, else route to enabled sinks
- isKillswitchEnabled: return killswitchActive
- initializeAnalytics: set sinks, drain queue, set initialized=true
- isProtectedField: return fieldName.startsWith("_PROTO_")
- PII governance types are `never` -- no implementation needed, they exist for attestation

**vim-mode-fsm (W5-02):**
- createInitialVimState returns { mode: "normal", count: null, operator: null, register: '"', lastMotion: null }
- transition uses switch on state.mode, each mode handler returns TransitionResult
- Normal mode: i->insert, v->visual, V->visual_line, Ctrl-v->visual_block, R->replace, :->command_line, /->search, d/c/y->operator_pending (set operator), 0-9 set count
- Insert mode: Escape->normal
- Visual modes: Escape->normal, d/c/y execute on selection
- Operator_pending: motion key executes operator+motion->normal, Escape cancels->normal
- Default: unknown input -> return state unchanged, empty sideEffects

**keyboard-shortcuts (W5-03):**
- Module-level: bindings Map<KeybindingSource, ParsedBinding[]>
- loadKeybindings: return bindings.get(source) or populate with defaults
- parseKeystroke: split on "+", last=key, rest=modifiers, normalize to lowercase
- resolveKey: find binding matching key+modifiers+context, collect conflicts
- detectConflicts: group by key+modifiers+context, report groups with multiple different commands

**ink-renderer (W5-04):**
- Ink class: store options, track mounted state, exitPromise
- render: create Ink instance, return InkInstance { rerender, unmount, waitUntilExit, clear }
- Box: return { type: "box", props }
- Text: return { type: "text", props }
- Button: return { type: "button", props }
- waitUntilExit: return Promise that resolves when unmount() called
- Keep minimal per Phase 4 decision

## Sources

### Primary (HIGH confidence)
- Existing type stubs in packages/{tier}/{name}/src/index.ts -- direct contract
- Phase 9 PLAN.md patterns -- proven plan structure and TDD workflow
- Phase 8 RESEARCH.md -- established plan splitting and dependency handling
- Completed build-tier implementations (multi-agent-coordinator, cli-startup-optimization) -- proven patterns

### Secondary (MEDIUM confidence)
- KB section references in stub file headers -- domain context

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- identical to Phases 6-9, no new dependencies
- Architecture: HIGH -- all patterns proven in prior waves
- Pitfalls: HIGH -- known from 23 prior package implementations

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable -- internal project conventions)
