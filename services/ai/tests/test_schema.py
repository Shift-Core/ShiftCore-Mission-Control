import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.models import (
    KpiSnapshot,
    SummaryPreviewRequest,
    SummaryPreviewResponse,
)


FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def load_fixture(name: str) -> dict:
    return json.loads(
        (FIXTURES / name).read_text(encoding="utf-8")
    )


def test_source_fixture_matches_request_schema():
    request = SummaryPreviewRequest.model_validate(
        load_fixture("source_snapshot.v1.json")
    )

    assert request.schemaVersion == "1.0"
    assert request.snapshotSource == "core-mission-control-v1"


def test_output_fixture_matches_response_schema():
    response = SummaryPreviewResponse.model_validate(
        load_fixture("weekly_summary.v1.json")
    )

    assert response.data.source == "deterministic"
    assert [
        section.key
        for section in response.data.sections
    ] == [
        "progress",
        "blockers",
        "attention",
    ]


def test_planned_count_must_equal_release_status_counts():
    with pytest.raises(
        ValidationError,
        match="plannedTasks must equal",
    ):
        KpiSnapshot(
            plannedTasks=4,
            toDoTasks=1,
            inProgressTasks=1,
            doneTasks=1,
            completionRate=25.0,
            activeBlockers=0,
        )


def test_completion_rate_must_match_adr_011_formula():
    with pytest.raises(
        ValidationError,
        match="completionRate must be 33.3",
    ):
        KpiSnapshot(
            plannedTasks=3,
            toDoTasks=1,
            inProgressTasks=1,
            doneTasks=1,
            completionRate=50.0,
            activeBlockers=0,
        )


def test_missing_required_section_is_rejected():
    payload = load_fixture("weekly_summary.v1.json")
    payload["data"]["sections"] = payload["data"]["sections"][:2]

    with pytest.raises(ValidationError):
        SummaryPreviewResponse.model_validate(payload)

