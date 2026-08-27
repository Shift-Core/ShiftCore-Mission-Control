import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app


TEST_DOCS_ACCESS_KEY = "test-docs-access-key"
WRONG_DOCS_ACCESS_KEY = "wrong-test-docs-access-key"
DOCS_ACCESS_HEADER = "X-ShiftCore-Docs-Key"
AI_ROOT = Path(__file__).resolve().parents[1]
CONTRACT = AI_ROOT.parents[1] / "contracts" / "ai.openapi.yaml"
FIXTURES = AI_ROOT / "fixtures"


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def configured_docs(monkeypatch):
    monkeypatch.setenv(
        "AI_DOCS_ACCESS_KEY",
        TEST_DOCS_ACCESS_KEY,
    )


@pytest.mark.parametrize(
    "path",
    [
        "/docs",
        "/redoc",
        "/openapi.json",
    ],
)
def test_default_fastapi_docs_are_disabled(
    client,
    path,
):
    response = client.get(path)

    assert response.status_code == 404


@pytest.mark.parametrize(
    "query",
    [
        {},
        {"key": WRONG_DOCS_ACCESS_KEY},
    ],
)
def test_private_docs_reject_missing_or_wrong_access(
    client,
    configured_docs,
    query,
):
    response = client.get(
        "/api/docs",
        params=query,
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}


def test_private_docs_return_swagger_html(
    client,
    configured_docs,
):
    response = client.get(
        "/api/docs",
        params={"key": TEST_DOCS_ACCESS_KEY},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/html")
    assert "Swagger UI" in response.text
    assert "/api/docs/openapi.yaml" in response.text
    assert TEST_DOCS_ACCESS_KEY not in response.text
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["referrer-policy"] == "no-referrer"


def test_gateway_header_loads_docs_without_upstream_query(
    client,
    configured_docs,
):
    response = client.get(
        "/api/docs",
        headers={DOCS_ACCESS_HEADER: TEST_DOCS_ACCESS_KEY},
    )

    assert response.status_code == 200
    assert "/api/docs/openapi.yaml" in response.text


@pytest.mark.parametrize(
    "query",
    [
        {},
        {"key": WRONG_DOCS_ACCESS_KEY},
    ],
)
def test_contract_rejects_missing_or_wrong_access(
    client,
    configured_docs,
    query,
):
    response = client.get(
        "/api/docs/openapi.yaml",
        params=query,
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}


def test_contract_endpoint_returns_canonical_yaml(
    client,
    configured_docs,
):
    response = client.get(
        "/api/docs/openapi.yaml",
        params={"key": TEST_DOCS_ACCESS_KEY},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith(
        "application/yaml"
    )
    assert response.text == CONTRACT.read_text(encoding="utf-8")
    assert response.headers["cache-control"] == "no-store"


def test_swagger_session_can_load_protected_contract(
    client,
    configured_docs,
):
    docs_response = client.get(
        "/api/docs",
        params={"key": TEST_DOCS_ACCESS_KEY},
    )

    assert docs_response.status_code == 200

    contract_response = client.get("/api/docs/openapi.yaml")

    assert contract_response.status_code == 200
    assert contract_response.text == CONTRACT.read_text(
        encoding="utf-8"
    )


def test_canonical_contract_preserves_release_paths():
    contract_text = CONTRACT.read_text(encoding="utf-8")

    assert "  /health:" in contract_text
    assert (
        "  /api/ai/v1/summaries/weekly/preview:"
        in contract_text
    )
    assert "  /api/docs:" not in contract_text
    assert "  /api/docs/openapi.yaml:" not in contract_text


def test_docs_key_cannot_authenticate_preview(
    client,
    configured_docs,
):
    payload = json.loads(
        (FIXTURES / "source_snapshot.v1.json").read_text(
            encoding="utf-8"
        )
    )

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        params={"key": TEST_DOCS_ACCESS_KEY},
        json=payload,
    )

    assert response.status_code == 401
    assert response.json()["errorCode"] == "AUTH_REQUIRED"


@pytest.mark.parametrize(
    "configured_value",
    [
        None,
        "",
        "   ",
    ],
)
def test_docs_fail_closed_when_access_key_is_not_configured(
    client,
    monkeypatch,
    configured_value,
):
    if configured_value is None:
        monkeypatch.delenv(
            "AI_DOCS_ACCESS_KEY",
            raising=False,
        )
    else:
        monkeypatch.setenv(
            "AI_DOCS_ACCESS_KEY",
            configured_value,
        )

    response = client.get(
        "/api/docs",
        params={"key": TEST_DOCS_ACCESS_KEY},
    )

    assert response.status_code == 404


def test_rejected_response_does_not_expose_secret_details(
    client,
    configured_docs,
):
    response = client.get(
        "/api/docs/openapi.yaml",
        params={"key": WRONG_DOCS_ACCESS_KEY},
    )

    response_text = response.text

    assert TEST_DOCS_ACCESS_KEY not in response_text
    assert WRONG_DOCS_ACCESS_KEY not in response_text
    assert "AI_DOCS_ACCESS_KEY" not in response_text
    assert "traceback" not in response_text.lower()
    assert "environment" not in response_text.lower()
