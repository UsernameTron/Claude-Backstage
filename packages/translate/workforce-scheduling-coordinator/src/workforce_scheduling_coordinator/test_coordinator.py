"""Tests for SchedulingCoordinator."""

from workforce_scheduling_coordinator import (
    CoordinatorConfig,
    JobType,
    SchedulingCoordinator,
    SchedulingJob,
    WorkerResult,
)


class TestInit:
    def test_stores_config(self) -> None:
        config = CoordinatorConfig(max_concurrent_workers=3, job_timeout_seconds=60)
        coord = SchedulingCoordinator(config)
        assert coord._config == config

    def test_initializes_empty_jobs(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        assert coord._jobs == {}

    def test_initializes_empty_context(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        assert coord._context == {}


class TestDispatchJob:
    def test_dispatches_and_returns_worker_result(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        job = SchedulingJob(
            job_id="j1",
            job_type=JobType.FORECAST,
            status="pending",
            parameters={"horizon": 7},
        )
        result = coord.dispatch_job(job)
        assert isinstance(result, WorkerResult)
        assert result.worker_id == "worker-forecast"
        assert result.job_id == "j1"
        assert result.status == "completed"

    def test_sets_job_status_to_completed(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        job = SchedulingJob(
            job_id="j2",
            job_type=JobType.OPTIMIZE_SHIFTS,
            status="pending",
            parameters={},
        )
        coord.dispatch_job(job)
        assert job.status == "completed"

    def test_stores_job_in_jobs_dict(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        job = SchedulingJob(
            job_id="j3",
            job_type=JobType.CHECK_ADHERENCE,
            status="pending",
            parameters={},
        )
        coord.dispatch_job(job)
        assert "j3" in coord._jobs


class TestGetActiveJobs:
    def test_returns_empty_when_no_jobs(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        assert coord.get_active_jobs() == []

    def test_returns_only_running_jobs(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        # Manually add jobs at different statuses
        running_job = SchedulingJob(
            job_id="r1", job_type=JobType.FORECAST, status="running", parameters={}
        )
        completed_job = SchedulingJob(
            job_id="c1", job_type=JobType.FORECAST, status="completed", parameters={}
        )
        coord._jobs["r1"] = running_job
        coord._jobs["c1"] = completed_job
        active = coord.get_active_jobs()
        assert len(active) == 1
        assert active[0].job_id == "r1"


class TestCancelJob:
    def test_cancels_existing_job(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        job = SchedulingJob(
            job_id="j4", job_type=JobType.FORECAST, status="running", parameters={}
        )
        coord._jobs["j4"] = job
        result = coord.cancel_job("j4")
        assert result is True
        assert job.status == "cancelled"

    def test_returns_false_for_nonexistent_job(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        result = coord.cancel_job("nonexistent")
        assert result is False


class TestGetSharedContext:
    def test_returns_copy_of_context(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        ctx = coord.get_shared_context()
        ctx["injected"] = True
        assert "injected" not in coord.get_shared_context()

    def test_returns_empty_dict_initially(self) -> None:
        coord = SchedulingCoordinator(CoordinatorConfig())
        assert coord.get_shared_context() == {}
