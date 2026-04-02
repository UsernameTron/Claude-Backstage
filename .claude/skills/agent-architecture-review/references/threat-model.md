# Agent System Threat Model

Attack surface map for AI agent systems that execute model-generated actions.
Extracted from Claude Code's security architecture. Use during adversarial review.

## Attack Surface Categories

### 1. Prompt Injection → Tool Execution

**Vector:** Malicious content in files, web pages, or MCP tool results triggers the
model to execute unintended tool calls.

**Claude Code defenses:**
- Permission system evaluates every tool call (deny > ask > allow)
- YOLO classifier (model-watching-model) independently evaluates safety in auto mode
- Sandbox restricts write paths and network access
- Path validation blocks traversal attempts

**Review checklist:**
- [ ] Are tool calls validated against permission rules?
- [ ] Is there an independent safety classifier for autonomous modes?
- [ ] Are tool inputs validated against schemas?
- [ ] Can injected content escalate permissions?

### 2. Shell Injection

**Vector:** Model generates shell commands containing expansion syntax, pipes to
dangerous commands, or embeds payloads in arguments.

**Claude Code defenses:**
- AST-based security analysis (parseForSecurity)
- Shell expansion syntax rejection ($, %, =, ~user)
- Dangerous command pattern detection (CROSS_PLATFORM_CODE_EXEC list)
- Compound command decomposition (pipes, semicolons analyzed independently)

**Review checklist:**
- [ ] Are shell commands parsed/analyzed before execution?
- [ ] Is shell expansion blocked?
- [ ] Are dangerous command patterns detected?
- [ ] Are compound commands decomposed and checked individually?

### 3. Path Traversal

**Vector:** Model generates file paths that escape the working directory via .., symlinks,
tilde expansion, or UNC paths.

**Claude Code defenses:**
- Path normalization before validation
- Tilde expansion blocking
- UNC path rejection (Windows)
- Case-insensitive comparison on case-insensitive filesystems
- Symlink resolution

**Review checklist:**
- [ ] Are paths normalized before security checks?
- [ ] Is .. traversal blocked?
- [ ] Are symlinks resolved before path validation?
- [ ] Are platform-specific path attacks handled (UNC, tilde)?

### 4. Credential Leakage

**Vector:** Model generates commands or file reads that expose API keys, tokens, or
passwords stored in environment variables or config files.

**Claude Code defenses:**
- Subprocess environment scrubbing (remove credentials before spawning)
- Secure storage for sensitive values (macOS Keychain integration)
- Config file write protection in sandbox
- MCP tool result size limits (100K chars max)

**Review checklist:**
- [ ] Are environment variables scrubbed before subprocess creation?
- [ ] Are credentials stored in secure storage (not plain text)?
- [ ] Can the model read credential files?
- [ ] Are tool result sizes bounded?

### 5. Sandbox Escape

**Vector:** Model generates actions that weaken or escape the sandbox, either by
modifying sandbox config, exploiting bare Git repos, or DNS tunneling.

**Claude Code defenses:**
- Self-referential protection (sandbox config is write-protected)
- Bare Git repository defense (prevents hook-based code execution)
- DNS delegation restrictions
- Write path allowlist + denylist (denylist wins on conflict)

**Review checklist:**
- [ ] Can sandboxed code modify the sandbox configuration?
- [ ] Are Git hooks a code execution vector?
- [ ] Is network access restricted to allowlisted domains?
- [ ] Does the denylist take precedence over the allowlist?

### 6. Resource Exhaustion

**Vector:** Model enters infinite tool loops, generates unbounded output, or triggers
expensive operations repeatedly.

**Claude Code defenses:**
- Budget constraints (maxBudgetUsd, taskBudget) as constructor parameters
- Max output recovery with 3-retry limit
- Auto-compact failure limit (3 consecutive)
- Denial tracking with adaptive fallback (3 consecutive, 20 total)

**Review checklist:**
- [ ] Is there a cost/token budget?
- [ ] Are retries bounded?
- [ ] Does the system adapt after repeated failures?
- [ ] Can the model trigger expensive operations without limits?

## Four-Layer Defense Model

Each layer operates independently. Evaluate coverage across all four:

| Layer | Function | Key Question |
|-------|----------|-------------|
| **Permission System** | Rule-based access control | Does every tool call go through deny > ask > allow? |
| **Sandbox** | Execution environment isolation | Are write paths, network, and processes constrained? |
| **Path Validation** | Filesystem security | Are all path attacks (traversal, expansion, symlink) blocked? |
| **Environment Scrubbing** | Credential protection | Are secrets removed before subprocess execution? |

**Scoring:**
- 4 layers present: Production-grade
- 3 layers: Acceptable with documented gaps
- 2 layers: Significant risk
- 1 layer: Critical vulnerability
- 0 layers: Do not deploy