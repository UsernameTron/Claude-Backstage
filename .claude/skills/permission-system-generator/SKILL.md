---
name: permission-system-generator
description: >
  Generate a complete permission system for any application domain using the production
  3-factor rule engine pattern (deny > ask > allow) extracted from Claude Code. This skill
  should be used when the user asks to "generate a permission system", "build permissions
  for my app", "create access control rules", "permission system generator", "design
  authorization logic", "build a rule engine", or needs to implement deny/ask/allow
  access control for any domain including agent systems, APIs, contact centers, or
  workflow engines.
version: 0.1.0
---

# Permission System Generator

Generate a production-grade permission system for any application domain. Translates
Claude Code's 9.4K LOC permission architecture into a reusable, domain-adapted module.

## Generation Process

### Step 1: Domain Discovery

Gather the domain context:
- What actions/tools need permission control?
- Who are the actors (users, agents, services, roles)?
- What are the trust levels (anonymous, authenticated, admin, automated)?
- Are there external policy sources (enterprise, compliance, regulatory)?

### Step 2: Define Permission Modes

Map to the 6-mode model. Not all modes apply to every domain — select the relevant ones:

| Mode | Behavior | When to Include |
|------|----------|-----------------|
| `default` | Ask for all non-trivial actions | Always |
| `plan` | Read-only, no mutations | When read-only mode is useful |
| `acceptEdits` | Allow data mutations, ask for destructive ops | When edit workflows exist |
| `bypassPermissions` | Skip checks (dev/testing only) | Development environments |
| `dontAsk` | Execute without confirmation | Trusted automation pipelines |
| `auto` | AI classifier evaluates safety | When AI agents use the system |

### Step 3: Define Rule Sources with Priority

Establish the priority ordering for rule sources. Higher priority wins on conflict.
The Claude Code ordering (7 sources) serves as the template:

```
Priority 1 (highest): policySettings  → Enterprise/compliance mandates
Priority 2:           user            → User-level preferences
Priority 3:           project         → Project-scope rules
Priority 4:           local           → Local environment rules
Priority 5:           cliArg          → Runtime arguments
Priority 6:           command         → Per-command overrides
Priority 7 (lowest):  session         → Session-scope temporary rules
```

Adapt to the domain. For example, a contact center might use:
```
Priority 1: compliance    → Regulatory requirements
Priority 2: organization  → Company-wide policies
Priority 3: team          → Team/queue-level rules
Priority 4: supervisor    → Supervisor overrides
Priority 5: agent         → Agent-level preferences
Priority 6: session       → Per-interaction overrides
```

### Step 4: Define Three-Factor Rules

For each action in the system, generate three rule sets:

**Deny rules** (checked first, always win):
- Actions that are never allowed regardless of context
- Security-critical operations
- Compliance violations

**Ask rules** (checked second, trigger human review):
- Ambiguous operations that need judgment
- High-impact but legitimate actions
- Actions above a cost/risk threshold

**Allow rules** (checked last, grant access):
- Routine operations for authorized actors
- Pre-approved action patterns
- Cached permission decisions

Evaluation order: deny > ask > allow > mode default.

### Step 5: Add Denial Tracking

Implement adaptive denial tracking with configurable thresholds:

```
consecutive_denial_limit: 3   → Trigger fallback behavior
total_denial_limit: 20        → Force strategy change
```

On consecutive limit: fall back to a safer mode (e.g., from auto to default).
On total limit: force a mode change or escalation.
Reset consecutive counter on any successful permission grant.

### Step 6: Add Dangerous Pattern Detection

For domains with auto/AI-driven modes, define dangerous patterns that are automatically
stripped from allow rules even if user-configured:

- Patterns that enable code execution
- Patterns that grant write access to security-critical paths
- Patterns that bypass other security layers

### Step 7: Generate Output

Produce one of:
- **TypeScript module** — Types, interfaces, evaluation function, denial tracker
- **Python module** — Dataclasses, evaluation function, denial tracker
- **Configuration file** — JSON/YAML rules for systems that support external config

Include:
1. Type definitions for rules, modes, sources, and results
2. `hasPermission()` function implementing the deny > ask > allow cascade
3. `DenialTracker` class with consecutive and total counters
4. Dangerous pattern detection for auto modes
5. Unit test stubs for each rule combination

## Reference Materials

- `references/rule-engine-spec.md` — Complete specification of the 3-factor rule engine
- `references/domain-examples.md` — Worked examples for contact center, API, and workflow domains
