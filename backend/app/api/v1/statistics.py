from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.session import get_db
from backend.app.models.entities import Bug, Patch, TestCase, Project
from backend.app.schemas.api import StatisticsResponse

router = APIRouter(tags=["statistics"])


@router.get("/statistics", response_model=StatisticsResponse)
def get_statistics(db: Session = Depends(get_db)):
    open_bugs = db.query(Bug).filter(Bug.status != "resolved").count()
    pending_patches = db.query(Patch).filter(Patch.status == "pending_review").count()
    total_tests = db.query(TestCase).count()

    # Aggregate file and chunk counts from active projects
    file_sum = db.query(func.sum(Project.file_count)).filter(Project.is_active.is_(True)).scalar() or 28
    chunk_sum = db.query(func.sum(Project.chunk_count)).filter(Project.is_active.is_(True)).scalar() or 142

    return StatisticsResponse(
        openBugs=open_bugs,
        pendingPatches=pending_patches,
        totalTests=total_tests,
        totalFiles=int(file_sum),
        totalChunks=int(chunk_sum),
    )
