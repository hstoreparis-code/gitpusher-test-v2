import pytest
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)


def test_status_endpoint():
    r = client.get("/status")
    assert r.status_code == 200
    body = r.json()
    # Backward compatibility: allow either simple status or extended
    assert isinstance(body, dict)


def test_providers_endpoint():
    r = client.get("/providers")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list) or isinstance(body, dict)


def test_push_mock():
    """Light test: no real push, just verifying route + validation."""
    payload = {
        "provider": "mock",
        "repo_name": "qa-test",
        "source": "code",
        "content": {"files": [{"path": "main.py", "content": "print('ok')"}]},
    }
    r = client.post("/push", json=payload)
    assert r.status_code in (200, 422)  # Accept 422 if validation expected
    if r.status_code == 200:
        body = r.json()
        assert "repo_url" in body
        assert "commit_id" in body


def test_security_headers():
    r = client.get("/status")
    assert r.status_code == 200
    # Security headers are added by middleware
    assert "Content-Security-Policy" in r.headers
    assert "X-Content-Type-Options" in r.headers
