"""文档 CRUD。"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Doc, DocCategory
from . import NotFoundError


def list_categories(db: Session) -> list[DocCategory]:
    return list(db.scalars(select(DocCategory).order_by(DocCategory.id.asc())).all())


def list_docs(db: Session) -> list[Doc]:
    return list(db.scalars(select(Doc).order_by(Doc.slug.asc())).all())


def get_doc(db: Session, slug: str) -> Doc:
    doc = db.scalars(select(Doc).where(Doc.slug == slug)).first()
    if not doc:
        raise NotFoundError(f"doc '{slug}' not found")
    return doc
