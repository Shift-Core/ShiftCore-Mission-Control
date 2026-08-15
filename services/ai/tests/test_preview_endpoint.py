import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"

client = TestClient(app)


def load_fixture(name: str) -> dict:
    return json.loads(
        (FIXTURES / name).read_text(encoding="utf-8")
    )


def test_preview_accepts_approved_fixture():
    payload = load_fixture("source_snapshot.v1.json")

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
    )

    assert response.status_code == 200

    body = response.json()

    assert body["success"] is True
    assert body["message"] == "Weekly summary preview generated"

    assert body["data"]["source"] == "deterministic"
    assert body["data"]["schemaVersion"] == "1.0"

    assert body["data"]["projectId"] == payload["projectId"]
    assert body["data"]["sprintId"] == payload["sprintId"]

    assert body["data"]["sourceSnapshot"] == payload["snapshot"]

    assert [
        section["key"]
        for section in body["data"]["sections"]
    ] == [
        "progress",
        "blockers",
        "attention",
    ]

    assert body["data"]["warnings"] == []


def without_generated_at(payload: dict) -> dict:
    normalized = json.loads(json.dumps(payload))
    normalized["data"].pop("generatedAt", None)
    return normalized


def test_preview_is_repeatable_for_same_input():
    payload = load_fixture("source_snapshot.v1.json")

    first = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
    )

    second = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
    )

    assert first.status_code == 200
    assert second.status_code == 200

    assert without_generated_at(
        first.json()
    ) == without_generated_at(
        second.json()
    )


def test_preview_rejects_invalid_kpi_input_safely():
    payload = load_fixture("source_snapshot.v1.json")

    payload["snapshot"]["completionRate"] = 99.9

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers={
            "X-Request-Id": "req_test_validation",
        },
    )

    assert response.status_code == 422

    assert response.headers["X-Request-Id"] == (
        "req_test_validation"
    )

    assert response.json() == {
        "success": False,
        "message": "Validation failed",
        "data": None,
        "errorCode": "VALIDATION_ERROR",
        "errors": [],
        "traceId": "req_test_validation",
    }

    response_text = response.text.lower()

    assert "traceback" not in response_text
    assert "api_key" not in response_text
    assert "password" not in response_text
    assert "completionrate" not in response_text


def test_preview_works_without_provider_key(
    monkeypatch,
):
    monkeypatch.setenv(
        "AI_PROVIDER",
        "deterministic",
    )
    monkeypatch.delenv(
        "AI_API_KEY",
        raising=False,
    )
    monkeypatch.delenv(
        "OPENAI_API_KEY",
        raising=False,
    )

    payload = load_fixture("source_snapshot.v1.json")

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
    )

    assert response.status_code == 200

    body = response.json()

    assert body["data"]["source"] == "deterministic"
    assert body["data"]["warnings"] == []


def test_preview_runtime_openapi_uses_release_error_contract():
    schema = app.openapi()

    operation = schema["paths"][
        "/api/ai/v1/summaries/weekly/preview"
    ]["post"]

    responses = operation["responses"]

    assert "200" in responses
    assert "401" in responses
    assert "422" in responses

    assert (
        responses["401"]["content"]["application/json"]
        ["schema"]["$ref"]
        == "#/components/schemas/ErrorResponse"
    )

    assert (
        responses["422"]["content"]["application/json"]
        ["schema"]["$ref"]
        == "#/components/schemas/ErrorResponse"
    )

    assert (
        responses["200"]["content"]["application/json"]
        ["schema"]["$ref"]
        == "#/components/schemas/SummaryPreviewResponse"
    )
