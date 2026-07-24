"""卡密路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..crud.cards import auto_issue, batch_issue, list_cards, redeem, void
from ..database import get_db
from ..schemas import AutoIssueIn, AutoIssueOut, CardBatchIn, CardRead, RedeemIn

router = APIRouter(prefix="/api/v1", tags=["cards"])


@router.get("/cards", response_model=list[CardRead])
def get_cards(
    appId: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return list_cards(db, app_id=appId, status=status)


@router.post("/cards/batch", response_model=list[CardRead])
def batch_cards(payload: CardBatchIn, db: Session = Depends(get_db)):
    return batch_issue(
        db,
        app_id=payload.appId,
        plan_id=payload.planId,
        type=payload.type,
        count=payload.count,
    )


@router.post("/cards/auto-issue", response_model=AutoIssueOut)
def auto_issue_card(payload: AutoIssueIn, db: Session = Depends(get_db)):
    return auto_issue(
        db,
        app_id=payload.appId,
        plan_id=payload.planId,
        type=payload.type,
        price=payload.price,
        buyer=payload.buyer,
    )


@router.post("/cards/redeem", response_model=CardRead)
def redeem_card(payload: RedeemIn, db: Session = Depends(get_db)):
    return redeem(db, payload.code)


@router.post("/cards/{card_id}/void", response_model=CardRead)
def void_card(card_id: str, db: Session = Depends(get_db)):
    return void(db, card_id)
