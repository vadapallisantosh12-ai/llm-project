from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime
from backend.app.db.session import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    root_path = Column(String(512), nullable=False)
    description = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    indexing_status = Column(String(32), default="not_indexed")
    file_count = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Bug(Base):
    __tablename__ = "bugs"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    traceback = Column(Text, nullable=False)
    culprit = Column(String(255), default="")
    status = Column(String(32), default="open")  # open, analyzing, resolved
    suggested_fix = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Patch(Base):
    __tablename__ = "patches"

    id = Column(String(64), primary_key=True, index=True)
    target_file = Column(String(512), nullable=False)
    description = Column(Text, nullable=False)
    diff = Column(Text, nullable=False)
    author = Column(String(128), default="DevAgent Engine")
    sha256 = Column(String(128), default="")
    status = Column(String(32), default="pending_review")  # pending_review, applied, rejected
    timestamp = Column(String(64), default="")


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    file = Column(String(512), nullable=False)
    category = Column(String(64), default="unit")
    status = Column(String(32), default="passed")  # passed, failed, running
    duration = Column(String(32), default="0ms")


class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(128), primary_key=True, index=True)
    value = Column(Text, nullable=False)
