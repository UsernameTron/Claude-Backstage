---
name: monorepo-pattern-extractor
description: >
  Extract undocumented design patterns, architectural decisions, security models, and
  reusable recipes from any codebase using the same reverse-engineering methodology that
  produced the Claude Code Technical Knowledge Base v2.1. Produces a structured KB document
  with patterns, threat models, constants, recipes, and cross-domain application maps.
  This skill should be used when the user asks to "extract patterns from this codebase",
  "reverse engineer this architecture", "build a knowledge base from this code",
  "monorepo pattern extractor", "what patterns does this codebase use", "document this
  architecture", "extract design patterns", "codebase analysis", "deep code review",
  "architectural knowledge extraction", or needs to produce a technical knowledge base
  from source code analysis. Activates the ultrathink multi-agent orchestration pattern
  for 4-perspective analysis.
version: 0.1.0
---

# Monorepo Pattern Extractor

Reverse-engineer any codebase into a structured technical knowledge base. Uses the same
5-phase methodology that produced the Claude Code Technical Knowledge Base v2.1 (512K LOC
→ 44 sections, 14 design patterns, 6 recipes, complete threat model). Integrates with
ultrathink for multi-agent decomposition at each phase.

## When to Use

- Onboarding to an unfamiliar codebase
- Creating internal documentation that captures the *why*, not just the *what*
- Extracting transferable patterns for use in other projects
- Building portfolio artifacts that demonstrate deep technical understanding
- Pre-acquisition or pre-integration technical due diligence

## Extraction Process

### Phase 1: Source Acquisition and Reconnaissance

**Objective:** Map the terrain before going deep.

Read entry points first. Every codebase has a small number of files that reveal the
overall structure. Find them:

1. **Entry points** — main/index files, CLI entry, server bootstrap, SDK exports
2. **Package manifest** — package.json, pyproject.toml, Cargo.toml, go.mod
3. **Directory listing** — top-level structure reveals architectural decisions
4. **Dependency graph** — what depends on what (imports, workspace refs)
5. **Config files** — tsconfig, eslint/biome, CI/CD, Dockerfile

**Ultrathink delegation:**
- **Architect:** "What does the directory structure tell us about layering?"
- **Research:** "What framework/runtime choices were made and what do they imply?"

**Output:** Codebase profile — language, runtime, framework, LOC estimate, directory
map, entry point inventory.

### Phase 2: Systematic Decomposition

**Objective:** Trace execution paths from entry to output.

Follow the call chain from each entry point through the full lifecycle:

```
Entry → Init/Bootstrap → Config/State Setup → Core Loop → Action/Tool Execution
    → Output/Rendering → Cleanup/Shutdown
```

At each stage, document:
- What happens (function names, module boundaries)
- What decisions are made (branching, feature flags, mode selection)
- What state is created or mutated
- What external calls are made (APIs, filesystem, network)

**Ultrathink delegation:**
- **Architect:** "What are the layers? Where are the boundaries?"
- **Coder:** "What are the key data structures and type contracts?"
- **Tester:** "What are the failure modes at each stage?"

**Output:** Execution flow diagram with module boundaries and data flow.

### Phase 3: Security Architecture Extraction

**Objective:** Map every trust boundary, permission check, and defensive mechanism.

Trace the security path for each action the system can take:

1. **Permission checks** — Who checks? What rules? What priority order?
2. **Sandbox boundaries** — What's restricted? Write paths, network, processes?
3. **Input validation** — Where is untrusted input sanitized? What patterns are blocked?
4. **Credential handling** — Where are secrets stored? How are they scrubbed from subprocesses?
5. **Attack surface** — What can an adversary control? What's the blast radius?

**Ultrathink delegation:**
- **Architect:** "How many independent security layers exist?"
- **Research:** "What known attack vectors apply to this system type?"
- **Tester:** "What happens if each security layer is individually bypassed?"

**Output:** Threat model with attack categories, defense layers, and gap analysis.

### Phase 4: Pattern Extraction

**Objective:** Identify design patterns that are transferable to other systems.

Look for patterns in 7 categories:

| Category | What to Look For |
|----------|-----------------|
| **Security** | Permission models, sandbox design, input validation strategies |
| **Performance** | Caching strategies, lazy loading, streaming vs batch, deferred init |
| **State** | State management approach, immutability, change detection |
| **Resilience** | Retry strategies, fallback behavior, circuit breakers, adaptive thresholds |
| **Extensibility** | Plugin/skill systems, hook patterns, dynamic loading |
| **Cost Control** | Budget enforcement, usage tracking, resource limits |
| **Prompt Engineering** | Context injection, cache optimization, token management (LLM systems) |

For each pattern found, extract:
- **Name** — Descriptive, reusable name
- **What** — What it does in 2-3 sentences
- **Why** — Why this approach over alternatives
- **How** — Key implementation details (types, algorithms, constants)
- **Transfer** — How to apply this pattern in other domains
- **Detection criteria** — How to check if a system uses (or is missing) this pattern

**Ultrathink delegation:**
- **Architect:** "Is this a genuine pattern or just local convention?"
- **Research:** "Does this pattern have precedent? Is it novel?"
- **Coder:** "What are the exact implementation details and constants?"
- **Tester:** "What breaks if this pattern is removed or incorrectly applied?"

**Output:** Numbered pattern catalog with detection criteria.

### Phase 5: Knowledge Base Assembly

**Objective:** Compile all findings into a structured, versioned document.

Use the KB template in `references/kb-template.md` to organize findings into:

1. **Core Architecture** — Layers, entry points, data flow, state management
2. **Security Architecture** — Permission system, sandbox, validation, threat model
3. **Domain-Specific Architecture** — Prompt engineering, extensibility, networking (varies by codebase)
4. **Performance and UX** — Startup optimization, rendering, caching
5. **Extracted Knowledge** — Design patterns, anti-patterns, constants, recipes, cross-domain map
6. **Source File Index** — Key files mapped to their purpose

Each section should contain:
- Architectural decisions with rationale
- Code examples (types, key functions, configuration)
- Constants and numerical thresholds
- "Critical insight" callouts for non-obvious discoveries
- Anti-patterns the codebase deliberately avoids

## Output Formats

Generate one of:
- **Full KB markdown** — Complete knowledge base document (portfolio/reference artifact)
- **Context injection variant** — Trimmed version for use as CLAUDE.md or RAG chunks (<80K tokens)
- **Pattern catalog only** — Just the extracted patterns with detection criteria
- **Executive summary** — 2-page architectural overview for non-technical stakeholders

## Reference Materials

- `references/extraction-methodology.md` — Detailed 5-phase methodology with checklists
- `references/kb-template.md` — Complete template structure for the output KB document
- `references/pattern-catalog.md` — Pattern detection checklist and categorization framework
