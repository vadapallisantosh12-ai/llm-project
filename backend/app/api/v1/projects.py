"""Project management endpoints."""

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.core.exceptions import ResourceNotFoundException, ValidationException
from backend.app.db.session import get_db
from backend.app.models.project import Project
from backend.app.schemas.project import ProjectCreateRequest, ProjectResponse
from backend.app.security.paths import validate_project_root

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)) -> List[ProjectResponse]:
    """Retrieve all registered developer projects."""
    projects = db.query(Project).filter(Project.is_active.is_(True)).order_by(Project.created_at.desc()).all()
    return projects


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def register_project(
    payload: ProjectCreateRequest,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Register a local project directory after security and path validation."""
    # 1. Canonical validation of root path
    resolved_root = validate_project_root(payload.root_path)
    canonical_str = str(resolved_root)

    # 2. Check for duplicate registration
    existing = db.query(Project).filter(Project.root_path == canonical_str).first()
    if existing:
        if not existing.is_active:
            # Re-activate previously removed project
            existing.is_active = True
            existing.name = payload.name
            existing.description = payload.description or existing.description
            db.commit()
            db.refresh(existing)
            return existing
        raise ValidationException(
            message=f"Project directory is already registered: {canonical_str}",
            details={"root_path": canonical_str, "existing_id": existing.id},
        )

    # 3. Create project record
    project = Project(
        name=payload.name,
        root_path=canonical_str,
        description=payload.description or "",
        is_active=True,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)) -> ProjectResponse:
    """Retrieve a single registered project by ID."""
    project = db.query(Project).filter(Project.id == project_id, Project.is_active.is_(True)).first()
    if not project:
        raise ResourceNotFoundException(
            message=f"Project with ID '{project_id}' not found",
            details={"project_id": project_id},
        )
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)) -> None:
    """Remove a project from the DevAgent AI registry (does NOT delete user files)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ResourceNotFoundException(
            message=f"Project with ID '{project_id}' not found",
            details={"project_id": project_id},
        )
    # Soft delete / unregister from DevAgent AI registry
    project.is_active = False
    db.commit()
    return None
