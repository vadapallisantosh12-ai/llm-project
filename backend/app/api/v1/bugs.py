import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Bug
from backend.app.schemas.api import BugResponse

router = APIRouter(tags=["bugs"])


class BugCreatePayload(BaseModel):
    title: str
    traceback: str
    culprit: Optional[str] = ""


class BugUpdatePayload(BaseModel):
    status: Optional[str] = None
    suggestedFix: Optional[str] = None


@router.get("/bugs", response_model=List[BugResponse])
def list_bugs(db: Session = Depends(get_db)):
    bugs = db.query(Bug).all()
    return [
        BugResponse(
            id=b.id,
            title=b.title,
            traceback=b.traceback,
            culprit=b.culprit or "",
            status=b.status,
            createdAt=b.created_at.isoformat() if b.created_at else datetime.now(timezone.utc).isoformat(),
            suggestedFix=b.suggested_fix or None,
        )
        for b in bugs
    ]


@router.post("/bugs", response_model=BugResponse)
def create_bug(payload: BugCreatePayload, db: Session = Depends(get_db)):
    bug_id = f"bug-{uuid.uuid4().hex[:4]}"
    now = datetime.now(timezone.utc)
    new_bug = Bug(
        id=bug_id,
        title=payload.title,
        traceback=payload.traceback,
        culprit=payload.culprit or "",
        status="open",
        created_at=now,
    )
    db.add(new_bug)
    db.commit()
    db.refresh(new_bug)

    return BugResponse(
        id=new_bug.id,
        title=new_bug.title,
        traceback=new_bug.traceback,
        culprit=new_bug.culprit,
        status=new_bug.status,
        createdAt=new_bug.created_at.isoformat(),
        suggestedFix=new_bug.suggested_fix or None,
    )


@router.patch("/bugs/{bug_id}", response_model=BugResponse)
def update_bug(bug_id: str, payload: BugUpdatePayload, db: Session = Depends(get_db)):
    bug = db.query(Bug).filter(Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")

    if payload.status:
        bug.status = payload.status
    if payload.suggestedFix is not None:
        bug.suggested_fix = payload.suggestedFix

    db.commit()
    db.refresh(bug)

    return BugResponse(
        id=bug.id,
        title=bug.title,
        traceback=bug.traceback,
        culprit=bug.culprit or "",
        status=bug.status,
        createdAt=bug.created_at.isoformat() if bug.created_at else datetime.now(timezone.utc).isoformat(),
        suggestedFix=bug.suggested_fix or None,
    )
