# workforce-scheduling-coordinator

Workforce scheduling coordination translated from Claude Code's multi-agent coordinator pattern.

## Tier

**Translate** — New build from pattern adaptation.

## Priority

**P1** — Translate tier completion.

## Source Pattern

- **Pattern**: Multi-agent coordinator
- **Source file**: `coordinator/coordinatorMode.ts` (369 LOC)
- **KB sections**: Section 24 (Multi-Agent Orchestration), Section 43 (Contact Center)

## Domain Translation

Maps Claude Code's multi-agent coordinator to contact center workforce scheduling:

| Claude Code Concept | Contact Center Concept |
|---------------------|----------------------|
| Agent coordinator | Scheduling coordinator |
| Sub-agent | Scheduling worker |
| Task dispatch | Job dispatch (forecast, optimize, adherence) |
| Shared context | Scheduling constraints propagation |
| Task lifecycle | Job lifecycle (dispatch -> execute -> collect) |
| Concurrent agent limit | Max concurrent workers |
| Task timeout | Job timeout |

## Exports

- `SchedulingCoordinator` — Main coordinator class
- `SchedulingJob` — Dataclass: job_id, job_type, status, parameters, result
- `WorkerResult` — Dataclass: worker_id, job_id, status, output, duration_seconds
- `CoordinatorConfig` — Dataclass: max_concurrent_workers, job_timeout_seconds
- `JobType` — Enum: FORECAST, OPTIMIZE_SHIFTS, CHECK_ADHERENCE, GENERATE_REPORT, INTRADAY_REBALANCE

## Dependencies

None.

## Status

Type stubs only. All methods raise `NotImplementedError`.
