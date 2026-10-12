"""Project database model."""

import uuid

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.db.base import Base
from backend.app.models.base import TimestampMixin


class Project(Base, TimestampMixin):
    """Registered developer project."""

    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    root_path: Mapped[str] = mapped_column(String(1024), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=True, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    indexing_status: Mapped[str] = mapped_column(
        String(50),
        default="not_indexed",
        nullable=False,
    )
    file_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
