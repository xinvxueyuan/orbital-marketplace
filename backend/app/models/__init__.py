"""Orbital 后端全部 SQLAlchemy ORM 模型（集中本文件）。

使用 SQLAlchemy 2.0 declarative 风格（DeclarativeBase + Mapped + mapped_column）。
所有 JSON 字段（screenshots / tags / license / update / sections 等）用 SQLAlchemy 的
JSON 类型存储，读写时即原生 Python dict / list。
"""

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import JSON, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """所有模型的基类。"""
    pass


class App(Base):
    __tablename__ = "apps"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    vendor: Mapped[str] = mapped_column(String(128), nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    tagline: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String(512), nullable=False)
    cover: Mapped[str] = mapped_column(String(512), nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    reviews: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    size: Mapped[str] = mapped_column(String(32), nullable=False)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    released_at: Mapped[str] = mapped_column(String(32), nullable=False)
    updated_at: Mapped[str] = mapped_column(String(32), nullable=False)
    downloads: Mapped[str] = mapped_column(String(32), nullable=False)
    featured: Mapped[bool] = mapped_column(default=False)
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    screenshots: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    license_info: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    update_info: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    plans: Mapped[list["Plan"]] = relationship(
        back_populates="app", cascade="all, delete-orphan"
    )


class Plan(Base):
    __tablename__ = "plans"
    __table_args__ = (
        UniqueConstraint("app_id", "plan_id", name="uq_plan_app_plan"),
    )

    pk: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plan_id: Mapped[str] = mapped_column(String(64), nullable=False)
    app_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cycle: Mapped[str] = mapped_column(String(32), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    app: Mapped["App"] = relationship(back_populates="plans")


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    app_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    plan_id: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="available", index=True)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False)
    sold_at: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    order_id: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    buyer: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    app_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    plan_id: Mapped[str] = mapped_column(String(64), nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="completed")
    card_id: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False)
    buyer: Mapped[str] = mapped_column(String(128), nullable=False, default="lumen@orbital.dev")


class LibraryEntry(Base):
    __tablename__ = "library_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, default="demo", index=True)
    app_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    plan_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    license_key: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False, default="")


class DocCategory(Base):
    __tablename__ = "doc_categories"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    icon: Mapped[str] = mapped_column(String(16), nullable=False, default="◇")


class Doc(Base):
    __tablename__ = "docs"

    slug: Mapped[str] = mapped_column(String(64), primary_key=True)
    category: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    summary: Mapped[str] = mapped_column(String(256), nullable=False)
    updated_at: Mapped[str] = mapped_column(String(32), nullable=False)
    # sections: list[{h, body, code?: {lang, content}}]
    sections: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
