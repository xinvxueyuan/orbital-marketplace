"""卡密 CRUD：批量发卡、自动发卡、兑换、作废、列表。"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Card, Order
from . import (
    ALPHABET,
    BadRequestError,
    ConflictError,
    NotFoundError,
    OutOfStockError,
    gen_random_code,
    now_date,
)


# ---------- 内部工具 ----------


def _max_card_num(db: Session) -> int:
    rows = db.scalars(select(Card.id)).all()
    max_num = 0
    for cid in rows:
        digits = "".join(ch for ch in cid if ch.isdigit())
        if digits:
            max_num = max(max_num, int(digits))
    return max_num


def _next_order_id(db: Session) -> str:
    rows = db.scalars(select(Order.id)).all()
    max_num = 100  # 种子订单从 o101 起
    for oid in rows:
        digits = "".join(ch for ch in oid if ch.isdigit())
        if digits:
            max_num = max(max_num, int(digits))
    return f"o{max_num + 1}"


def _unique_code(db: Session) -> str:
    for _ in range(50):
        code = gen_random_code()
        exists = db.scalars(select(Card.id).where(Card.code == code).limit(1)).first()
        if not exists:
            return code
    raise ConflictError("cannot generate a unique card code")


# ---------- 业务 ----------


def batch_issue(
    db: Session, app_id: str, plan_id: str, type: str, count: int
) -> list[Card]:
    """批量生成 count 张可用卡密，状态为 available。"""
    now = now_date()
    base = _max_card_num(db)
    created: list[Card] = []
    for i in range(count):
        cid = f"c{base + 1 + i:03d}"
        card = Card(
            id=cid,
            code=_unique_code(db),
            type=type,
            app_id=app_id,
            plan_id=plan_id,
            status="available",
            created_at=now,
        )
        db.add(card)
        created.append(card)
    db.commit()
    for c in created:
        db.refresh(c)
    return created


def auto_issue(
    db: Session,
    app_id: str,
    plan_id: str,
    type: str,
    price: float,
    buyer: str,
) -> dict:
    """从库存中取一张 available 卡 → 转 sold → 创建 completed 订单 → 返回 {order, card}。"""
    card = db.scalars(
        select(Card)
        .where(
            Card.app_id == app_id,
            Card.plan_id == plan_id,
            Card.type == type,
            Card.status == "available",
        )
        .order_by(Card.id.asc())
        .limit(1)
    ).first()

    if not card:
        raise OutOfStockError(
            f"no available cards for app '{app_id}' plan '{plan_id}' type '{type}'"
        )

    now = now_date()
    order_id = _next_order_id(db)

    card.status = "sold"
    card.sold_at = now
    card.buyer = buyer
    card.order_id = order_id

    order = Order(
        id=order_id,
        app_id=app_id,
        plan_id=plan_id,
        type=type,
        price=price,
        status="completed",
        card_id=card.id,
        created_at=now,
        buyer=buyer,
    )
    db.add(order)
    db.commit()
    db.refresh(card)
    db.refresh(order)
    return {"order": order, "card": card}


def redeem(db: Session, code: str) -> Card:
    """兑换卡密：sold → redeemed；其它状态按规则报错。"""
    normalized = (code or "").strip().upper()
    card = db.scalars(select(Card).where(Card.code == normalized).limit(1)).first()
    if not card:
        raise NotFoundError(f"card with code '{normalized}' not found")
    if card.status == "available":
        raise BadRequestError("尚未发放", error_code="not_issued")
    if card.status == "void":
        raise ConflictError("card has been voided", error_code="voided")
    if card.status == "redeemed":
        raise ConflictError("card already redeemed", error_code="redeemed")
    # sold -> redeemed
    card.status = "redeemed"
    db.commit()
    db.refresh(card)
    return card


def void(db: Session, card_id: str) -> Card:
    """作废卡密：仅 available/sold 可作废，redeemed 不可。"""
    card = db.scalars(select(Card).where(Card.id == card_id).limit(1)).first()
    if not card:
        raise NotFoundError(f"card '{card_id}' not found")
    if card.status == "redeemed":
        raise ConflictError("card already redeemed, cannot void", error_code="redeemed")
    if card.status == "void":
        raise ConflictError("card already voided", error_code="voided")
    card.status = "void"
    db.commit()
    db.refresh(card)
    return card


def list_cards(
    db: Session, app_id: str | None = None, status: str | None = None
) -> list[Card]:
    stmt = select(Card)
    if app_id:
        stmt = stmt.where(Card.app_id == app_id)
    if status:
        stmt = stmt.where(Card.status == status)
    stmt = stmt.order_by(Card.id.asc())
    return list(db.scalars(stmt).all())
