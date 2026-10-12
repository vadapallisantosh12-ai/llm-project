# DevAgent AI — API Specification

Base URL: `http://127.0.0.1:8000/api/v1`

All responses follow standardized JSON envelopes.

## 1. System Endpoints

### `GET /health`
Returns live operational status, database connectivity, and environment metadata.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "data": {
    "status": "healthy",
    "app_name": "DevAgent AI",
    "version": "0.1.0",
    "environment": "development",
    "database": "connected",
    "active_llm_provider": "mock",
    "system_info": {
      "platform": "Windows-11-...",
      "python_version": "3.14.3",
      "os": "Windows"
    },
    "timestamp": "2026-10-09T08:00:00Z"
  }
}
```

## 2. Project Endpoints

### `GET /projects`
Retrieve all registered projects.

### `POST /projects`
Register a local directory after canonical path validation.

**Request**:
```json
{
  "name": "My Local Project",
  "root_path": "C:\\Users\\dev\\workspace\\my-project",
  "description": "Optional notes"
}
```

### `DELETE /projects/{id}`
Unregister a project from DevAgent AI (does NOT delete user files on disk).

## 3. Standard Error Envelope

When any error occurs (4xx or 5xx), the API returns:
```json
{
  "error": {
    "code": "SECURITY_PATH_VIOLATION",
    "message": "Path traversal detected: '..' resolves outside project root",
    "details": {},
    "request_id": "c1f72c1d-...",
    "timestamp": "2026-10-09T08:00:00Z"
  }
}
```
