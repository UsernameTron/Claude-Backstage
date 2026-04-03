# Phase 7: Wave 2 -- Core Architecture - Research

**Researched:** 2026-04-03
**Domain:** TypeScript implementation of 4 core architectural packages (prompt-cache-optimizer, prompt-system, context-injection, permission-system)
**Confidence:** HIGH

## Summary

Phase 7 implements 4 core architectural packages that form the foundation for downstream P1/P2 packages. The packages span all three tiers: one extract (permission-system, 9.4K LOC source), two build (prompt-system, context-injection), and one translate (prompt-cache-optimizer). All have complete type stubs with full signatures already in place. The Phase 6 TDD workflow (RED stub throws -> GREEN implement -> verify tsc + bun test) is proven and should be applied identically.

The critical challenge is **permission-system** -- at 9.4K LOC source reference it is the largest package in the monorepo. However, the stub only exposes 6 functions and 3 constants. The implementation scope is bounded by the stub interface, not the full source. The source tree is mounted at `claude-code/src/utils/permissions/` with all 24 files available for reference. The other 3 packages are smaller (200-2400 LOC source references) and well-documented in KB v2.1.

**Primary recommendation:** Split into 2-3 plans. Plan 1: prompt-cache-optimizer (smallest, translate tier). Plan 2: prompt-system + context-injection (build tier, related architecturally). Plan 3: permission-system (extract tier, largest, standalone). Permission-system should be its own plan due to complexity.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None -- all implementation choices are at Claude's discretion (infrastructure phase).

### Claude's Discretion
All implementation choices -- pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions. Follow the proven TDD workflow from Phase 6.

Key constraints from prior phases:
- Preserve all existing type signatures -- only TODO throw bodies get replaced
- Use shallow copy for readonly contracts
- Module-level storage patterns (Maps, arrays) for state
- bun binary is at $HOME/.bun/bin/bun
- tsconfig extends path is ../../../tsconfig.base.json (3 levels)

### Deferred Ideas (OUT OF SCOPE)
None -- discuss phase skipped.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| W2-01 | prompt-cache-optimizer (Translate/TS, Template 3, ~200 LOC) | KB Pattern 4 + Section 21; 3-tier cache scoping (global/org/none), boundary marker, sort stable first |
| W2-02 | prompt-system (Build, Template 2, 2,368 LOC source ref) | KB Section 15; static/dynamic boundary, section factory, assembly pipeline |
| W2-03 | context-injection (Build, Template 2, 1,484 LOC source ref) | KB Section 16; dual-position injection, git memoization, cache breaker, circular dep break |
| W2-04 | permission-system (Extract, Template 1, 9,409 LOC source ref) | KB Section 8; deny>ask>allow chain, rule matching (exact/prefix/wildcard), dangerous pattern detection |
| NFR-01 | All TS implementations compile with tsc --noEmit strict mode | All packages have tsconfig.json extending tsconfig.base.json |
| NFR-03 | No TODO throws remain in implemented packages | Each function body replaces TODO throw |
| NFR-06 | make type-check and make lint pass after each wave | Monorepo-wide verification step |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Package scope: `@claude-patterns/{name}`
- TypeScript: strict mode, ES2022, Bun workspaces
- All packages: type stubs with TODO comments exist, zero implementations currently
- Entry points: `src/index.ts`
- Test runner: bun:test (proven in Phase 6)
- Linter: Biome for TS
- Type check: tsc --noEmit
- bun binary: `$HOME/.bun/bin/bun`

## Architecture Patterns

### Package Implementation Structure (proven in Phase 6)

Each package follows this pattern:
```
packages/{tier}/{name}/
  src/
    index.ts           # Stub with signatures -> replace bodies
    {name}.test.ts     # New file: bun:test tests
  tsconfig.json        # extends ../../../tsconfig.base.json
  package.json         # @claude-patterns/{name}
  README.md            # Already exists
```

### Pattern 1: TDD Workflow (proven Phase 6)
**What:** RED (stubs throw) -> GREEN (implement) -> VERIFY (tsc + bun test)
**When to use:** Every package implementation
**Example:**
```typescript
// Phase 6 proven pattern from cost-tracker:
import { describe, test, expect, beforeEach } from "bun:test";
import { functionUnderTest } from "./index";

describe("package-name", () => {
  beforeEach(() => { /* reset module state */ });
  test("behavior description", () => {
    expect(functionUnderTest(input)).toBe(expected);
  });
});
```

### Pattern 2: Module-Level Storage (Phase 6 proven)
**What:** Use module-level Map/array/variable for in-memory state
**When to use:** Any package needing mutable state (permission rules, cached context)
**Example:**
```typescript
// From cost-tracker implementation:
const costStore = new Map<string, SessionCostEntry>();
```

### Pattern 3: Shallow Copy for Readonly Contracts (Phase 6 proven)
**What:** Return `{ ...this.state }` or `[...array]` for readonly return types
**When to use:** Any function returning `Readonly<T>` or readonly arrays

### Anti-Patterns to Avoid
- **Changing type signatures:** The stub signatures are the CONTRACT. Only replace throw bodies.
- **Adding external dependencies:** No new deps unless already listed in package.json
- **process.env access in stubs:** The source uses `process.env.USER_TYPE === "ant"` for DANGEROUS_BASH_PATTERNS -- our stub already hard-codes the non-ant version. Do NOT add process.env access.

## Package-Specific Implementation Guidance

### 1. prompt-cache-optimizer (Translate/TS, ~200 LOC)

**Tier:** Translate | **KB:** Pattern 4 + Section 21

**Stub signatures (3 functions):**
- `optimizeCacheOrder(segments: CacheSegment[]): CacheOptimizationResult`
- `isStableSegment(segment: CacheSegment): boolean`
- `estimateCacheSavings(totalTokens, stableTokens): number`

**Implementation logic from KB:**
- `isStableSegment`: return `segment.stable` OR `segment.scope !== CacheScope.None`
- `optimizeCacheOrder`: Sort segments by scope priority (Global first, Org second, None last). Within same scope, stable=true before stable=false. Insert CACHE_BOUNDARY_MARKER between last stable and first dynamic. Return ordered segments, boundary position, and estimated cache hit rate.
- `estimateCacheSavings`: `stableTokens / totalTokens` clamped to [0, 1]. This represents the fraction of tokens that hit cache.

**Complexity:** LOW. Three straightforward functions with clear semantics.

### 2. prompt-system (Build, 2,368 LOC source ref)

**Tier:** Build | **KB:** Section 15

**Stub signatures (11 functions + 1 constant):**
- `getSystemPrompt(config?)` -- Assemble full prompt from static + boundary + dynamic sections
- `systemPromptSection(id, content, type?)` -- Factory for SystemPromptSection
- `resolveSystemPromptSections(sections)` -- Filter nulls, return content strings
- 7 section getters: `getSimpleIntroSection`, `getSimpleSystemSection`, `getSimpleDoingTasksSection`, `getActionsSection`, `getUsingYourToolsSection`, `getSimpleToneAndStyleSection`, `getOutputEfficiencySection`
- `shouldUseGlobalCacheScope()` -- Cache scope determination
- `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` constant (already defined)

**Implementation logic from KB Section 15.2:**
```
getSystemPrompt(config) builds:
  [static sections] + [boundary] + [dynamic sections]

Static sections (from 15.2):
  getSimpleIntroSection -> identity intro
  getSimpleSystemSection -> core system identity
  getSimpleDoingTasksSection -> task execution guidance
  getActionsSection -> capabilities
  getUsingYourToolsSection -> tool usage guidance
  getSimpleToneAndStyleSection -> tone/style
  getOutputEfficiencySection -> output efficiency

Boundary:
  SYSTEM_PROMPT_DYNAMIC_BOUNDARY if shouldUseGlobalCacheScope()

Dynamic sections:
  session_guidance, memory, env_info_simple, language,
  output_style, mcp_instructions, scratchpad, frc, token_budget
```

**Key design decisions:**
- Section getters return `SystemPromptSection | null` -- null means section is skipped
- `systemPromptSection()` is a factory: creates `{ id, content, type: type || "static", cached: type !== "dynamic" }`
- `resolveSystemPromptSections()`: filter null sections, return `.content` strings
- `getSystemPrompt()`: call all section getters, resolve, join with newlines, insert boundary
- Each section getter returns REPRESENTATIVE content (not the full Claude Code prompt text). Use placeholder content that demonstrates the pattern.
- `shouldUseGlobalCacheScope()`: return true by default (no org config in standalone)
- `getSimpleIntroSection(outputStyleConfig?)`: return null if outputStyleConfig overrides intro

**Source reference note:** The actual Claude Code prompts.ts is 914 LOC of prompt text. We do NOT copy verbatim. We create our own representative sections showing the pattern.

**Complexity:** MEDIUM. Many functions but each is simple. The main complexity is `getSystemPrompt()` orchestrating the assembly.

### 3. context-injection (Build, 1,484 LOC source ref)

**Tier:** Build | **KB:** Section 16

**Stub signatures (6 functions):**
- `getSystemContext()` -- Collect git context (memoized)
- `getUserContext()` -- Collect CLAUDE.md + date
- `appendSystemContext(systemPrompt, context)` -- Append to system prompt end
- `prependUserContext(messages, context)` -- Prepend as first user message
- `getSystemPromptInjection()` -- Generate cache breaker
- `setCachedClaudeMdContent(content)` -- Side-channel cache

**Implementation logic from KB Section 16:**

```typescript
// Module-level memoization
let cachedSystemContext: SystemContext | null = null;
let cachedClaudeMd: string | null = null;

getSystemContext():
  if (cachedSystemContext) return cachedSystemContext
  Collect git info (branch, main branch, user, status truncated to 2000 chars, last 5 commits)
  For standalone: use representative defaults or exec git commands
  Cache and return

getUserContext():
  return { claudeMdContent: cachedClaudeMd, currentDate: new Date().toISOString().split("T")[0] }

appendSystemContext(systemPrompt, context):
  Format context as string block, append to systemPrompt
  Format: "Current branch: {branch}\nMain branch: {mainBranch}\n..."

prependUserContext(messages, context):
  Create system-reminder message wrapping claudeMdContent + currentDate
  Return [reminderMessage, ...messages]

getSystemPromptInjection():
  Return null by default (no mid-session changes in standalone)
  Or return `[CACHE_BREAKER: ${Date.now()}]` if cache break needed

setCachedClaudeMdContent(content):
  cachedClaudeMd = content
```

**Key design decision:** `getSystemContext()` needs git data. Two approaches:
1. **Exec git commands** -- more realistic but adds process spawning
2. **Return placeholder defaults** -- simpler, demonstrates the pattern

Recommendation: Execute actual git commands via `Bun.spawnSync` for realism. This is a "build" package designed to demonstrate the real pattern. Fallback to placeholder values if git is not available.

**Complexity:** MEDIUM. The memoization and dual-position pattern require careful implementation.

### 4. permission-system (Extract, 9.4K LOC source ref)

**Tier:** Extract | **KB:** Section 8

**Stub signatures (6 functions + 3 constants):**

Constants (already defined, DO NOT CHANGE):
- `PERMISSION_RULE_SOURCES` -- 7-element tuple
- `CROSS_PLATFORM_CODE_EXEC` -- 18 elements
- `DANGEROUS_BASH_PATTERNS` -- extends CROSS_PLATFORM_CODE_EXEC + 7 more

Functions:
- `hasPermissionsToUseTool(toolName, toolInput, mode)` -- Primary check
- `checkRuleBasedPermissions(toolName, toolInput)` -- Rule-only check
- `getAllowRules()` / `getDenyRules()` / `getAskRules()` -- Rule accessors
- `isDangerousBashPermission(pattern)` -- Dangerous pattern detection

**Implementation logic from KB Section 8 + source:**

```
Module-level rule storage:
  const allowRules: PermissionRule[] = []
  const denyRules: PermissionRule[] = []
  const askRules: PermissionRule[] = []

getAllowRules/getDenyRules/getAskRules: return [...rules] (shallow copy)

isDangerousBashPermission(pattern):
  Source at permissionSetup.ts lines 94-147 shows the exact algorithm:
  1. If pattern is empty/undefined equivalent -> true (allows ALL)
  2. If pattern is "*" -> true
  3. For each DANGEROUS_BASH_PATTERNS entry:
     - Exact match -> true
     - prefix:* syntax -> true
     - trailing wildcard (pattern*) -> true
     - space wildcard (pattern *) -> true
     - flag wildcard (pattern -*) -> true
  4. Return false

  NOTE: The stub signature is isDangerousBashPermission(pattern: string): boolean
  This is SIMPLER than the source's isDangerousBashPermission(toolName, ruleContent).
  The stub takes just a pattern string. Adapt accordingly -- check against
  DANGEROUS_BASH_PATTERNS without the toolName guard.

checkRuleBasedPermissions(toolName, toolInput):
  Priority chain: Deny -> Ask -> Allow (KB 8.3)
  1. Check deny rules: if any deny rule matches -> { allowed: false, reason, rule }
  2. Check ask rules: if any ask rule matches -> { allowed: false, reason, rule }
  3. Check allow rules: if any allow rule matches -> { allowed: true, reason, rule }
  4. No rule matches -> { allowed: false, reason: "no matching rule" }

hasPermissionsToUseTool(toolName, toolInput, mode):
  1. First check rule-based permissions
  2. If rule found, return that result
  3. Apply mode-based defaults:
     - "bypassPermissions" -> allowed: true
     - "plan" -> allowed: false (read-only)
     - "dontAsk" -> allowed: false
     - "acceptEdits" -> allowed: true for Write/Edit tools, false otherwise
     - "default" -> allowed: false (needs user confirmation)
     - "auto" -> allowed: false (would need classifier, return false as placeholder)

Rule matching (from source shellRuleMatching.ts):
  A rule matches a tool+input when:
  1. rule.tool matches toolName (case-sensitive)
  2. If rule.pattern exists:
     - Extract the relevant input content (e.g., command for Bash)
     - Match via: exact, prefix (:*), or wildcard patterns
  3. If no rule.pattern, the rule matches any input for that tool
```

**Complexity:** HIGH. This is the largest package, but the stub interface constrains it to 6 functions. The main complexity is rule matching logic and the priority chain. Source files `shellRuleMatching.ts` (229 LOC) and `permissionSetup.ts` (147 LOC for isDangerousBashPermission) provide the exact algorithms.

**Key risk:** The source permission-system is deeply integrated (24 files, 9.4K LOC) but our stub exposes only the essential interface. We must implement a self-contained version that captures the core pattern without depending on the full Claude Code runtime.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pattern matching | Custom regex engine | The exact prefix/wildcard/exact algorithm from source shellRuleMatching.ts | The source handles edge cases (escaped wildcards, legacy :* syntax) correctly |
| Permission priority | Custom if/else chains | The deny>ask>allow chain from KB 8.3 | The ordering is critical for security -- deny must never be overridden |
| Cache ordering | Custom sort comparator | CacheScope enum ordering (Global < Org < None) | Three-tier scoping has specific semantics |

## Common Pitfalls

### Pitfall 1: Changing Type Signatures
**What goes wrong:** Adding parameters, changing return types, or modifying interfaces
**Why it happens:** Source has richer signatures than stubs (e.g., isDangerousBashPermission takes toolName+ruleContent in source, but only pattern in stub)
**How to avoid:** Read the stub signature FIRST. Implement to the stub contract, not the source contract. Adapt source logic to fit.
**Warning signs:** TypeScript compilation errors in downstream packages that import these types

### Pitfall 2: process.env in Standalone Packages
**What goes wrong:** Using process.env.USER_TYPE for DANGEROUS_BASH_PATTERNS ant-only entries
**Why it happens:** Source code has this conditional
**How to avoid:** The stub already defines DANGEROUS_BASH_PATTERNS without the ant-only entries. Do not modify the constant.
**Warning signs:** Tests failing on machines without USER_TYPE set

### Pitfall 3: Async vs Sync Mismatch
**What goes wrong:** Making getSystemContext() async when the stub declares it sync
**Why it happens:** Git commands via child_process are naturally async
**How to avoid:** Use `Bun.spawnSync` (synchronous) for git operations in context-injection. The stub signatures are all synchronous.
**Warning signs:** TypeScript errors about Promise return types

### Pitfall 4: Over-Engineering Permission System
**What goes wrong:** Trying to implement all 24 source files worth of functionality
**Why it happens:** The source is 9.4K LOC but the stub exposes only 6 functions
**How to avoid:** Implement ONLY what the stub signatures require. The rule storage can be simple arrays. The matching can be the core algorithm without all edge cases.
**Warning signs:** Implementation exceeding 500 LOC for permission-system

### Pitfall 5: Prompt System Content
**What goes wrong:** Trying to reproduce the exact Claude Code system prompt text
**Why it happens:** prompts.ts is 914 LOC of actual prompt content
**How to avoid:** Use REPRESENTATIVE content that demonstrates the static/dynamic boundary pattern. The package is "Build" tier -- we create our own version inspired by the pattern.
**Warning signs:** Copying large blocks of text from the source prompts.ts

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test (built into Bun runtime) |
| Config file | none -- bun:test works zero-config |
| Quick run command | `$HOME/.bun/bin/bun test {package}/src/{name}.test.ts` |
| Full suite command | `make type-check && make lint` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| W2-01 | optimizeCacheOrder sorts segments by scope, inserts boundary | unit | `$HOME/.bun/bin/bun test packages/translate/prompt-cache-optimizer/src/prompt-cache-optimizer.test.ts` | Wave 0 |
| W2-02 | getSystemPrompt assembles static + boundary + dynamic sections | unit | `$HOME/.bun/bin/bun test packages/build/prompt-system/src/prompt-system.test.ts` | Wave 0 |
| W2-03 | appendSystemContext + prependUserContext dual-position injection | unit | `$HOME/.bun/bin/bun test packages/build/context-injection/src/context-injection.test.ts` | Wave 0 |
| W2-04 | hasPermissionsToUseTool evaluates deny>ask>allow chain | unit | `$HOME/.bun/bin/bun test packages/extract/permission-system/src/permission-system.test.ts` | Wave 0 |
| NFR-01 | All 4 packages compile strict mode | integration | `make type-check` | Exists |
| NFR-03 | Zero TODO throws | smoke | `grep -r "TODO" packages/{tier}/{name}/src/index.ts` | N/A |
| NFR-06 | Monorepo-wide type-check + lint | integration | `make type-check && make lint` | Exists |

### Sampling Rate
- **Per task commit:** `$HOME/.bun/bin/bun test {package}/src/` + `npx tsc --noEmit -p {package}/tsconfig.json`
- **Per wave merge:** `make type-check && make lint`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `packages/translate/prompt-cache-optimizer/src/prompt-cache-optimizer.test.ts` -- covers W2-01
- [ ] `packages/build/prompt-system/src/prompt-system.test.ts` -- covers W2-02
- [ ] `packages/build/context-injection/src/context-injection.test.ts` -- covers W2-03
- [ ] `packages/extract/permission-system/src/permission-system.test.ts` -- covers W2-04

## Code Examples

### prompt-cache-optimizer: optimizeCacheOrder
```typescript
// Pattern from KB Section 21 + Pattern 4
export function optimizeCacheOrder(segments: CacheSegment[]): CacheOptimizationResult {
  const scopeOrder = { [CacheScope.Global]: 0, [CacheScope.Org]: 1, [CacheScope.None]: 2 };

  const sorted = [...segments].sort((a, b) => {
    const scopeDiff = scopeOrder[a.scope] - scopeOrder[b.scope];
    if (scopeDiff !== 0) return scopeDiff;
    // Within same scope, stable before unstable
    return (a.stable ? 0 : 1) - (b.stable ? 0 : 1);
  });

  // Find boundary: last stable segment
  const boundaryPosition = sorted.findLastIndex(s => isStableSegment(s)) + 1;
  const stableTokens = sorted.slice(0, boundaryPosition)
    .reduce((sum, s) => sum + s.content.length, 0); // approximate
  const totalTokens = sorted.reduce((sum, s) => sum + s.content.length, 0);

  return {
    segments: sorted,
    estimatedCacheHitRate: totalTokens > 0 ? stableTokens / totalTokens : 0,
    boundaryPosition,
  };
}
```

### permission-system: isDangerousBashPermission
```typescript
// Adapted from source permissionSetup.ts lines 94-147
export function isDangerousBashPermission(pattern: string): boolean {
  const content = pattern.trim().toLowerCase();
  if (content === "" || content === "*") return true;

  for (const dangerousPattern of DANGEROUS_BASH_PATTERNS) {
    const lower = dangerousPattern.toLowerCase();
    if (content === lower) return true;
    if (content === `${lower}:*`) return true;
    if (content === `${lower}*`) return true;
    if (content === `${lower} *`) return true;
    if (content.startsWith(`${lower} -`) && content.endsWith("*")) return true;
  }
  return false;
}
```

### context-injection: appendSystemContext
```typescript
// Pattern from KB Section 16.2
export function appendSystemContext(systemPrompt: string, context: SystemContext): string {
  const lines = [
    `Current branch: ${context.gitBranch}`,
    `Main branch: ${context.mainBranch}`,
    `Git user: ${context.gitUser}`,
    `Status: ${context.gitStatus}`,
    `Recent commits: ${context.recentCommits.join(", ")}`,
  ];
  if (context.cacheBreaker) {
    lines.push(context.cacheBreaker);
  }
  return `${systemPrompt}\n\n${lines.join("\n")}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat prompt string | Static/dynamic boundary with cache scoping | Claude Code v1 | 40-70% API cost reduction |
| Single-position context | Dual-position injection (system end + first user msg) | Claude Code v1 | Better model attention to relevant context |
| Simple allow/deny lists | Three-factor verification with priority chain | Claude Code v1 | Prevents deny-rule bypass via broad allow rules |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun | Test runner + TS runtime | Verified (Phase 6) | $HOME/.bun/bin/bun | -- |
| tsc (TypeScript) | Type checking | Verified (Phase 6) | via npx | -- |
| git | context-injection getSystemContext() | Expected available | -- | Return placeholder defaults |
| Biome | Linting | Verified (Phase 6) | via npx | -- |

## Open Questions

1. **context-injection git command strategy**
   - What we know: getSystemContext() is sync, needs git data
   - What's unclear: Whether Bun.spawnSync is the right approach vs. placeholder defaults
   - Recommendation: Use Bun.spawnSync with try/catch fallback to defaults. This gives realistic behavior while gracefully degrading.

2. **permission-system rule population**
   - What we know: getAllowRules/getDenyRules/getAskRules return from module-level arrays
   - What's unclear: How rules get added (no addRule function in stub)
   - Recommendation: Initialize empty arrays. The accessors return empty by default. Downstream packages (yolo-classifier, dangerous-command-detection) will add population functions when they are implemented. For hasPermissionsToUseTool, rule check returns "no matching rule" and falls through to mode-based logic.

## Sources

### Primary (HIGH confidence)
- KB v2.1 Sections 8, 15, 16, 21, Pattern 4 -- Direct implementation reference
- Source tree at `claude-code/src/utils/permissions/` -- Extract-tier reference for permission-system
- Source tree at `claude-code/src/constants/systemPromptSections.ts` -- Factory pattern reference
- Source tree at `claude-code/src/utils/permissions/permissionSetup.ts` lines 84-147 -- isDangerousBashPermission exact algorithm
- Source tree at `claude-code/src/utils/permissions/shellRuleMatching.ts` -- Rule matching patterns
- Phase 6 implementations (denial-tracking, cost-tracker) -- Proven TDD workflow and patterns

### Secondary (MEDIUM confidence)
- KB v2.1 Recipes 1 and 3 -- Implementation step sequences

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- same stack as Phase 6 (Bun, tsc, Biome)
- Architecture: HIGH -- KB v2.1 + source tree provide complete reference
- Pitfalls: HIGH -- Phase 6 experience + source code analysis inform all pitfalls

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable -- monorepo conventions established)
