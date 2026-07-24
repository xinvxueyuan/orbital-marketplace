"""资料库 CRUD（单用户演示，userId 固定 demo）。"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import DEMO_USER_ID
from ..models import LibraryEntry
from . import NotFoundError, gen_license_key, now_date


def _entries(db: Session) -> list[LibraryEntry]:
    return list(
        db.scalars(
            select(LibraryEntry)
            .where(LibraryEntry.user_id == DEMO_USER_ID)
            .order_by(LibraryEntry.id.asc())
        ).all()
    )


def get_library(db: Session) -> dict:
    entries = _entries(db)
    return {
        "installed": [e for e in entries if e.kind == "installed"],
        "licenses": [e for e in entries if e.kind == "license"],
        "subscriptions": [e for e in entries if e.kind == "subscription"],
    }


def install(db: Session, app_id: str) -> LibraryEntry:
    existing = db.scalars(
        select(LibraryEntry).where(
            LibraryEntry.user_id == DEMO_USER_ID,
            LibraryEntry.app_id == app_id,
            LibraryEntry.kind == "installed",
        ).limit(1)
    ).first()
    if existing:
        return existing
    entry = LibraryEntry(
        user_id=DEMO_USER_ID,
        app_id=app_id,
        kind="installed",
        created_at=now_date(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def uninstall(db: Session, app_id: str) -> dict:
    existing = db.scalars(
        select(LibraryEntry).where(
            LibraryEntry.user_id == DEMO_USER_ID,
            LibraryEntry.app_id == app_id,
            LibraryEntry.kind == "installed",
        ).limit(1)
    ).first()
    if not existing:
        raise NotFoundError(f"installed app '{app_id}' not found in library")
    db.delete(existing)
    db.commit()
    return {"appId": app_id, "removed": True}


def subscribe(db: Session, app_id: str, plan_id: str | None) -> LibraryEntry:
    entry = LibraryEntry(
        user_id=DEMO_USER_ID,
        app_id=app_id,
        kind="subscription",
        plan_id=plan_id,
        license_key=gen_license_key(),
        created_at=now_date(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def buy_license(db: Session, app_id: str, plan_id: str | None) -> LibraryEntry:
    entry = LibraryEntry(
        user_id=DEMO_USER_ID,
        app_id=app_id,
        kind="license",
        plan_id=plan_id,
        license_key=gen_license_key(),
        created_at=now_date(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
