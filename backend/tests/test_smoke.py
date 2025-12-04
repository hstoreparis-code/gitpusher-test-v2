import pytest
from fastapi.testclient import TestClient
import os, sys

# Allow importing server.py when running tests from project root
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
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
    r = client.post("/api/push", json=payload)
    # Accept 200 (success), 400 (unsupported source) or 422 (validation)
    assert r.status_code in (200, 400, 422)
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
