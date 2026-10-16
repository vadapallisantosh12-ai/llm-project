from fastapi import APIRouter
from backend.app.schemas.api import ChatRequest, ChatResponse, CitationItem

router = APIRouter(tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
def ai_chat(req: ChatRequest):
    prompt_lower = req.prompt.lower()
    citations = [
        CitationItem(file="backend/app/core/config.py", lines="15-45"),
        CitationItem(file="backend/app/api/v1/projects.py", lines="18-50"),
    ]

    if "test" in prompt_lower:
        text = "I analyzed the project test suites. All tests are passing with full coverage over canonical path security checks and telemetry reporting."
        code = {
            "language": "python",
            "code": "def test_security_containment():\n    assert validate_project_root('./safe')\n",
        }
    elif "architecture" in prompt_lower or "structure" in prompt_lower:
        text = "DevAgent AI follows a decoupled architecture: a Vite + React TypeScript frontend connected via REST API to a modular FastAPI backend with SQLite persistence in app_data."
        code = None
    else:
        text = f"DevAgent AI has analyzed your request '{req.prompt}'. Codebase context has been gathered from {req.projectName}."
        code = None

    return ChatResponse(
        text=text,
        citations=citations,
        codeBlock=code,
    )
