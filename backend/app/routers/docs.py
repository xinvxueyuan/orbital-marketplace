"""文档路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..crud.docs import get_doc, list_categories, list_docs
from ..database import get_db
from ..schemas import DocRead, DocsListOut

router = APIRouter(prefix="/api/v1", tags=["docs"])


@router.get("/docs", response_model=DocsListOut)
def get_docs(db: Session = Depends(get_db)):
    return {"categories": list_categories(db), "docs": list_docs(db)}


@router.get("/docs/{slug}", response_model=DocRead)
def get_doc_detail(slug: str, db: Session = Depends(get_db)):
    return get_doc(db, slug)
