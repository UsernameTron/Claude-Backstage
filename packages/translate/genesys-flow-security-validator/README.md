# @claude-patterns/genesys-flow-security-validator

Security audit for Genesys Architect call flows, translated from Claude Code's security audit patterns.

## Tier

**Translate** — New build from pattern adaptation.

## Priority

**P1** — Translate tier completion.

## Source Pattern

- **Pattern**: Security audit (dangerous command detection, path validation)
- **Source files**: Security subsystems (Sections 8-10, 38)
- **KB sections**: Section 8 (Permission System), Section 9 (Dangerous Commands), Section 10 (Path Validation), Section 38 (Security Patterns)

## Domain Translation

Maps Claude Code's security audit patterns to Genesys Architect flow security validation:

| Claude Code Concept | Contact Center Concept |
|---------------------|----------------------|
| Dangerous command detection | Unprotected data action calls |
| Path validation | Flow variable scope validation |
| Permission rules | Data access authorization checks |
| Input sanitization | External input validation in flows |
| Audit logging | PII exposure in debug/logging nodes |
| Security scan | Flow security vulnerability scan |

## Exports

- `validateFlow(flow)` — Validate flow against all built-in security rules
- `getBuiltInRules()` — Return set of built-in validation rules
- `ValidationSeverity` — Type: critical, warning, info
- `ArchitectNode` — Interface: id, type, label, properties, outgoingEdges
- `ArchitectFlow` — Interface: id, name, type, nodes, edges, version
- `FlowValidationRule` — Interface: id, severity, check, description
- `FlowVulnerability` — Interface: ruleId, severity, nodeId, flowName, description, remediation
- `FlowValidationResult` — Interface: valid, vulnerabilities, checkedRules, flowName

## Dependencies

None.

## Status

Working implementation. `validateFlow()` runs all built-in security rules against an Architect flow graph. `getBuiltInRules()` returns the rule set covering unprotected data actions, PII exposure in logging nodes, and unvalidated external inputs. Tests in `src/genesys-flow-security-validator.test.ts`.
