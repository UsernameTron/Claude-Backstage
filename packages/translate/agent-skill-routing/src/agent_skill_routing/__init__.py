"""ACD skill routing translated from Claude Code 3-factor permission rules (Recipe 1).

Translate tier — applies Claude Code 3-factor permission rules to Genesys ACD
skill routing. Source Pattern: utils/permissions/ (Recipe 1).
Tier: Translate P1.

Maps Claude Code's deny > ask > allow permission cascade to contact center
skill-based routing decisions. An agent must satisfy skill requirements
(proficiency, language) and pass through a deny > ask > allow rule cascade
before receiving a routed interaction.

Source pattern: utils/permissions/ (permission evaluation)
KB reference: Recipe 1 — Permission System Applied to ACD, Section 43
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Literal

RoutingAction = Literal["deny", "ask", "allow"]
"""Routing action following the deny > ask > allow cascade from permission system."""


@dataclass
class RoutingRule:
    """A single routing rule in the deny > ask > allow cascade.

    Rules are evaluated in priority order. The first matching deny rule
    blocks routing. If no deny matches, ask rules trigger supervisor
    review. Otherwise, allow rules permit routing.
    """

    skill: str
    agent_group: str
    action: RoutingAction
    priority: int
    reason: str


@dataclass
class RoutingDecision:
    """Result of evaluating routing rules for an agent-skill pair.

    Contains the final action, the rule that matched (if any), and the
    full evaluation chain for audit logging.
    """

    action: RoutingAction
    matched_rule: RoutingRule | None
    evaluation_chain: list[str]


@dataclass
class SkillRequirement:
    """Skill requirements for an interaction to be routed.

    Defines the minimum proficiency level and optional language
    requirement for a skill-based routing decision.
    """

    skill_name: str
    min_proficiency: int
    language: str | None = None


@dataclass
class AgentProfile:
    """Agent profile with skills, proficiencies, and group memberships.

    Used to evaluate whether an agent can handle an interaction
    requiring specific skill requirements.
    """

    agent_id: str
    skills: list[str]
    proficiencies: dict[str, int] = field(default_factory=dict)
    groups: list[str] = field(default_factory=list)


def _matches_rule(agent: AgentProfile, skill: SkillRequirement, rule: RoutingRule) -> bool:
    """Check if a rule matches the agent-skill pair."""
    if rule.skill != skill.skill_name and rule.skill != "*":
        return False
    if rule.agent_group != "*" and rule.agent_group not in agent.groups:
        return False
    return True


def evaluate_rules(
    agent: AgentProfile,
    skill: SkillRequirement,
    rules: list[RoutingRule],
) -> RoutingDecision:
    """Evaluate routing rules for an agent-skill pair using deny > ask > allow cascade.

    Applies the 3-factor permission evaluation pattern: deny rules checked first,
    then ask rules, then allow rules. First matching rule in each tier wins.

    Args:
        agent: The agent profile to evaluate
        skill: The skill requirement to match against
        rules: Ordered list of routing rules to evaluate

    Returns:
        RoutingDecision with the final action and matched rule
    """
    sorted_rules = sorted(rules, key=lambda r: r.priority)
    chain: list[str] = []

    # Phase 1: Check deny rules first
    for rule in sorted_rules:
        if rule.action == "deny" and _matches_rule(agent, skill, rule):
            chain.append(f"deny: {rule.reason} (priority={rule.priority})")
            return RoutingDecision(action="deny", matched_rule=rule, evaluation_chain=chain)
        if rule.action == "deny":
            chain.append(f"deny skip: {rule.skill} does not match")

    # Phase 2: Check ask rules
    for rule in sorted_rules:
        if rule.action == "ask" and _matches_rule(agent, skill, rule):
            chain.append(f"ask: {rule.reason} (priority={rule.priority})")
            return RoutingDecision(action="ask", matched_rule=rule, evaluation_chain=chain)

    # Phase 3: Check allow rules
    for rule in sorted_rules:
        if rule.action == "allow" and _matches_rule(agent, skill, rule):
            chain.append(f"allow: {rule.reason} (priority={rule.priority})")
            return RoutingDecision(action="allow", matched_rule=rule, evaluation_chain=chain)

    # Default: allow if no rules match
    chain.append("default: no matching rules, allowing")
    return RoutingDecision(action="allow", matched_rule=None, evaluation_chain=chain)


def load_rules(path: str) -> list[RoutingRule]:
    """Load routing rules from a JSON configuration file.

    Args:
        path: Path to the rules configuration file (JSON array of rule objects)

    Returns:
        List of parsed RoutingRule objects
    """
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    return [
        RoutingRule(
            skill=entry["skill"],
            agent_group=entry["agent_group"],
            action=entry["action"],
            priority=entry["priority"],
            reason=entry["reason"],
        )
        for entry in data
    ]


def check_compliance(agent: AgentProfile, skill: SkillRequirement) -> bool:
    """Check if an agent meets the minimum requirements for a skill.

    Verifies proficiency level and language match without evaluating
    routing rules. Used for pre-filtering before full rule evaluation.

    Args:
        agent: The agent profile to check
        skill: The skill requirement to verify against

    Returns:
        True if the agent meets minimum requirements
    """
    # Check skill exists
    if skill.skill_name not in agent.skills:
        return False

    # Check proficiency
    proficiency = agent.proficiencies.get(skill.skill_name, 0)
    if proficiency < skill.min_proficiency:
        return False

    # Check language if required
    if skill.language is not None and skill.language not in agent.groups:
        return False

    return True
