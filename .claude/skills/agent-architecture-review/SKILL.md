---
name: agent-architecture-review
description: >
  Review agent system architectures for design flaws, security gaps, and anti-patterns
  using production patterns extracted from Claude Code's 512K LOC codebase. This skill
  should be used when the user asks to "review this agent architecture", "audit my agent
  system", "check my agent design", "is this agent pattern correct", "agent architecture
  review", "review my LLM application architecture", or when evaluating any AI agent,
  LLM orchestration, or tool-calling system design.
version: 0.1.0
---

# Agent Architecture Review

Structured architectural review of agent systems using 14 production design patterns,
4 specialist perspectives, and 4 scoring dimensions. Derived from reverse-engineering
Claude Code's internal architecture (512K LOC, 1,900 files).

## Review Process

### Step 1: Intake

Determine what is being reviewed. Accept any of:
- Codebase path or repository URL
- Architecture diagram or description
- Design document or RFC
- Code snippets showing agent loop, tool execution, or permission logic

If the user provides a codebase, read the entry points first: main file, agent loop,
tool registry, permission checks, and prompt assembly.

### Step 2: Four-Perspective Decomposition

Analyze from four specialist perspectives simultaneously:

**Architect Perspective** — Structure and patterns:
- Does the system separate concerns into layers (entry, query engine, tool system, agent layer, services, state)?
- Are budget and cost controls first-class constructor parameters or bolted-on afterthoughts?
- Is state management minimal and immutable (not Redux-scale)?
- Does tool ordering preserve cache stability?

**Research Perspective** — Precedent and best practices:
- Cross-reference against the 14 design patterns in `references/design-patterns.md`
- Identify which patterns are present, absent, or incorrectly applied
- Compare against known anti-patterns in `references/anti-patterns.md`

**Implementation Perspective** — Code-level concerns:
- Is tool execution streaming or wait-for-complete? (streaming reduces latency significantly)
- Are token recovery strategies implemented (auto-compact, max output recovery)?
- Is model output treated as untrusted input?
- Are there proper abort/cancellation mechanisms?

**Adversarial Perspective** — Failure modes and attacks:
- Cross-reference against the threat model in `references/threat-model.md`
- How many independent security layers exist? (target: 4)
- Can sandboxed processes modify their own sandbox configuration?
- Are temp file paths predictable or cryptographically randomized?

### Step 3: Score Across Four Dimensions

Rate each dimension 1-5 with specific findings:

**Security** (weight: 35%)
- Permission system: deny > ask > allow cascade present?
- Sandbox: write path allowlist + denylist?
- Path validation: shell expansion, tilde, UNC blocked?
- Environment scrubbing: credentials stripped from subprocess env?
- Model output: treated as untrusted?

**Performance** (weight: 25%)
- Streaming tool execution (not wait-for-complete)?
- Cache-stable tool ordering?
- Lazy loading / deferred imports?
- Token estimation: hybrid (exact + rough) or full recount every turn?
- Static/dynamic prompt boundary for cache optimization?

**Correctness** (weight: 25%)
- State immutability (DeepImmutable or equivalent)?
- Object.is equality to prevent spurious updates?
- Abort controller propagation through tool calls?
- Token recovery on context overflow?
- Proper error boundaries in tool execution?

**Maintainability** (weight: 15%)
- Layered architecture with clear boundaries?
- Feature flags for gradual rollout and security gating?
- Configuration migration system for config evolution?
- Minimal state management (not over-engineered)?
- Skills/plugin system for extensibility?

### Step 4: Synthesis and Recommendations

Produce a structured report:

1. **Architecture Score**: Weighted composite across 4 dimensions
2. **Critical Findings**: Issues that could cause security breaches or data loss
3. **Pattern Gap Analysis**: Which of the 14 patterns are missing and why they matter
4. **Prioritized Recommendations**: Ordered by impact, with implementation guidance
5. **Positive Observations**: What the architecture does well

## Reference Materials

- `references/design-patterns.md` — 14 production design patterns with detection criteria
- `references/anti-patterns.md` — What production agent systems specifically avoid
- `references/threat-model.md` — Agent-specific attack surface and defense layers