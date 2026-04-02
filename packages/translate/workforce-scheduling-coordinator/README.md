# workforce-scheduling-coordinator

WFM scheduling engine translated from Claude Code's multi-agent coordinator pattern.

## Tier

**Translate** — New build from pattern adaptation.

## Priority

**P1** — Core translate package. Multi-agent coordinator is a foundational orchestration pattern.

## Source Pattern

- **Source pattern**: Multi-agent coordinator (coordinatorMode.ts, 369 LOC)
- **KB sections**: Section 24 (Multi-Agent Orchestration), Section 43 (Contact Center — Workforce scheduling)

## Domain Translation

| Claude Code Concept | WFM Concept |
|---------------------|-------------|
| Coordinator mode | Scheduling engine |
| Sub-agent (AgentTool) | Specialist worker (forecaster, scheduler, adherence monitor) |
| Task dispatch | Scheduling job dispatch (generate forecast, optimize shifts, check adherence) |
| XML task-notification | Job completion callback with results |
| Scratchpad directory | Shared schedule context (demand forecast shared across workers) |

## Key Insight

The coordinator dispatches jobs to specialist workers the same way Claude Code's coordinator mode dispatches tasks to sub-agents. Each worker type (forecaster, shift optimizer, adherence monitor) maps to a sub-agent with a focused skill set. The shared schedule context mirrors the scratchpad directory pattern where agents share intermediate results.

## Exports

- `SchedulingCoordinator` — Main coordinator class. Dispatches jobs to specialist workers.
- `SchedulingJob` — Dataclass: job_id, job_type, status, parameters, result
- `JobType` — Enum: FORECAST, OPTIMIZE_SHIFTS, CHECK_ADHERENCE, GENERATE_REPORT, INTRADAY_REBALANCE
- `WorkerResult` — Dataclass: worker_id, job_id, status, output, duration_seconds
- `CoordinatorConfig` — Dataclass: max_concurrent_workers, job_timeout_seconds

## Status

Type stubs only. All methods raise `NotImplementedError`.
