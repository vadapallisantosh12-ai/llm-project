"""Integration tests for project registration and listing."""

from pathlib import Path

from fastapi.testclient import TestClient


def test_register_and_list_project(client: TestClient, temp_project_dir: Path):
    """Test full cycle: register project, list projects, get by ID, and unregister."""
    payload = {
        "name": "Test Project",
        "root_path": str(temp_project_dir),
        "description": "Integration test project",
    }

    # 1. Register project
    create_res = client.post("/api/v1/projects", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    project_id = created_data["id"]
    assert created_data["name"] == "Test Project"
    assert created_data["is_active"] is True

    # 2. List projects
    list_res = client.get("/api/v1/projects")
    assert list_res.status_code == 200
    projects = list_res.json()
    assert len(projects) >= 1
    assert any(p["id"] == project_id for p in projects)

    # 3. Get single project
    get_res = client.get(f"/api/v1/projects/{project_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == project_id

    # 4. Attempt duplicate registration -> 422 validation error
    dup_res = client.post("/api/v1/projects", json=payload)
    assert dup_res.status_code == 422
    dup_err = dup_res.json()
    assert "error" in dup_err
    assert dup_err["error"]["code"] == "VALIDATION_ERROR"

    # 5. Delete (unregister) project
    del_res = client.delete(f"/api/v1/projects/{project_id}")
    assert del_res.status_code == 204

    # 6. Verify removed from active list
    list_after = client.get("/api/v1/projects")
    assert not any(p["id"] == project_id for p in list_after.json())


def test_register_invalid_path(client: TestClient):
    """Test registering a path that does not exist produces 403 PathSecurityException."""
    payload = {
        "name": "Fake Project",
        "root_path": "C:/non_existent_folder_xyz_123",
        "description": "Should fail",
    }
    res = client.post("/api/v1/projects", json=payload)
    assert res.status_code == 403
    err = res.json()
    assert "error" in err
    assert err["error"]["code"] == "SECURITY_PATH_VIOLATION"
