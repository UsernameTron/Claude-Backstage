# Retrospective

## Milestone: v2.1 — Type-Stub Monorepo

**Shipped:** 2026-04-02
**Phases:** 5 | **Plans:** 15 | **Tasks:** 27

### What Was Built
- 43-package type-stub monorepo across 3 tiers (extract/build/translate)
- 9 cross-package dependency chains with workspace resolution
- Full validation suite: scaffold-check, type-check, lint
- 7 codebase mapping documents
- Complete governance docs: CLAUDE.md, README, ARCHITECTURE, DEVOPS-HANDOFF

### What Worked
- Parallel Wave 1 execution (3 agents simultaneously) cut scaffold time by ~3x
- GSD phase pipeline (discuss → plan → execute → verify) kept quality high
- Auto-correction by executor agents (tsconfig extends, Python backend) meant zero manual intervention
- Type stubs compile in strict mode — catches interface errors early

### What Was Inefficient
- Worktree isolation on Wave 2 plans caused stalls (agents couldn't see Wave 1 commits)
- Package count arithmetic errors propagated across docs (35 vs 39 TS) — caught in audit
- Phase 5 VERIFICATION.md gap was resolved but verifier ran before the fix
- Merge conflicts with parallel branch (claude/loving-hypatia) required manual resolution

### Patterns Established
- 4-file package scaffold: package.json, tsconfig.json, src/index.ts, README.md (TS) or pyproject.toml, src/pkg/__init__.py, README.md (Python)
- tsconfig extends at ../../../tsconfig.base.json (3 levels for packages/tier/name/)
- TODO throw pattern: `throw new Error("TODO: implement {function}")` for stubs
- Workspace deps: `"@claude-patterns/{dep}": "workspace:*"` in package.json

### Key Lessons
- Wave 2+ plans that depend on Wave 1 output must NOT use worktree isolation
- Stalled background agents: kill after ~2 min of no output growth, complete inline
- Always verify package counts at the source (count directories) rather than trusting doc references
- Run milestone audit before shipping to catch cross-doc inconsistencies

### Cost Observations
- Model mix: ~80% sonnet (executor agents), ~20% opus (orchestration, verification)
- Sessions: 3 (init+plan, autonomous execute phases 1-4, phase 5+ship+audit)
- Notable: Parallel agent execution provided best token efficiency per output
