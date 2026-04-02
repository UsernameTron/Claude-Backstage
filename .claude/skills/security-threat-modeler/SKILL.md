---
name: security-threat-modeler
description: >
  Model threats and attack surfaces for AI agent systems, LLM applications, and CLI tools
  that execute model-generated actions. Uses Claude Code's 4-layer defense model and
  agent-specific threat categories as the authoritative rubric. This skill should be used
  when the user asks to "threat model my agent", "security review my LLM app", "what are
  the attack vectors", "threat model", "security threat model", "agent security audit",
  "is my agent system secure", "attack surface analysis", or needs to evaluate security
  for any system where AI/LLM output triggers real-world actions.
version: 0.1.0
---

# Security Threat Modeler for Agent Systems

Map attack surfaces and model threats for systems where AI-generated output triggers
real-world actions. Uses the 4-layer defense model and 6 threat categories extracted
from Claude Code's security architecture.

## What Makes Agent Threats Different

Traditional application security assumes human users generate input. Agent systems face
a fundamentally different threat: the model itself generates the actions, and those
actions can be influenced by adversarial content in files, web pages, tool results, or
conversation history (prompt injection).

This means the model's output must be treated as untrusted input — identical to user
form data in a web server. Every tool call is a potential attack vector.

## Threat Modeling Process

### Step 1: System Inventory

Map the system's components:
- What actions can the agent take? (file ops, shell commands, API calls, data mutations)
- What inputs does the agent process? (user messages, files, web content, tool results)
- What external systems does the agent connect to? (APIs, databases, MCP servers)
- What credentials/secrets does the agent have access to?
- What is the deployment context? (single-user, multi-tenant, shared filesystem)

### Step 2: Threat Category Analysis

Evaluate against 6 agent-specific threat categories. For each category, determine:
exposure level (none, low, medium, high, critical), existing mitigations, and gaps.

**Category 1: Prompt Injection → Tool Execution**
Can adversarial content in files, web pages, or tool results cause the model to execute
unintended tool calls? This is the #1 agent-specific threat.

Attack vectors:
- Malicious instructions embedded in files the agent reads
- Adversarial content in web search results
- Crafted MCP tool responses that redirect agent behavior
- Conversation history poisoning via multi-turn manipulation

**Category 2: Shell Injection**
Can the model generate shell commands that execute arbitrary code? This includes direct
injection, shell expansion attacks, and compound command exploitation.

Attack vectors:
- Shell expansion syntax ($, %, =, ~user) in generated commands
- Pipe chains to dangerous commands
- Argument injection via crafted filenames
- Compound commands (;, &&, ||) that bypass per-command validation

**Category 3: Path Traversal**
Can the model generate file paths that escape the intended directory? This includes
classic traversal, symlink following, and platform-specific attacks.

Attack vectors:
- ../../../etc/passwd style traversal
- Symlink creation pointing outside sandbox
- Tilde expansion (~user/sensitive_file)
- UNC paths on Windows (\\server\share)
- Case-sensitivity mismatches on case-insensitive filesystems

**Category 4: Credential Leakage**
Can the model access or exfiltrate secrets stored in environment variables, config files,
or secure storage?

Attack vectors:
- Reading .env files or config files containing secrets
- Accessing environment variables via shell commands
- Exfiltrating credentials through tool results or model output
- Credential persistence in conversation history (visible after compact)

**Category 5: Sandbox Escape**
Can the model weaken or escape its execution constraints?

Attack vectors:
- Modifying sandbox configuration files
- Exploiting Git hooks in bare repositories
- DNS tunneling through allowed network endpoints
- Write to paths that affect sandbox behavior

**Category 6: Resource Exhaustion**
Can the model cause unbounded resource consumption?

Attack vectors:
- Infinite tool loops (tool A calls tool B calls tool A)
- Unbounded output generation
- Retry storms on failing operations
- Expensive operations without cost checks

### Step 3: Defense Layer Assessment

Evaluate the system against Claude Code's 4-layer defense model:

| Layer | Function | Present? | Implementation Quality |
|-------|----------|----------|----------------------|
| **Permission System** | Rule-based access control (deny > ask > allow) | | |
| **Sandbox** | Execution environment isolation | | |
| **Path Validation** | Filesystem security (traversal, expansion, symlink) | | |
| **Environment Scrubbing** | Credential protection from subprocesses | | |

Score:
- 4 layers: Production-grade security
- 3 layers: Acceptable with documented gaps
- 2 layers: Significant risk — do not deploy to production without remediation
- 1 layer: Critical vulnerability — immediate action required
- 0 layers: Do not deploy under any circumstances

### Step 4: Generate Threat Matrix

Produce a matrix crossing threat categories with defense layers:

```
                    | Permission | Sandbox | Path Valid. | Env Scrub |
Prompt Injection    |            |         |             |           |
Shell Injection     |            |         |             |           |
Path Traversal      |            |         |             |           |
Credential Leakage  |            |         |             |           |
Sandbox Escape      |            |         |             |           |
Resource Exhaustion |            |         |             |           |
```

For each cell: mark as COVERED (defense addresses threat), PARTIAL (some coverage),
GAP (defense does not address), or N/A (not applicable).

### Step 5: Prioritized Remediation Plan

For each GAP and PARTIAL finding:
1. Severity: Critical / High / Medium / Low
2. Exploitability: How easy is this to exploit?
3. Impact: What happens if exploited?
4. Remediation: Specific implementation guidance
5. Pattern reference: Which of the 14 design patterns addresses this?

Order by: Critical first, then by exploitability.

## Output Format

### Threat Model Report

1. **Executive Summary** — Overall security posture (1-2 sentences)
2. **System Inventory** — Components, actions, inputs, connections
3. **Defense Layer Score** — X/4 layers with implementation quality
4. **Threat Matrix** — 6 categories x 4 layers with coverage status
5. **Critical Findings** — Gaps that could lead to security breaches
6. **Remediation Plan** — Prioritized actions with implementation guidance
7. **Positive Findings** — What the system does well

## Reference Materials

- `references/attack-vectors.md` — Detailed attack vectors with exploitation examples
- `references/defense-implementations.md` — Implementation specs for each defense layer