"""订单路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..crud.orders import create_order, list_orders
from ..database import get_db
from ..schemas import AutoIssueOut, OrderCreateIn, OrderRead

router = APIRouter(prefix="/api/v1", tags=["orders"])


@router.get("/orders", response_model=list[OrderRead])
def get_orders(db: Session = Depends(get_db)):
    return list_orders(db)


@router.post("/orders", response_model=AutoIssueOut)
def post_order(payload: OrderCreateIn, db: Session = Depends(get_db)):
    return create_order(db, payload)
