# Knowledge Base Document Template

Use this template to structure the output KB. Not all sections apply to every codebase —
include only sections with substantive findings. The section numbering is sequential;
skip numbers for omitted sections so the ToC remains stable across revisions.

## Document Header

```markdown
# [Project Name] Source Code: Technical Knowledge Base

> **Version:** [semver]
> **Date:** [month year]
> **Author:** [name]
> **Document Classification:** Engineering Reference — Knowledge Base
> **Source Material:** [description of source material and analysis scope]
> **Scope:** [which aspects were analyzed]
> **Intended Use:** [who reads this and why]
> **What Makes This Unique:** [what you can learn here that you can't learn from docs]

### Changelog
| Version | Date | Changes |
|---------|------|---------|
| x.y.z | [date] | [what changed] |

### Deployment Targets
[Full reference vs context injection variant vs pattern catalog only]
```

## Part I — Core Architecture

```markdown
## 1. Overall Architecture

### 1.1 Technology Stack
[Runtime, build system, UI framework, core dependencies]

### 1.2 Directory Structure
[Table: directory/file → responsibility → key files]

### 1.3 Layered Architecture
[ASCII diagram showing layers from entry to state]

## 2. Entry Points and Startup Process

### 2.1 Startup Sequence
[ASCII tree showing init order with parallel branches]

### 2.2 Init Parallelism
[What runs concurrently during startup, with code example]

### 2.3 Operating Modes
[Table: mode → entry → use case]

## 3. Feature Flags / Build Configuration
[Flag registry: flag → purpose → security role]

## 4. Configuration System
[Migration versioning, config format, evolution strategy]

## 5. Core Processing Loop
[Data structures, flow diagram, state transitions]

### 5.1 Core Data Structure
[Primary type definitions with commentary]

### 5.2 Loop Flow
[ASCII flow: input → process → tool execution → output]

### 5.3 Recovery Strategies
[Table: strategy → trigger → mechanism]

## 6. Action/Tool System
[Tool registry, type definitions, filtering/ordering]

### 6.1 Type Definitions
[Key interfaces with field-level commentary]

### 6.2 Complete Registry
[Table: category → items → description]

### 6.3 Filtering Layers
[How actions are gated: compile-time → runtime → assembly]

## 7. State Management
[Store implementation, state shape, change detection]
```

## Part II — Security Architecture

```markdown
## 8. Permission System
[Modes, rule sources, evaluation order, pattern matching]

## 9. Sandbox Mechanism
[Write paths, network, process restrictions]

## 10. Input Validation
[Path validation, shell injection defense, type checking]

## 11. Network Security
[Allowed domains, proxy config, DNS restrictions]

## 12. Injection Defense
[How untrusted input is handled at each layer]

## 13. Credential Protection
[Secret storage, environment scrubbing, exposure prevention]

## 14. Audit and Telemetry
[What's logged, sampling rates, kill switches]
```

## Part III — Domain-Specific Architecture

Sections vary by codebase type. Examples:

**For LLM/Agent systems:**
```markdown
## 15. System Prompt Construction
## 16. Context Collection and Injection
## 17. Memory System
## 18. Token Management
## 19. Dialogue History Management
## 20. Prompt Cache Optimization
```

**For Web applications:**
```markdown
## 15. API Design and Routing
## 16. Authentication and Session Management
## 17. Data Access Layer
## 18. Caching Strategy
## 19. Background Job Processing
```

**For CLI tools:**
```markdown
## 15. Command Parsing and Routing
## 16. Interactive vs Non-Interactive Modes
## 17. Output Formatting
## 18. Plugin/Extension System
```

## Part IV — Extensibility

```markdown
## 22. Plugin/Extension System
[Loading, registration, lifecycle]

## 23. External Integration
[API clients, protocol adapters, service mesh]

## 24. Multi-Component Orchestration
[If applicable: multi-agent, microservice coordination]
```

## Part V — Performance and UX

```markdown
## 27. Lazy Loading Strategy
[Tiered loading: compile-time → runtime → deferred]

## 28. Output Pipeline
[Rendering, streaming, buffering]

## 29. Cost/Resource Tracking
[Usage metering, budget enforcement]

## 30. Startup Profiling
[Measurement approach, sampling, thresholds]
```

## Part VI — Extracted Knowledge (UNIQUE TO KB)

This is the most valuable section. Everything above documents WHAT the system does.
This section documents WHY it works and HOW to apply the insights elsewhere.

```markdown
## 37. Undocumented Design Patterns
[Numbered patterns with: What, Why, How, Transfer, Detection, Missing Risk]

## 38. Threat Model and Attack Surface Map
[Attack categories, defense layers, coverage matrix]

## 39. Complete Numerical Constants Reference
[Every hardcoded threshold, limit, buffer size, retry count]
### Categories:
- Token Management constants
- Security constants
- Memory/Cache constants
- Performance budgets
- Rendering thresholds

## 40. Domain-Specific Insider Knowledge
[Non-obvious insights that change how you'd build a similar system]
[e.g., "Context placement affects model behavior" for LLM systems]

## 41. Anti-Patterns and Defensive Coding
[What the codebase specifically avoids and why]

## 42. Reusable Implementation Recipes
[Step-by-step recipes distilled from the implementation]
### Recipe format:
```
### Recipe N: [Name]
1. [Step]
2. [Step]
...
```

## 43. Cross-Domain Application Map
[Table: Source Pattern → Application in Domain X]
[Expanded guidance for highest-value transfers]

## 44. Source File Index
[Table: File → Purpose, grouped by function]
### Categories:
- Security files
- Architecture files
- UI/Performance files
- Configuration files
- Test files
```

## Token Budget Guidelines

| Output Format | Target Size | Use Case |
|--------------|-------------|----------|
| Full KB | Unlimited | Portfolio artifact, deep reference |
| Context injection | <80K tokens | CLAUDE.md, RAG retrieval |
| Pattern catalog | <20K tokens | Quick reference, review checklist |
| Executive summary | <5K tokens | Stakeholder briefing |

For context injection variants: strip methodology, changelog, deployment notes, and
verbose code examples. Retain all technical content, patterns, constants, and recipes.
