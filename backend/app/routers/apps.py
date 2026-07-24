"""应用路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..crud.apps import get_app, list_apps
from ..database import get_db
from ..schemas import AppRead

router = APIRouter(prefix="/api/v1", tags=["apps"])


@router.get("/apps", response_model=list[AppRead])
def get_apps(
    q: str | None = None,
    category: str | None = None,
    sort: str | None = None,
    db: Session = Depends(get_db),
):
    return list_apps(db, q=q, category=category, sort=sort)


@router.get("/apps/{app_id}", response_model=AppRead)
def get_app_detail(app_id: str, db: Session = Depends(get_db)):
    return get_app(db, app_id)
