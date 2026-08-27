from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_works_without_provider_key(monkeypatch):
    monkeypatch.delenv("AI_API_KEY", raising=False)
    monkeypatch.setenv("AI_PROVIDER", "deterministic")

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "ai",
        "mode": "deterministic",
    }
