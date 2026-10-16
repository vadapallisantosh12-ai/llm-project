from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ProjectCreatePayload(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    root_path: str = Field(..., min_length=1)
    description: Optional[str] = ""


class ProjectResponse(BaseModel):
    id: str
    name: str
    root_path: str
    description: str = ""
    is_active: bool = True
    indexing_status: str = "not_indexed"
    file_count: int = 0
    chunk_count: int = 0
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class BugResponse(BaseModel):
    id: str
    title: str
    traceback: str
    culprit: str = ""
    status: str = "open"
    createdAt: str
    suggestedFix: Optional[str] = None


class PatchResponse(BaseModel):
    id: str
    targetFile: str
    description: str
    diff: str
    author: str = "DevAgent Engine"
    sha256: str = ""
    status: str = "pending_review"
    timestamp: str = ""


class TestCaseResponse(BaseModel):
    id: str
    name: str
    file: str
    category: str = "unit"
    status: str = "passed"
    duration: str = "0ms"


class AppSettingsSchema(BaseModel):
    active_llm_provider: str = "ollama"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_default_model: str = "qwen2.5-coder:7b"
    command_timeout_seconds: int = 30
    max_file_size_mb: int = 1
    db_status: str = "connected"


class HealthSystemInfo(BaseModel):
    platform: str
    python_version: str
    os: str


class HealthData(BaseModel):
    status: str = "healthy"
    app_name: str = "DevAgent AI"
    version: str = "0.1.0"
    environment: str = "production"
    database: str = "connected"
    active_llm_provider: str = "ollama"
    system_info: HealthSystemInfo
    timestamp: str


class HealthResponse(BaseModel):
    status: str = "healthy"
    data: HealthData


class StatisticsResponse(BaseModel):
    openBugs: int
    pendingPatches: int
    totalTests: int
    totalFiles: int
    totalChunks: int


class ChatRequest(BaseModel):
    prompt: str
    projectName: Optional[str] = "DevAgent Workspace"
    rootPath: Optional[str] = "."
    history: Optional[List[Dict[str, Any]]] = None


class CitationItem(BaseModel):
    file: str
    lines: str


class ChatResponse(BaseModel):
    text: str
    citations: Optional[List[CitationItem]] = None
    codeBlock: Optional[Dict[str, str]] = None


class DebugRequest(BaseModel):
    traceback: str
    projectName: Optional[str] = "DevAgent Workspace"
    rootPath: Optional[str] = "."


class DebugResponse(BaseModel):
    title: str
    culprit: str
    explanation: str
    suggestedFix: str
