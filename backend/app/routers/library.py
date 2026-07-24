"""资料库路由（单用户演示）。"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..crud.library import buy_license, get_library, install, subscribe, uninstall
from ..database import get_db
from ..schemas import LibraryActionIn, LibraryEntryRead, LibraryOut

router = APIRouter(prefix="/api/v1", tags=["library"])


@router.get("/library", response_model=LibraryOut)
def get_library_route(db: Session = Depends(get_db)):
    return get_library(db)


@router.post("/library/install", response_model=LibraryEntryRead)
def install_app(payload: LibraryActionIn, db: Session = Depends(get_db)):
    return install(db, payload.appId)


@router.post("/library/uninstall")
def uninstall_app(payload: LibraryActionIn, db: Session = Depends(get_db)):
    return uninstall(db, payload.appId)


@router.post("/library/subscribe", response_model=LibraryEntryRead)
def subscribe_app(payload: LibraryActionIn, db: Session = Depends(get_db)):
    return subscribe(db, payload.appId, payload.planId)


@router.post("/library/buy-license", response_model=LibraryEntryRead)
def buy_license_app(payload: LibraryActionIn, db: Session = Depends(get_db)):
    return buy_license(db, payload.appId, payload.planId)
