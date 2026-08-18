import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient

from app.auth import _read_public_key
from app.main import app


FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"

client = TestClient(app)


def load_fixture(name: str) -> dict:
    return json.loads(
        (FIXTURES / name).read_text(encoding="utf-8")
    )


@pytest.fixture
def auth_context(
    tmp_path,
    monkeypatch,
):
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    public_key = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=(
            serialization.PublicFormat.SubjectPublicKeyInfo
        ),
    )

    public_key_path = tmp_path / "jwt_public"
    public_key_path.write_bytes(public_key)

    monkeypatch.setenv(
        "JWT_PUBLIC_KEY_PATH",
        str(public_key_path),
    )
    monkeypatch.setenv(
        "JWT_ISSUER",
        "shiftcore-identity",
    )
    monkeypatch.setenv(
        "JWT_AUDIENCE",
        "shiftcore-api",
    )

    _read_public_key.cache_clear()

    yield private_key

    _read_public_key.cache_clear()


def make_token(
    private_key,
    *,
    issuer: str = "shiftcore-identity",
    audience: str = "shiftcore-api",
    expires_in: timedelta = timedelta(minutes=5),
    remove_claim: str | None = None,
) -> str:
    now = datetime.now(timezone.utc)

    claims = {
        "iss": issuer,
        "aud": audience,
        "sub": "11111111-1111-1111-1111-111111111111",
        "email": "lead@shiftcore.local",
        "name": "Seeded Lead",
        "role": "Lead",
        "teamId": "22222222-2222-2222-2222-222222222222",
        "iat": now,
        "nbf": now - timedelta(seconds=1),
        "exp": now + expires_in,
        "jti": "test-jti",
    }

    if remove_claim is not None:
        claims.pop(remove_claim)

    return jwt.encode(
        claims,
        private_key,
        algorithm="RS256",
    )


def auth_headers(private_key) -> dict[str, str]:
    return {
        "Cookie": f"sc_token={make_token(private_key)}",
    }


def test_preview_accepts_approved_fixture(
    auth_context,
):
    payload = load_fixture("source_snapshot.v1.json")

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers=auth_headers(auth_context),
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


def test_preview_is_repeatable_for_same_input(
    auth_context,
):
    payload = load_fixture("source_snapshot.v1.json")
    headers = auth_headers(auth_context)

    first = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers=headers,
    )

    second = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers=headers,
    )

    assert first.status_code == 200
    assert second.status_code == 200

    assert without_generated_at(
        first.json()
    ) == without_generated_at(
        second.json()
    )


def test_preview_rejects_invalid_kpi_input_safely(
    auth_context,
):
    payload = load_fixture("source_snapshot.v1.json")

    payload["snapshot"]["completionRate"] = 99.9

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers={
            **auth_headers(auth_context),
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
    auth_context,
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
        headers=auth_headers(auth_context),
    )

    assert response.status_code == 200

    body = response.json()

    assert body["data"]["source"] == "deterministic"
    assert body["data"]["warnings"] == []


def test_preview_requires_session_cookie():
    payload = load_fixture("source_snapshot.v1.json")

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers={
            "X-Request-Id": "req_missing_auth",
        },
    )

    assert response.status_code == 401
    assert response.headers["X-Request-Id"] == (
        "req_missing_auth"
    )

    assert response.json() == {
        "success": False,
        "message": "Authentication required.",
        "data": None,
        "errorCode": "AUTH_REQUIRED",
        "errors": [],
        "traceId": "req_missing_auth",
    }


def test_preview_rejects_malformed_session(
    auth_context,
):
    payload = load_fixture("source_snapshot.v1.json")

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers={
            "Cookie": "sc_token=not-a-valid-jwt",
        },
    )

    assert response.status_code == 401
    assert response.json()["errorCode"] == "AUTH_REQUIRED"

    response_text = response.text.lower()
    assert "jwt" not in response_text
    assert "signature" not in response_text
    assert "traceback" not in response_text
    assert "jwt_public" not in response_text


def test_preview_rejects_missing_public_key_safely(
    auth_context,
    monkeypatch,
    tmp_path,
):
    payload = load_fixture("source_snapshot.v1.json")

    missing_key_path = tmp_path / "missing-jwt-public"
    monkeypatch.setenv(
        "JWT_PUBLIC_KEY_PATH",
        str(missing_key_path),
    )
    _read_public_key.cache_clear()

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers=auth_headers(auth_context),
    )

    assert response.status_code == 401
    assert response.json()["errorCode"] == "AUTH_REQUIRED"

    response_text = response.text.lower()
    assert "missing-jwt-public" not in response_text
    assert "traceback" not in response_text
    assert "permission denied" not in response_text


def test_preview_rejects_invalid_signature(
    auth_context,
):
    payload = load_fixture("source_snapshot.v1.json")

    different_private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers={
            "Cookie": (
                "sc_token="
                f"{make_token(different_private_key)}"
            ),
        },
    )

    assert response.status_code == 401
    assert response.json()["errorCode"] == "AUTH_REQUIRED"


def test_preview_rejects_expired_session(
    auth_context,
):
    payload = load_fixture("source_snapshot.v1.json")

    token = make_token(
        auth_context,
        expires_in=timedelta(minutes=-5),
    )

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers={
            "Cookie": f"sc_token={token}",
        },
    )

    assert response.status_code == 401
    assert response.json()["errorCode"] == "AUTH_REQUIRED"


@pytest.mark.parametrize(
    ("issuer", "audience"),
    [
        ("wrong-issuer", "shiftcore-api"),
        ("shiftcore-identity", "wrong-audience"),
    ],
)
def test_preview_rejects_wrong_token_scope(
    auth_context,
    issuer,
    audience,
):
    payload = load_fixture("source_snapshot.v1.json")

    token = make_token(
        auth_context,
        issuer=issuer,
        audience=audience,
    )

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers={
            "Cookie": f"sc_token={token}",
        },
    )

    assert response.status_code == 401
    assert response.json()["errorCode"] == "AUTH_REQUIRED"


def test_preview_rejects_missing_required_claim(
    auth_context,
):
    payload = load_fixture("source_snapshot.v1.json")

    token = make_token(
        auth_context,
        remove_claim="teamId",
    )

    response = client.post(
        "/api/ai/v1/summaries/weekly/preview",
        json=payload,
        headers={
            "Cookie": f"sc_token={token}",
        },
    )

    assert response.status_code == 401
    assert response.json()["errorCode"] == "AUTH_REQUIRED"


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

    assert operation["security"] == [
        {
            "SessionCookie": [],
        },
    ]

    security_scheme = schema["components"][
        "securitySchemes"
    ]["SessionCookie"]

    assert security_scheme == {
        "type": "apiKey",
        "in": "cookie",
        "name": "sc_token",
    }
