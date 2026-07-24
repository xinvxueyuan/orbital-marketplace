"""应用 CRUD。"""

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import App
from . import NotFoundError


def list_apps(
    db: Session,
    q: str | None = None,
    category: str | None = None,
    sort: str | None = None,
) -> list[App]:
    stmt = select(App).options(selectinload(App.plans))

    if category and category != "all":
        stmt = stmt.where(App.category == category)

    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            App.name.ilike(like)
            | App.tagline.ilike(like)
            | App.description.ilike(like)
        )

    sort_key = (sort or "").lower()
    if sort_key == "name":
        stmt = stmt.order_by(App.name.asc())
    elif sort_key == "rating":
        stmt = stmt.order_by(App.rating.desc())
    elif sort_key == "reviews":
        stmt = stmt.order_by(App.reviews.desc())
    elif sort_key in ("updatedat", "updated_at", "date"):
        stmt = stmt.order_by(App.updated_at.desc())
    elif sort_key == "downloads":
        # downloads 为字符串（如 "1.2M"），按字典序倒序作为演示排序
        stmt = stmt.order_by(App.downloads.desc())
    else:
        stmt = stmt.order_by(App.name.asc())

    return list(db.scalars(stmt).unique().all())


def get_app(db: Session, app_id: str) -> App:
    stmt = select(App).options(selectinload(App.plans)).where(App.id == app_id)
    app = db.scalars(stmt).first()
    if not app:
        raise NotFoundError(f"app '{app_id}' not found")
    return app
