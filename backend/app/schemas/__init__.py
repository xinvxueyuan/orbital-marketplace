"""Orbital 后端全部 Pydantic v2 schema（集中本文件）。

约定：
- Read schema 字段名与 ORM 属性名一致（snake_case），配合
  `from_attributes=True` 直接从 ORM 对象取值；
- `alias_generator=to_camel` + `populate_by_name=True` 使 JSON 输出为 camelCase
  （与前端原数据字段风格一致，如 appId / planId / createdAt）；
- `license` / `update` 两个键通过 `serialization_alias` 单独覆盖。
- 请求 schema 字段名直接用 camelCase，使 JSON 输入键匹配。
"""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

# Read schema 通用配置
_CAMEL = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)


# ---------- Read schemas ----------


class PlanRead(BaseModel):
    model_config = _CAMEL

    plan_id: str
    app_id: str
    name: str
    price: float
    cycle: str
    note: Optional[str] = None


class AppRead(BaseModel):
    model_config = _CAMEL

    id: str
    name: str
    vendor: str
    category: str
    tagline: str
    description: str
    icon: str
    cover: str
    rating: float
    reviews: int
    size: str
    version: str
    released_at: str
    updated_at: str
    downloads: str
    featured: bool
    tags: list
    screenshots: list
    license_info: Optional[dict] = Field(default=None, serialization_alias="license")
    update_info: Optional[dict] = Field(default=None, serialization_alias="update")
    plans: list[PlanRead] = Field(default_factory=list)


class CardRead(BaseModel):
    model_config = _CAMEL

    id: str
    code: str
    type: str
    app_id: str
    plan_id: str
    status: str
    created_at: str
    sold_at: Optional[str] = None
    order_id: Optional[str] = None
    buyer: Optional[str] = None


class OrderRead(BaseModel):
    model_config = _CAMEL

    id: str
    app_id: str
    plan_id: str
    type: str
    price: float
    status: str
    card_id: Optional[str] = None
    created_at: str
    buyer: str


class LibraryEntryRead(BaseModel):
    model_config = _CAMEL

    id: int
    user_id: str
    app_id: str
    kind: str
    plan_id: Optional[str] = None
    license_key: Optional[str] = None
    created_at: str


class LibraryOut(BaseModel):
    model_config = _CAMEL

    installed: list[LibraryEntryRead] = Field(default_factory=list)
    licenses: list[LibraryEntryRead] = Field(default_factory=list)
    subscriptions: list[LibraryEntryRead] = Field(default_factory=list)


class DocCategoryRead(BaseModel):
    model_config = _CAMEL

    id: str
    name: str
    icon: str


class DocRead(BaseModel):
    model_config = _CAMEL

    slug: str
    category: str
    title: str
    summary: str
    updated_at: str
    sections: list[dict]


class DocSummaryRead(BaseModel):
    model_config = _CAMEL

    slug: str
    category: str
    title: str
    summary: str


class DocsListOut(BaseModel):
    model_config = _CAMEL

    categories: list[DocCategoryRead]
    docs: list[DocSummaryRead]


# ---------- Request schemas ----------


class CardBatchIn(BaseModel):
    appId: str
    planId: str
    type: str
    count: int = Field(ge=1, le=500)


class AutoIssueIn(BaseModel):
    appId: str
    planId: str
    type: str
    price: float
    buyer: str = "lumen@orbital.dev"


class RedeemIn(BaseModel):
    code: str


class OrderCreateIn(BaseModel):
    appId: str
    planId: str
    type: str
    price: float
    buyer: str = "lumen@orbital.dev"


class LibraryActionIn(BaseModel):
    appId: str
    planId: Optional[str] = None


# ---------- 复合返回 ----------


class AutoIssueOut(BaseModel):
    model_config = _CAMEL

    order: OrderRead
    card: CardRead
