# 14 Production Design Patterns for Agent Systems

Extracted from Claude Code source analysis (512K LOC). These patterns are not documented
in any public API reference, tutorial, or open-source framework. Each pattern includes
detection criteria for architecture review.

## Pattern 1: Three-Factor Permission Rules

**What:** Permission evaluation uses a deny > ask > allow cascade with 7 priority-ordered
sources (policySettings, user, project, local, cliArg, command, session). Deny rules
always win. Ask rules trigger human review. Allow rules grant access only if no deny/ask
matches.

**Detection criteria:**
- Does the system have explicit deny rules checked before allow rules?
- Are permission sources ordered by priority?
- Is there an escalation path (ask) between deny and allow?

**Why it matters:** Most agent systems implement binary allow/deny. The three-factor
model with priority sources prevents privilege escalation across configuration scopes.

**Missing pattern risk:** HIGH — any permission system without deny-first evaluation
can be bypassed by overly broad allow rules.

## Pattern 2: Adaptive Denial Tracking

**What:** Track consecutive and total permission denials. After 3 consecutive denials,
fall back to a safer mode. After 20 total denials in a session, force a strategy change.

**Detection criteria:**
- Are permission denials counted?
- Is there a consecutive counter that resets on success?
- Does the system change behavior after repeated denials?

**Why it matters:** Without this, an agent can loop forever requesting denied actions.
The adaptive fallback prevents both infinite loops and brute-force permission probing.

**Missing pattern risk:** MEDIUM — system may loop or waste tokens on repeated denials.

## Pattern 3: Streaming Tool Execution

**What:** Begin executing tools as soon as the model streams out a tool_use block, without
waiting for the complete response. Tools execute concurrently with continued model output.

**Detection criteria:**
- Does tool execution start before the full API response completes?
- Is there a StreamingToolExecutor or equivalent?
- Can multiple tool calls execute in parallel?

**Why it matters:** This is the primary reason Claude Code feels faster than LangChain,
CrewAI, and AutoGen. Most frameworks wait for the complete response before executing any tools.

**Missing pattern risk:** LOW (performance only) — but the latency difference is significant
for interactive agent systems.

## Pattern 4: Cache-Stable Ordering

**What:** Tool definitions are sorted with built-in tools as a contiguous prefix and
dynamic/MCP tools appended after a boundary. The system prompt has a static/dynamic
boundary marker. Content before the boundary is globally cacheable.

**Detection criteria:**
- Are tools sorted deterministically?
- Is there a boundary between static and dynamic prompt content?
- Does the system use cache scopes (global > org > session > none)?

**Why it matters:** The Anthropic API caches prompts by content. If tool order changes
between requests, all downstream cache keys are invalidated. This pattern saves 40-70%
on API costs at scale.

**Missing pattern risk:** HIGH (cost) — API bills scale linearly without cache optimization.

## Pattern 5: Dual-Position Context Injection

**What:** System context (git status, environment) is injected at the END of the system
prompt for recency bias. User context (CLAUDE.md, project rules) is injected as the
FIRST user message for conversational framing.

**Detection criteria:**
- Is high-attention context placed at the system prompt end?
- Is conversational-framing context placed as the first user message?
- Are these two positions used intentionally (not arbitrarily)?

**Why it matters:** Transformer models give highest attention weight to tokens near the
end of a section (recency bias) and treat early user messages as establishing context.
Placing context in the wrong position reduces adherence by measurable amounts.

**Missing pattern risk:** MEDIUM — context may be present but underweighted by the model.

## Pattern 6: Four-Layer Security

**What:** Four independent security layers: permission system, sandbox, path validation,
and environment scrubbing. Any single-layer breach does not cause complete failure.

**Detection criteria:**
- How many independent security checks exist between model output and action execution?
- Can bypassing one layer compromise the system?
- Are the layers truly independent (not sharing bypass mechanisms)?

**Why it matters:** Defense in depth. The model's tool calls are treated as untrusted
input, identical to user form data in a web server.

**Missing pattern risk:** CRITICAL — single-layer security is the #1 agent vulnerability.

## Pattern 7: Budget as Constructor Parameter

**What:** Both dollar cost ceiling (maxBudgetUsd) and token budget (taskBudget) are
top-level configuration fields in the QueryEngine constructor. Cost control is
architectural, not bolted on after the fact.

**Detection criteria:**
- Is there a cost/token budget in the agent's initialization config?
- Can the budget be exceeded without explicit override?
- Is budget checked before each API call?

**Why it matters:** Runaway agent loops can accumulate significant API costs. Making
budget a constructor parameter ensures it cannot be forgotten.

**Missing pattern risk:** HIGH (financial) — unbounded agent loops are expensive.

## Pattern 8: Hybrid Token Estimation

**What:** Use exact token counts from the most recent API response plus rough estimates
(~4 chars/token) for messages added since. Avoids expensive full-history recount while
maintaining accuracy near the context limit.

**Detection criteria:**
- Is the token count updated from API response metadata?
- Are new messages estimated rather than exactly counted?
- Is there a fast-path estimation for non-critical calculations?

**Why it matters:** Full token recount on every turn is expensive. Pure estimation
risks context overflow. The hybrid approach gives accuracy where it matters (near limits)
and speed everywhere else.

**Missing pattern risk:** LOW — but either pure counting (slow) or pure estimation
(inaccurate) has tradeoffs.

## Pattern 9: Auto-Compact with Boundary Markers

**What:** When token count exceeds a threshold (with 13K buffer), generate an API summary
of the conversation history. Insert a CompactBoundary marker. Retry up to 3 times on
failure. Reserve min(maxOutputTokens, 20K) tokens for the summary.

**Detection criteria:**
- Is there automatic context compression?
- Does it use the model to summarize (not just truncate)?
- Is there a configurable threshold with buffer?
- Are there retry limits on compaction failure?

**Why it matters:** Without auto-compact, long conversations hit the context window
and fail. With it, conversations can run indefinitely.

**Missing pattern risk:** HIGH — long sessions will crash without context management.

## Pattern 10: Self-Referential Protection

**What:** Sandboxed processes cannot write to their own sandbox configuration files.
Settings files are deny-listed in sandbox write rules. The sandbox protects itself
from modification by the code it contains.

**Detection criteria:**
- Can code running inside the sandbox modify the sandbox rules?
- Are configuration files write-protected from sandboxed processes?

**Why it matters:** Without this, a malicious model output could weaken its own sandbox
by modifying the configuration.

**Missing pattern risk:** CRITICAL — sandbox escape via config modification.

## Pattern 11: Feature Flags as Security Perimeters

**What:** Feature flags serve dual purpose: gradual rollout AND hard security boundaries.
Some modes (like auto permission) require specific user types, making them impossible
for external users regardless of configuration.

**Detection criteria:**
- Are dangerous capabilities gated behind feature flags?
- Can feature flags be overridden by configuration alone?
- Is there a distinction between rollout flags and security flags?

**Why it matters:** Feature flags that can be enabled by end users are not security
boundaries. True security gating requires server-side enforcement.

**Missing pattern risk:** MEDIUM — false sense of security from client-side feature flags.

## Pattern 12: Cryptographic Nonce Paths

**What:** Temporary file paths include 16-byte cryptographic nonces (32 hex chars).
Prevents predictable-path attacks on shared filesystems.

**Detection criteria:**
- Are temp file paths randomized?
- Is the randomization cryptographic (not Math.random)?

**Why it matters:** Predictable temp paths enable TOCTOU attacks and symlink attacks.

**Missing pattern risk:** LOW in single-user systems, HIGH on shared filesystems.

## Pattern 13: Shell Expansion Rejection

**What:** All shell expansion syntax ($, %, =, ~user) is rejected before command execution.
This is a TOCTOU defense — the command is validated in its final form, not a pre-expansion form.

**Detection criteria:**
- Is shell input sanitized before execution?
- Are expansion characters explicitly blocked?
- Is validation done on the final command string?

**Why it matters:** Shell expansion can transform a safe command into a dangerous one
between validation and execution.

**Missing pattern risk:** HIGH — shell injection via expansion is a common agent attack vector.

## Pattern 14: Lightweight State (Not Over-Engineered)

**What:** ~20-line custom store with Object.is equality, DeepImmutable wrapper,
and subscribe/unsubscribe pattern. No Redux, no external state management library.

**Detection criteria:**
- Is state management proportional to needs?
- Is there immutability enforcement?
- Are unnecessary re-renders prevented?

**Why it matters:** Over-engineered state management in agent systems adds complexity
without benefit. The agent loop is inherently sequential — it does not need Redux.

**Missing pattern risk:** LOW — but over-engineering state is a common time waste.