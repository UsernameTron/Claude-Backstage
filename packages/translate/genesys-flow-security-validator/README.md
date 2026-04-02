# @claude-patterns/genesys-flow-security-validator

Security validation for Genesys Architect call flows, translating Claude Code's permission and threat model patterns into flow vulnerability detection.

## Tier

**Translate** — New builds from pattern adaptation.

## Priority

**P1** — Security validation is foundational for any Genesys Architect deployment pipeline.

## Source Pattern

- **Source pattern**: Security audit patterns (Sections 8-10, Section 38 Threat Model)
- **KB sections**: Section 8 (Permission System), Section 9 (Sandbox), Section 10 (File System Security), Section 38 (Threat Model), Section 43 (Genesys flow security)

## Domain Translation

| Claude Code Concept | Genesys Architect Concept |
|---------------------|--------------------------|
| Permission check chain (deny->ask->allow) | Flow validation rule chain |
| Dangerous command patterns | Dangerous flow patterns (open transfer, unvalidated external data) |
| Path validation (traversal, injection) | Data action URL validation |
| Sandbox write deny list | Protected flow element deny list (production queues, trunk configs) |
| Threat model attack vectors | Architect flow vulnerability patterns |

## Key Insight

Claude Code's security model uses a layered deny-then-ask-then-allow permission chain to prevent dangerous operations. Genesys Architect flows have an analogous problem: flows can contain dangerous patterns like open transfers to external numbers, unvalidated data action URLs, missing error handling on critical paths, and PII exposure in logging nodes. By translating Claude Code's permission check chain into a flow validation rule chain, each rule acts as a security gate that identifies vulnerabilities by severity before the flow reaches production.

## Exports

- `FlowValidationRule` — Interface for a single validation rule with check function
- `FlowVulnerability` — A detected vulnerability in a flow
- `FlowValidationResult` — Aggregated validation result for an entire flow
- `ValidationSeverity` — Severity type: "critical" | "warning" | "info"
- `ArchitectFlow` — Interface representing a Genesys Architect flow
- `ArchitectNode` — Interface representing a single node in an Architect flow
- `validateFlow` — Validate an Architect flow against all built-in rules
- `getBuiltInRules` — Returns the set of built-in security validation rules

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
