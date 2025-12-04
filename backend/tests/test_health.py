from fastapi.testclient import TestClient
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from server import app

client = TestClient(app)


def test_admin_health_ok():
    r = client.get("/api/admin/health")
    assert r.status_code == 200
    body = r.json()
    assert "cpu" in body
    assert "memory" in body


def test_admin_performance_ok():
    r = client.get("/api/admin/performance")
    # In this project, admin endpoints are usually protected; allow 200 or 401
    assert r.status_code in (200, 401)
