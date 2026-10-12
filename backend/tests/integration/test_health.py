"""Integration tests for the health check and root endpoints."""

from fastapi.testclient import TestClient


def test_get_health_endpoint(client: TestClient):
    """Verify GET /api/v1/health returns 200 OK and valid health payload."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "data" in data

    health_data = data["data"]
    assert health_data["app_name"] == "DevAgent AI"
    assert health_data["version"] == "0.1.0"
    assert health_data["database"] in ["connected", "disconnected"]
    assert health_data["active_llm_provider"] in ["mock", "ollama", "hosted"]
    assert "system_info" in health_data
    assert "timestamp" in health_data

    # Check headers
    assert "x-request-id" in response.headers
    assert "x-response-time-ms" in response.headers


def test_root_endpoint(client: TestClient):
    """Verify GET / returns 200 with operational status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "DevAgent AI"
    assert data["status"] == "operational"
