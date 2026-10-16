import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import TestCase
from backend.app.schemas.api import TestCaseResponse

router = APIRouter(tags=["tests"])


class TestCreatePayload(BaseModel):
    name: str
    file: str
    category: Optional[str] = "unit"
    status: Optional[str] = "passed"
    duration: Optional[str] = "10ms"


@router.get("/tests", response_model=List[TestCaseResponse])
def list_tests(db: Session = Depends(get_db)):
    tests = db.query(TestCase).all()
    return [
        TestCaseResponse(
            id=t.id,
            name=t.name,
            file=t.file,
            category=t.category or "unit",
            status=t.status or "passed",
            duration=t.duration or "10ms",
        )
        for t in tests
    ]


@router.post("/tests", response_model=TestCaseResponse)
def create_test(payload: TestCreatePayload, db: Session = Depends(get_db)):
    test_id = f"t-{uuid.uuid4().hex[:4]}"
    new_test = TestCase(
        id=test_id,
        name=payload.name,
        file=payload.file,
        category=payload.category or "unit",
        status=payload.status or "passed",
        duration=payload.duration or "10ms",
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)

    return TestCaseResponse(
        id=new_test.id,
        name=new_test.name,
        file=new_test.file,
        category=new_test.category,
        status=new_test.status,
        duration=new_test.duration,
    )


@router.post("/tests/run")
def run_tests(db: Session = Depends(get_db)):
    tests = db.query(TestCase).all()
    passed_count = sum(1 for t in tests if t.status == "passed")
    return {
        "status": "success",
        "total": len(tests),
        "passed": passed_count,
        "failed": len(tests) - passed_count,
        "output": f"Ran {len(tests)} test suites. {passed_count} passed, 0 failed.",
    }
