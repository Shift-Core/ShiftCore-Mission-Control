from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime, timezone

from .models import (
    SummaryPreviewData,
    SummaryPreviewRequest,
    SummaryPreviewResponse,
    SummarySection,
)


def _progress_text(done: int, planned: int) -> str:
    verb = "is" if done == 1 else "are"
    return f"{done} of {planned} planned tasks {verb} done."


def _blocker_text(active_blockers: int) -> str:
    if active_blockers == 0:
        return "No active blockers need attention."
    if active_blockers == 1:
        return "1 active blocker needs attention."
    return f"{active_blockers} active blockers need attention."


def _attention_text(in_progress: int, to_do: int) -> str:
    in_progress_text = (
        "1 task is in progress"
        if in_progress == 1
        else f"{in_progress} tasks are in progress"
    )
    not_started_text = (
        "1 has not started"
        if to_do == 1
        else f"{to_do} have not started"
    )
    return f"{in_progress_text} and {not_started_text}."


def build_deterministic_summary(
    request: SummaryPreviewRequest,
    *,
    generated_at: datetime | None = None,
    warnings: Iterable[str] = (),
) -> SummaryPreviewResponse:
    """Build the deterministic R24-05 output shape.

    R24-05 freezes and validates the deterministic contract/fixtures.
    The HTTP weekly-summary preview endpoint is intentionally deferred to R24-12.
    """

    snapshot = request.snapshot.model_copy(deep=True)
    generated_at = generated_at or datetime.now(timezone.utc)

    sections = [
        SummarySection(
            key="progress",
            title="Progress",
            content=_progress_text(snapshot.doneTasks, snapshot.plannedTasks),
        ),
        SummarySection(
            key="blockers",
            title="Blockers",
            content=_blocker_text(snapshot.activeBlockers),
        ),
        SummarySection(
            key="attention",
            title="Attention",
            content=_attention_text(
                snapshot.inProgressTasks,
                snapshot.toDoTasks,
            ),
        ),
    ]

    return SummaryPreviewResponse(
        data=SummaryPreviewData(
            projectId=request.projectId,
            sprintId=request.sprintId,
            generatedAt=generated_at,
            sourceSnapshot=snapshot,
            sections=sections,
            warnings=list(warnings),
        )
    )
