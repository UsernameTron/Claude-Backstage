# Extraction Methodology — Detailed Checklists

The complete reverse-engineering methodology used to produce the Claude Code Technical
Knowledge Base v2.1. Each phase has explicit deliverables and completion criteria.

## Phase 1: Source Acquisition and Reconnaissance

### Checklist

- [ ] Locate all entry points (main, CLI, SDK, server, MCP)
- [ ] Read package manifest (dependencies, scripts, workspaces)
- [ ] Map top-level directory structure
- [ ] Identify language, runtime, build system
- [ ] Count LOC by directory (approximate)
- [ ] Identify test framework and coverage approach
- [ ] Identify CI/CD configuration
- [ ] List all config files and their roles
- [ ] Identify feature flag system (if present)
- [ ] Identify environment-specific configurations

### Entry Point Discovery Heuristics

Look for these patterns to find entry points:

```
# Package.json
"main", "bin", "exports", "scripts.start", "scripts.dev"

# Python
__main__.py, cli.py, app.py, manage.py, setup.py entry_points

# Rust
src/main.rs, src/lib.rs, [[bin]] in Cargo.toml

# Go
cmd/*/main.go, main.go
```

### Deliverable

```markdown
## Codebase Profile

| Attribute | Value |
|-----------|-------|
| Language | [primary language] |
| Runtime | [runtime/version] |
| Framework | [framework if applicable] |
| Build System | [bundler/compiler] |
| LOC (approx) | [estimate] |
| Entry Points | [count and names] |
| Test Framework | [framework] |
| CI/CD | [system] |

### Directory Map
[top-level directories with purpose annotations]

### Entry Point Inventory
[each entry point with its role and initial call chain]
```

## Phase 2: Systematic Decomposition

### Execution Path Tracing Protocol

For each entry point, trace the full lifecycle:

1. **Start at the entry point.** Read the file top to bottom.
2. **Follow imports.** For each imported module, note what it provides.
3. **Trace the init sequence.** What happens before the main loop starts?
   - What is loaded eagerly vs lazily?
   - What runs in parallel vs sequential?
   - What is feature-flag gated?
4. **Map the core loop.** What is the steady-state execution pattern?
   - Request → Process → Response cycle
   - Event loop structure
   - Message/query pipeline
5. **Trace action execution.** When the system does something (file write, API call,
   tool execution), what checks and transformations happen?
6. **Map shutdown.** What cleanup happens? What state is persisted?

### Key Questions at Each Stage

| Stage | Question | Why It Matters |
|-------|----------|---------------|
| Init | What loads before first user interaction? | Startup performance |
| Init | What is deferred to after first render? | Perceived performance |
| Core Loop | Is processing streaming or batch? | Latency characteristics |
| Core Loop | What state is mutable vs immutable? | Correctness guarantees |
| Action | How many validation layers exist? | Security depth |
| Action | What happens on failure? | Resilience model |
| Shutdown | What state persists between sessions? | Data durability |

### Deliverable

```markdown
## Execution Flow

### Entry Point: [name]
[ASCII flow diagram showing the call chain]

### Init Sequence
[Parallel vs sequential, eager vs lazy, flag-gated]

### Core Loop
[Main processing pattern with branching]

### Action Execution Path
[Validation layers, sandboxing, side effects]

### State Lifecycle
[What's created, mutated, persisted, cleaned up]
```

## Phase 3: Security Architecture Extraction

### Security Trace Protocol

For every action the system can take that has side effects (file write, network call,
process spawn, data mutation):

1. **Identify the permission check.** Is there one? Where? What does it evaluate?
2. **Identify the sandbox.** Is the action constrained? How?
3. **Identify input validation.** Is the action's input sanitized? What patterns are blocked?
4. **Identify credential exposure.** Could this action leak secrets?
5. **Identify the trust boundary.** Where does trusted input end and untrusted begin?

### Attack Surface Mapping

For each external input source (user input, file content, network responses, tool results):

```
Input Source → [Parsing] → [Validation] → [Permission Check] → [Sandbox] → [Execution]
                  ↓              ↓                ↓                 ↓
              Parse errors   Rejected input   Permission denied   Sandbox violation
```

Document what happens at each rejection point. Does the system fail safely?

### Security Layer Inventory

Count independent security layers. For each layer:

| Layer | What It Checks | Can It Be Bypassed Independently? | Bypass Impact |
|-------|---------------|----------------------------------|---------------|
| [name] | [description] | [yes/no/how] | [what happens] |

### Deliverable

```markdown
## Security Architecture

### Defense Layers
[Table of all security layers with independence analysis]

### Permission System
[Rules, modes, sources, evaluation order]

### Sandbox Configuration
[Allowed/denied paths, network, processes]

### Threat Model
[Attack categories with coverage assessment]

### Constants
[Security-relevant thresholds and limits]
```

## Phase 4: Pattern Extraction

### Pattern Identification Protocol

A design pattern is worth extracting if it meets ALL of these criteria:

1. **Intentional** — The pattern is deliberately applied, not accidental
2. **Non-obvious** — The approach is not the first thing a developer would try
3. **Transferable** — The pattern can be applied in a different codebase or domain
4. **Documented by code, not comments** — The pattern is evident from the implementation,
   not just explained in a comment

### Pattern Extraction Checklist

For each candidate pattern:

- [ ] Name it descriptively (not "Pattern 1" — use "Cache-Stable Ordering")
- [ ] Write a 2-3 sentence "What" description
- [ ] Explain "Why this over alternatives" — what was the tradeoff?
- [ ] Extract exact implementation details (types, constants, algorithms)
- [ ] Define detection criteria — how would you check if another codebase uses this?
- [ ] Identify at least one cross-domain application
- [ ] Assess "missing pattern risk" — what goes wrong without it?

### Anti-Pattern Extraction

Equally valuable: what does the codebase deliberately AVOID?

Look for:
- Comments explaining why something was NOT done
- Absence of common frameworks/libraries (e.g., no Redux in a React app)
- Defensive coding patterns that prevent specific mistakes
- Configuration that explicitly blocks certain operations

### Deliverable

```markdown
## Extracted Patterns

### Pattern N: [Name]
**What:** [2-3 sentences]
**Why:** [Tradeoff rationale]
**How:** [Implementation details with code]
**Transfer:** [Cross-domain application]
**Detection:** [How to check for this pattern]
**Missing risk:** [What goes wrong without it]

## Anti-Patterns Avoided
[What the codebase deliberately does NOT do, and why]
```

## Phase 5: Knowledge Base Assembly

### Assembly Protocol

1. **Organize by theme, not by file.** Group findings into architectural themes,
   not a file-by-file walkthrough.
2. **Lead with architecture, end with extracted knowledge.** The reader should
   understand the system before seeing the patterns.
3. **Include code examples.** Types, key functions, configuration structures.
   Not full implementations — just enough to understand the design.
4. **Flag "Critical Insights."** Non-obvious discoveries that change how you'd
   build a similar system.
5. **Include a constants reference.** Every hardcoded threshold, limit, and
   configuration value in one table.
6. **Include a source file index.** Map key files to their purpose for navigation.
7. **Version and date the document.** This is a living artifact.

### Quality Criteria

The KB is complete when:
- [ ] Every entry point has a traced execution path
- [ ] Every security layer is documented with independence analysis
- [ ] At least 5 design patterns are extracted with detection criteria
- [ ] At least 3 anti-patterns are documented
- [ ] All numerical constants are cataloged
- [ ] A cross-domain application map exists
- [ ] A source file index maps key files to purposes
- [ ] The document has a clear table of contents
- [ ] Version and date metadata are included
