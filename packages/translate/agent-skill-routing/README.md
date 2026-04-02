# agent-skill-routing

ACD skill-based routing translated from Claude Code's 3-factor permission system pattern.

## Tier

**Translate** — New build from pattern adaptation.

## Priority

**P1** — Translate tier completion.

## Source Pattern

- **Recipe 1**: Permission System Applied to ACD
- **Source file**: `utils/permissions/` (permission evaluation logic)
- **KB sections**: Section 8 (Permission System), Recipe 1, Section 43 (Translate Tier)

## Domain Translation

Maps Claude Code's 3-factor permission evaluation to contact center ACD skill-based routing:

| Claude Code Concept | Contact Center Concept |
|---------------------|----------------------|
| Permission rule (deny/ask/allow) | Routing rule (deny/ask/allow) |
| Tool name pattern matching | Skill + agent group matching |
| Deny > Ask > Allow cascade | Deny > Ask > Allow routing cascade |
| Permission evaluation chain | Routing evaluation audit trail |
| User identity / org context | Agent profile / group membership |

## Key Insight

The deny > ask > allow cascade ensures safety by default. Deny rules are checked first (blocking unqualified agents), then ask rules (flagging for supervisor review), then allow rules (permitting routing). This mirrors how Claude Code's permission system blocks dangerous operations before considering conditional or allowed ones. The evaluation chain provides an audit trail for compliance.

## Exports

- `evaluate_rules(agent, skill, rules)` — Apply deny > ask > allow cascade
- `load_rules(path)` — Load routing rules from config file
- `check_compliance(agent, skill)` — Pre-filter proficiency/language check
- `RoutingAction` — Literal type: "deny", "ask", "allow"
- `RoutingRule` — Dataclass: skill, agent_group, action, priority, reason
- `RoutingDecision` — Dataclass: action, matched_rule, evaluation_chain
- `SkillRequirement` — Dataclass: skill_name, min_proficiency, language
- `AgentProfile` — Dataclass: agent_id, skills, proficiencies, groups

## Status

Type stubs only. All functions raise `NotImplementedError`.
