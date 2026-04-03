"""Workforce scheduling coordination translated from multi-agent coordinator pattern.

Translates Claude Code's multi-agent coordinator (Section 24) to WFM scheduling:
- Coordinator dispatches jobs to specialized workers (forecast, optimize, adherence)
- Shared context propagates scheduling constraints across workers
- Job lifecycle: dispatch -> execute -> collect results

Source pattern: coordinator/coordinatorMode.ts (369 LOC)
KB reference: Section 24 (Multi-Agent Orchestration), Section 43 (Contact Center)
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class JobType(Enum):
    """Types of scheduling jobs that can be dispatched."""
    FORECAST = "forecast"
    OPTIMIZE_SHIFTS = "optimize_shifts"
    CHECK_ADHERENCE = "check_adherence"
    GENERATE_REPORT = "generate_report"
    INTRADAY_REBALANCE = "intraday_rebalance"


@dataclass
class SchedulingJob:
    """A unit of scheduling work to be dispatched to a worker."""
    job_id: str
    job_type: JobType
    status: str
    parameters: dict
    result: dict | None = None


@dataclass
class WorkerResult:
    """Result returned by a worker after executing a scheduling job."""
    worker_id: str
    job_id: str
    status: str
    output: dict
    duration_seconds: float


@dataclass
class CoordinatorConfig:
    """Configuration for the scheduling coordinator."""
    max_concurrent_workers: int = 5
    job_timeout_seconds: int = 300


class SchedulingCoordinator:
    """Coordinate workforce scheduling jobs across specialized workers.

    Translates Claude Code's multi-agent coordinator pattern to contact center
    workforce management scheduling.
    """

    def __init__(self, config: CoordinatorConfig) -> None:
        self._config = config
        self._jobs: dict[str, SchedulingJob] = {}
        self._context: dict = {}

    def dispatch_job(self, job: SchedulingJob) -> WorkerResult:
        """Dispatch a scheduling job to an appropriate worker.

        Args:
            job: The scheduling job to dispatch.

        Returns:
            Result from the worker that executed the job.
        """
        job.status = "running"
        self._jobs[job.job_id] = job
        result = WorkerResult(
            worker_id=f"worker-{job.job_type.value}",
            job_id=job.job_id,
            status="completed",
            output={},
            duration_seconds=0.0,
        )
        job.status = "completed"
        job.result = result.output
        return result

    def get_active_jobs(self) -> list[SchedulingJob]:
        """Return all currently active (in-progress) jobs."""
        return [j for j in self._jobs.values() if j.status == "running"]

    def cancel_job(self, job_id: str) -> bool:
        """Cancel a running job by ID.

        Args:
            job_id: The ID of the job to cancel.

        Returns:
            True if the job was found and cancelled, False otherwise.
        """
        if job_id in self._jobs:
            self._jobs[job_id].status = "cancelled"
            return True
        return False

    def get_shared_context(self) -> dict:
        """Return the shared context propagated across all workers."""
        return dict(self._context)
