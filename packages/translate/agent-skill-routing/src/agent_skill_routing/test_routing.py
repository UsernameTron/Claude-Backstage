"""Tests for agent-skill-routing deny > ask > allow cascade."""

from agent_skill_routing import (
    AgentProfile,
    RoutingAction,
    RoutingDecision,
    RoutingRule,
    SkillRequirement,
    check_compliance,
    evaluate_rules,
    load_rules,
)


class TestEvaluateRulesDenyFirst:
    def test_deny_rule_returns_deny(self) -> None:
        agent = AgentProfile(agent_id="a1", skills=["sales"], proficiencies={"sales": 5})
        skill = SkillRequirement(skill_name="sales", min_proficiency=3)
        rules = [
            RoutingRule(skill="sales", agent_group="*", action="deny", priority=1, reason="blocked"),
        ]
        result = evaluate_rules(agent, skill, rules)
        assert result.action == "deny"
        assert result.matched_rule is not None
        assert result.matched_rule.action == "deny"

    def test_ask_rule_returns_ask_when_no_deny(self) -> None:
        agent = AgentProfile(agent_id="a1", skills=["support"], proficiencies={"support": 5})
        skill = SkillRequirement(skill_name="support", min_proficiency=3)
        rules = [
            RoutingRule(skill="support", agent_group="*", action="ask", priority=2, reason="needs review"),
        ]
        result = evaluate_rules(agent, skill, rules)
        assert result.action == "ask"

    def test_allow_rule_returns_allow_when_no_deny_or_ask(self) -> None:
        agent = AgentProfile(agent_id="a1", skills=["billing"], proficiencies={"billing": 5})
        skill = SkillRequirement(skill_name="billing", min_proficiency=3)
        rules = [
            RoutingRule(skill="billing", agent_group="*", action="allow", priority=3, reason="permitted"),
        ]
        result = evaluate_rules(agent, skill, rules)
        assert result.action == "allow"

    def test_empty_rules_returns_allow_default(self) -> None:
        agent = AgentProfile(agent_id="a1", skills=["tech"], proficiencies={"tech": 5})
        skill = SkillRequirement(skill_name="tech", min_proficiency=1)
        result = evaluate_rules(agent, skill, [])
        assert result.action == "allow"
        assert result.matched_rule is None

    def test_deny_overrides_allow_and_ask(self) -> None:
        agent = AgentProfile(agent_id="a1", skills=["chat"], proficiencies={"chat": 5})
        skill = SkillRequirement(skill_name="chat", min_proficiency=1)
        rules = [
            RoutingRule(skill="chat", agent_group="*", action="allow", priority=3, reason="ok"),
            RoutingRule(skill="chat", agent_group="*", action="ask", priority=2, reason="check"),
            RoutingRule(skill="chat", agent_group="*", action="deny", priority=1, reason="blocked"),
        ]
        result = evaluate_rules(agent, skill, rules)
        assert result.action == "deny"

    def test_evaluation_chain_is_populated(self) -> None:
        agent = AgentProfile(agent_id="a1", skills=["email"], proficiencies={"email": 5})
        skill = SkillRequirement(skill_name="email", min_proficiency=1)
        rules = [
            RoutingRule(skill="email", agent_group="*", action="allow", priority=1, reason="ok"),
        ]
        result = evaluate_rules(agent, skill, rules)
        assert isinstance(result.evaluation_chain, list)
        assert len(result.evaluation_chain) > 0


class TestLoadRules:
    def test_returns_list_of_routing_rules(self, tmp_path) -> None:  # type: ignore[no-untyped-def]
        import json

        rules_data = [
            {"skill": "sales", "agent_group": "*", "action": "deny", "priority": 1, "reason": "blocked"},
            {"skill": "support", "agent_group": "tier1", "action": "allow", "priority": 2, "reason": "ok"},
        ]
        config_file = tmp_path / "rules.json"
        config_file.write_text(json.dumps(rules_data))
        rules = load_rules(str(config_file))
        assert len(rules) == 2
        assert all(isinstance(r, RoutingRule) for r in rules)
        assert rules[0].action == "deny"
        assert rules[1].agent_group == "tier1"


class TestCheckCompliance:
    def test_matching_skills_returns_true(self) -> None:
        agent = AgentProfile(
            agent_id="a1",
            skills=["billing", "sales"],
            proficiencies={"billing": 8, "sales": 5},
        )
        skill = SkillRequirement(skill_name="billing", min_proficiency=5)
        assert check_compliance(agent, skill) is True

    def test_missing_skill_returns_false(self) -> None:
        agent = AgentProfile(agent_id="a1", skills=["sales"], proficiencies={"sales": 5})
        skill = SkillRequirement(skill_name="billing", min_proficiency=3)
        assert check_compliance(agent, skill) is False

    def test_insufficient_proficiency_returns_false(self) -> None:
        agent = AgentProfile(
            agent_id="a1",
            skills=["billing"],
            proficiencies={"billing": 2},
        )
        skill = SkillRequirement(skill_name="billing", min_proficiency=5)
        assert check_compliance(agent, skill) is False

    def test_language_match_returns_true(self) -> None:
        agent = AgentProfile(
            agent_id="a1",
            skills=["support"],
            proficiencies={"support": 5},
            groups=["english"],
        )
        skill = SkillRequirement(skill_name="support", min_proficiency=3, language="english")
        assert check_compliance(agent, skill) is True

    def test_language_mismatch_returns_false(self) -> None:
        agent = AgentProfile(
            agent_id="a1",
            skills=["support"],
            proficiencies={"support": 5},
            groups=["english"],
        )
        skill = SkillRequirement(skill_name="support", min_proficiency=3, language="spanish")
        assert check_compliance(agent, skill) is False
