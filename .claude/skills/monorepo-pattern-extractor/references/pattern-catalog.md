# Pattern Detection Catalog and Categorization Framework

Use this catalog when extracting patterns from a codebase. Each category has detection
heuristics — specific code patterns, file structures, or architectural choices that
indicate the presence (or absence) of the pattern.

## Category 1: Security Patterns

### S1: Multi-Factor Permission Rules

**Detection heuristics:**
- Search for `deny`, `allow`, `ask` or `block`, `permit`, `review` in permission code
- Look for rule evaluation functions with ordered checks
- Check if permission sources have explicit priority ordering
- Look for separate rule storage by type (deny rules vs allow rules)

**Present if:** Rules are evaluated in a specific cascade order (e.g., deny checked
before allow), and multiple rule sources exist with priority.

**Absent signal:** Binary allow/deny with no priority ordering, or single permission
check point with no cascade.

### S2: Adaptive Denial Tracking

**Detection heuristics:**
- Search for consecutive counters that reset on success
- Look for threshold-triggered behavior changes (not just logging)
- Check for fallback mode transitions after repeated denials

**Present if:** The system changes its behavior (not just alerts) after repeated failures.

**Absent signal:** Failures are logged but don't change system behavior.

### S3: Defense in Depth (Independent Layers)

**Detection heuristics:**
- Count the number of security checks between input and action
- Verify each layer can be bypassed independently without affecting others
- Check if layers share bypass mechanisms (they shouldn't)

**Present if:** 3+ independent security layers exist, each checking different things.

**Absent signal:** Single permission check, or multiple checks that share a bypass.

### S4: Self-Referential Protection

**Detection heuristics:**
- Check if config files are on the write deny-list
- Look for sandbox rules that protect the sandbox config itself
- Search for "self" or "own config" in security comments

**Present if:** The system explicitly prevents modification of its own security config.

**Absent signal:** Security config is writable from within the secured environment.

### S5: Untrusted Output Treatment

**Detection heuristics:**
- Look for validation between model/AI output and action execution
- Check if generated commands are parsed/analyzed before execution
- Look for schema validation on tool inputs

**Present if:** AI/model output goes through the same validation as external user input.

**Absent signal:** Model output is passed directly to execution without validation.

## Category 2: Performance Patterns

### P1: Streaming Execution

**Detection heuristics:**
- Look for handlers on partial/streaming responses
- Check if actions begin before the full response is received
- Search for "streaming", "chunk", "partial" in execution code

**Present if:** Work begins on partial results as they arrive.

**Absent signal:** Full response is awaited before any processing begins.

### P2: Cache-Stable Ordering

**Detection heuristics:**
- Check if arrays sent to external APIs are deterministically sorted
- Look for boundary markers between static and dynamic content
- Check if tool/function definitions are sorted before API calls

**Present if:** Content sent to cache-sensitive APIs is deterministically ordered with
static content as a prefix.

**Absent signal:** Arrays are unsorted or order changes between requests.

### P3: Tiered Lazy Loading

**Detection heuristics:**
- Look for `import()` dynamic imports (not top-level imports)
- Check for feature-flag gated imports
- Look for `setImmediate`, `setTimeout`, or `requestIdleCallback` deferred loading
- Check for "bare mode" or "minimal mode" that skips non-essential loading

**Present if:** Imports are deferred at 2+ tiers (compile-time, runtime, post-render).

**Absent signal:** All imports at top of file, no dynamic loading.

### P4: Hybrid Estimation

**Detection heuristics:**
- Look for exact counts from API responses stored and reused
- Check for rough/fast estimation for intermediate calculations
- Look for different calculation methods for "near limit" vs "normal" operation

**Present if:** System uses exact counts where available and estimates otherwise.

**Absent signal:** Either always exact (expensive) or always estimated (inaccurate).

## Category 3: State Management Patterns

### ST1: Minimal State Store

**Detection heuristics:**
- Check if state management is a custom implementation or external library
- Look for `Object.is` or reference equality checks
- Check state type for immutability markers (Readonly, DeepImmutable, Object.freeze)
- Count lines in the state management implementation

**Present if:** State management is proportional to needs (<100 LOC for simple systems).

**Absent signal:** External state management library for a system that doesn't need it.

### ST2: Immutability Enforcement

**Detection heuristics:**
- Look for `DeepImmutable`, `Readonly`, `ReadonlyArray`, `as const`
- Check for `Object.freeze` or Immer usage
- Look for state update patterns (spread operator, functional updates)

**Present if:** State types enforce immutability at the type level or runtime level.

**Absent signal:** Mutable state objects with direct property assignment.

## Category 4: Resilience Patterns

### R1: Budget as Constructor Parameter

**Detection heuristics:**
- Check if cost/token/time limits are in the constructor/config
- Look for budget checks before API calls (not just after)
- Check if budget is a required or prominent optional parameter

**Present if:** Resource limits are a first-class initialization concern.

**Absent signal:** Budget is checked only at the end or bolted on as middleware.

### R2: Bounded Retry with Strategy Change

**Detection heuristics:**
- Look for retry loops with maximum attempt counts
- Check if behavior changes after max retries (not just failure)
- Look for fallback strategies (different approach, not just retry)

**Present if:** Retries are bounded AND the system changes strategy after exhaustion.

**Absent signal:** Unbounded retries, or bounded retries that just fail.

### R3: Context Recovery

**Detection heuristics:**
- Look for summarization or compression of conversation/session history
- Check for boundary markers between original and compressed content
- Look for token/size counting before API calls

**Present if:** Long-running sessions can survive context limits via compression.

**Absent signal:** Sessions crash when context window is exceeded.

## Category 5: Extensibility Patterns

### E1: Plugin/Skill System

**Detection heuristics:**
- Look for dynamic loading of external modules/files
- Check for registration/discovery patterns
- Look for frontmatter/manifest parsing (YAML, JSON)
- Check for deferred/lazy loading of plugin content

**Present if:** Third-party or user-defined extensions can be loaded at runtime.

**Absent signal:** All functionality is built-in with no extension mechanism.

### E2: Hook Lifecycle

**Detection heuristics:**
- Look for event names like "pre", "post", "before", "after" in tool/action flow
- Check for hook registration and execution at lifecycle points
- Look for configurable hook definitions (JSON, code)

**Present if:** External code can intercept or modify behavior at defined lifecycle points.

**Absent signal:** No interception points in the execution flow.

## Category 6: Cost Control Patterns

### C1: Per-Unit Cost Tracking

**Detection heuristics:**
- Look for cost aggregation by model/service/channel
- Check for cost calculation after each API call
- Look for cost display/formatting utilities

**Present if:** Every API call's cost is tracked and aggregated.

**Absent signal:** No cost tracking, or only session-total tracking.

### C2: Cache Scope Optimization

**Detection heuristics:**
- Look for cache scope annotations (global, org, session, none)
- Check for boundary markers between cacheable and non-cacheable content
- Look for "DANGEROUS" or similar prefixes on uncached sections

**Present if:** Content is explicitly scoped for caching at multiple levels.

**Absent signal:** No cache scope management, or everything cached/uncached uniformly.

## Category 7: Prompt Engineering Patterns (LLM Systems Only)

### PE1: Dual-Position Context Injection

**Detection heuristics:**
- Check if different context types go to different positions
- Look for system prompt end injection (recency bias)
- Look for first-user-message injection (conversational framing)
- Check for `<system-reminder>` or similar wrapping tags

**Present if:** Context is deliberately placed in two positions for different attention effects.

**Absent signal:** All context in one position, or no positional strategy.

### PE2: Static/Dynamic Prompt Boundary

**Detection heuristics:**
- Look for boundary markers in prompt assembly
- Check if prompt sections are annotated with cache/stability metadata
- Look for "static" vs "dynamic" in prompt-related code

**Present if:** Prompt has an explicit boundary between cacheable and per-turn content.

**Absent signal:** Entire prompt is rebuilt from scratch each turn.

## Using This Catalog

### During Extraction

1. For each category, run the detection heuristics against the codebase
2. Mark each pattern as: PRESENT (with evidence), ABSENT (with signal), or N/A
3. For PRESENT patterns, extract the full pattern details (What/Why/How/Transfer)
4. For ABSENT patterns, note whether the absence is a gap or a reasonable omission

### Pattern Novelty Assessment

A pattern is worth documenting if:
- It's PRESENT and the implementation is non-obvious (score: HIGH)
- It's PRESENT and transferable to other domains (score: HIGH)
- It's deliberately ABSENT and the reason is instructive (score: MEDIUM)
- It's accidentally ABSENT and represents a risk (score: MEDIUM for gap analysis)

### Minimum Extraction Targets

| Codebase Size | Minimum Patterns | Minimum Anti-Patterns | Minimum Recipes |
|--------------|-----------------|----------------------|-----------------|
| <10K LOC | 3 | 2 | 1 |
| 10K-100K LOC | 5 | 3 | 3 |
| 100K-500K LOC | 10 | 5 | 5 |
| 500K+ LOC | 14+ | 8+ | 6+ |
