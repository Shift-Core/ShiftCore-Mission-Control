import json
from datetime import datetime, timezone
from pathlib import Path

from app.deterministic import build_deterministic_summary
from app.models import SummaryPreviewRequest, SummaryPreviewResponse


FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def load_fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def source_request() -> SummaryPreviewRequest:
    return SummaryPreviewRequest.model_validate(
        load_fixture("source_snapshot.v1.json")
    )


def without_generated_at(response: SummaryPreviewResponse) -> dict:
    payload = response.model_dump(mode="json")
    payload["data"].pop("generatedAt")
    return payload


def test_same_input_is_deterministic_except_generated_time():
    request = source_request()

    first = build_deterministic_summary(
        request,
        generated_at=datetime(2026, 8, 16, 12, 0, tzinfo=timezone.utc),
    )
    second = build_deterministic_summary(
        request,
        generated_at=datetime(2026, 8, 16, 12, 5, tzinfo=timezone.utc),
    )

    assert without_generated_at(first) == without_generated_at(second)


def test_generated_output_matches_approved_fixture_exactly():
    actual = build_deterministic_summary(
        source_request(),
        generated_at=datetime(2026, 8, 16, 12, 0, tzinfo=timezone.utc),
    ).model_dump(mode="json")

    expected = load_fixture("weekly_summary.v1.json")

    assert actual == expected


def test_fallback_warning_is_non_secret_and_schema_valid():
    response = build_deterministic_summary(
        source_request(),
        warnings=["provider_fallback_used"],
    )

    assert response.data.source == "deterministic"
    assert response.data.warnings == ["provider_fallback_used"]
