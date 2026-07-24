"""订单 CRUD。"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Order
from .cards import auto_issue


def create_order(db: Session, payload) -> dict:
    """创建订单：内部触发自动发卡，返回 {order, card}。"""
    return auto_issue(
        db,
        app_id=payload.appId,
        plan_id=payload.planId,
        type=payload.type,
        price=payload.price,
        buyer=payload.buyer,
    )


def list_orders(db: Session) -> list[Order]:
    return list(db.scalars(select(Order).order_by(Order.id.asc())).all())
