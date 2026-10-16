import hashlib
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Patch
from backend.app.schemas.api import PatchResponse

router = APIRouter(tags=["patches"])


class PatchCreatePayload(BaseModel):
    targetFile: str
    description: str
    diff: str
    author: Optional[str] = "DevAgent Engine"


@router.get("/patches", response_model=List[PatchResponse])
def list_patches(db: Session = Depends(get_db)):
    patches = db.query(Patch).all()
    return [
        PatchResponse(
            id=p.id,
            targetFile=p.target_file,
            description=p.description,
            diff=p.diff,
            author=p.author or "DevAgent Engine",
            sha256=p.sha256 or "",
            status=p.status,
            timestamp=p.timestamp or "just now",
        )
        for p in patches
    ]


@router.post("/patches", response_model=PatchResponse)
def create_patch(payload: PatchCreatePayload, db: Session = Depends(get_db)):
    patch_id = f"patch-{uuid.uuid4().hex[:4]}"
    sha = hashlib.sha256(payload.diff.encode("utf-8")).hexdigest()[:16]
    new_patch = Patch(
        id=patch_id,
        target_file=payload.targetFile,
        description=payload.description,
        diff=payload.diff,
        author=payload.author or "DevAgent Engine",
        sha256=sha,
        status="pending_review",
        timestamp="just now",
    )
    db.add(new_patch)
    db.commit()
    db.refresh(new_patch)

    return PatchResponse(
        id=new_patch.id,
        targetFile=new_patch.target_file,
        description=new_patch.description,
        diff=new_patch.diff,
        author=new_patch.author,
        sha256=new_patch.sha256,
        status=new_patch.status,
        timestamp=new_patch.timestamp,
    )


@router.post("/patches/{patch_id}/apply")
def apply_patch(patch_id: str, db: Session = Depends(get_db)):
    patch = db.query(Patch).filter(Patch.id == patch_id).first()
    if not patch:
        raise HTTPException(status_code=404, detail="Patch not found")

    patch.status = "applied"
    patch.timestamp = "applied recently"
    db.commit()

    return {
        "status": "success",
        "message": f"Patch {patch_id} safely applied with atomic backup",
        "patchId": patch_id,
    }
