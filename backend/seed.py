"""Orbital 幂等种子脚本。

运行：python -m backend.seed

从 src/data 下的 apps.js / vending.js / docs.js 抄录数据并写入 backend/orbital.db。
卡密码通过复刻 vending.js 中的 genCode（LCG）算法生成，确保 c001..c103 的 code 与前端一致。
"""

import math
from urllib.parse import quote

from backend.app.database import SessionLocal, engine
from backend.app.models import (
    App,
    Base,
    Card,
    Doc,
    DocCategory,
    Order,
    Plan,
)

# 去掉易混淆字符（0/O/1/I/L）的字母表，与 vending.js 一致
_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def gen_code(seed: int) -> str:
    """复刻 vending.js 的 genCode（LCG），保证与前端生成同样的 code。"""
    s = seed

    def rand() -> float:
        nonlocal s
        s = (s * 9301 + 49297) % 233280
        return s / 233280

    def block() -> str:
        chars = []
        for _ in range(4):
            idx = int(math.floor(rand() * len(_ALPHABET)))
            chars.append(_ALPHABET[idx])
        return "".join(chars)

    return f"ORB-{block()}-{block()}-{block()}"


def img(prompt: str, size: str = "landscape_16_9") -> str:
    """复刻 apps.js 的 img() 文生图 URL 构造。"""
    return (
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image"
        f"?prompt={quote(prompt, safe='')}&image_size={size}"
    )


# ---------------------------------------------------------------------------
# 应用数据（来自 src/data/apps.js，8 个应用）
# ---------------------------------------------------------------------------

APPS = [
    {
        "id": "nova-studio",
        "name": "Nova Studio",
        "vendor": "Lumen Labs",
        "category": "design",
        "tagline": "矢量与栅格一体的下一代设计工作台",
        "description": "Nova Studio 把矢量编辑、栅格合成、变量系统与协作画板整合到一个原生应用中。"
        "支持组件库同步、设计令牌导出，以及与代码仓库的双向同步。",
        "icon": img("abstract gradient app icon for a design studio, indigo to violet, minimal, premium, on dark background", "square"),
        "cover": img("design workspace hero, dark UI panels floating over deep indigo gradient, dramatic lighting, premium product render"),
        "rating": 4.8,
        "reviews": 12480,
        "size": "284 MB",
        "version": "4.2.0",
        "released_at": "2024-11-12",
        "updated_at": "2025-07-18",
        "downloads": "1.2M",
        "featured": True,
        "tags": ["矢量", "栅格", "协作", "令牌"],
        "screenshots": [
            img("dark mode vector editor UI with layers panel and canvas, indigo accents"),
            img("component library panel with design tokens, dark theme"),
            img("collaboration cursors on a design canvas, premium product screenshot"),
        ],
        "license_info": {"model": "per-seat", "trial": "14 天试用"},
        "update_info": {
            "from": "4.1.3",
            "to": "4.2.0",
            "size": "42 MB",
            "notes": ["修复图层混合性能问题", "新增变量绑定 API", "改进导入 SVG 保真度"],
        },
        "plans": [
            {"id": "free", "name": "Free", "price": 0, "cycle": "forever", "note": "本地单机，3 个项目"},
            {"id": "pro", "name": "Pro", "price": 12, "cycle": "monthly", "note": "无限项目 + 云同步"},
            {"id": "team", "name": "Team", "price": 29, "cycle": "monthly", "note": "5 席位 + 共享组件库"},
        ],
    },
    {
        "id": "forge-cli",
        "name": "Forge CLI",
        "vendor": "Forge Inc.",
        "category": "dev",
        "tagline": "为团队而生的本地优先构建编排工具",
        "description": "Forge CLI 在本地编排构建、测试与发布流水线，缓存命中率高，并能把任意任务分发到团队共享的执行池。",
        "icon": img("geometric hexagon app icon, cyan and indigo, terminal aesthetic, dark background", "square"),
        "cover": img("terminal build pipeline visualization, glowing nodes on dark indigo background, premium"),
        "rating": 4.6,
        "reviews": 4231,
        "size": "96 MB",
        "version": "2.8.1",
        "released_at": "2023-06-02",
        "updated_at": "2025-07-21",
        "downloads": "640K",
        "featured": False,
        "tags": ["CI", "缓存", "流水线", "分布式"],
        "screenshots": [
            img("terminal UI showing build pipeline progress bars, dark theme with cyan accents"),
            img("distributed build graph visualization, nodes and edges, dark UI"),
        ],
        "license_info": {"model": "per-seat", "trial": "无需试用，永久免费层"},
        "update_info": {
            "from": "2.8.0",
            "to": "2.8.1",
            "size": "8 MB",
            "notes": ["修复 Windows 路径符号问题", "提升缓存回收效率"],
        },
        "plans": [
            {"id": "free", "name": "Free", "price": 0, "cycle": "forever", "note": "本地执行，1 个共享池"},
            {"id": "team", "name": "Team", "price": 19, "cycle": "monthly", "note": "共享执行池 + 优先缓存"},
            {"id": "ent", "name": "Enterprise", "price": 0, "cycle": "contact", "note": "私有部署 + SSO"},
        ],
    },
    {
        "id": "atlas-vault",
        "name": "Atlas Vault",
        "vendor": "Sentry & Co",
        "category": "security",
        "tagline": "零知识加密的团队密钥与机密管理",
        "description": "Atlas Vault 使用端到端加密保护团队的 API 密钥、证书与机密，提供细粒度访问控制与完整审计日志。",
        "icon": img("shield app icon with lock glyph, emerald and indigo, dark background, premium", "square"),
        "cover": img("glowing shield vault interface over dark green indigo gradient, security product render"),
        "rating": 4.9,
        "reviews": 8890,
        "size": "64 MB",
        "version": "5.0.0",
        "released_at": "2022-09-14",
        "updated_at": "2025-07-09",
        "downloads": "980K",
        "featured": True,
        "tags": ["零知识", "审计", "SSO", "机密"],
        "screenshots": [
            img("secrets manager UI with vault list and audit timeline, dark emerald accents"),
            img("access control matrix panel, dark theme"),
        ],
        "license_info": {"model": "per-seat", "trial": "30 天试用 Team"},
        "update_info": {
            "from": "4.4.2",
            "to": "5.0.0",
            "size": "24 MB",
            "notes": ["全新审计时间线 UI", "支持 SCIM 2.0", "底层加密库升级"],
        },
        "plans": [
            {"id": "free", "name": "Free", "price": 0, "cycle": "forever", "note": "个人，50 条机密"},
            {"id": "team", "name": "Team", "price": 6, "cycle": "monthly", "note": "10 席位 + 审计日志"},
            {"id": "ent", "name": "Enterprise", "price": 0, "cycle": "contact", "note": "SCIM + HSM 集成"},
        ],
    },
    {
        "id": "pulse-ai",
        "name": "Pulse AI",
        "vendor": "Pulse",
        "category": "ai",
        "tagline": "本地优先的代码与文档智能助手",
        "description": "Pulse AI 在本地运行模型，理解你的代码库与文档，提供补全、检索与重写，敏感数据不出本机。",
        "icon": img("minimal AI app icon, soft gradient orb, indigo glow, dark background", "square"),
        "cover": img("AI assistant interface with glowing orb and code panel, indigo gradient, premium"),
        "rating": 4.7,
        "reviews": 21034,
        "size": "1.4 GB",
        "version": "1.6.2",
        "released_at": "2024-03-20",
        "updated_at": "2025-07-22",
        "downloads": "2.1M",
        "featured": True,
        "tags": ["本地推理", "RAG", "补全", "隐私"],
        "screenshots": [
            img("AI code completion panel inline in editor, indigo glow, dark theme"),
            img("local RAG retrieval UI with document sources list, dark UI"),
            img("model settings panel showing local model selection, dark theme"),
        ],
        "license_info": {"model": "per-seat", "trial": "14 天试用 Plus"},
        "update_info": {
            "from": "1.6.1",
            "to": "1.6.2",
            "size": "120 MB",
            "notes": ["新增上下文压缩策略", "修复多语言索引崩溃"],
        },
        "plans": [
            {"id": "free", "name": "Free", "price": 0, "cycle": "forever", "note": "基础模型 + 每日额度"},
            {"id": "plus", "name": "Plus", "price": 9, "cycle": "monthly", "note": "更强模型 + 无限补全"},
            {"id": "team", "name": "Team", "price": 24, "cycle": "monthly", "note": "团队知识库 + 共享上下文"},
        ],
    },
    {
        "id": "cadence",
        "name": "Cadence",
        "vendor": "Cadence",
        "category": "productivity",
        "tagline": "面向工程师的时间线与待办聚合器",
        "description": "Cadence 把日历、代码提交、PR 与待办汇成一条时间线，自动生成每日总结与下周计划。",
        "icon": img("calendar timeline app icon, indigo and amber accent, dark background, minimal", "square"),
        "cover": img("productivity timeline dashboard over dark indigo gradient, premium render"),
        "rating": 4.5,
        "reviews": 3120,
        "size": "78 MB",
        "version": "3.4.0",
        "released_at": "2023-12-01",
        "updated_at": "2025-07-15",
        "downloads": "210K",
        "featured": False,
        "tags": ["时间线", "日历", "总结", "PR"],
        "screenshots": [
            img("daily timeline UI with calendar and PR cards, dark indigo theme"),
            img("weekly summary panel with charts and stats, dark UI"),
        ],
        "license_info": {"model": "per-seat", "trial": "14 天试用 Pro"},
        "update_info": {
            "from": "3.3.4",
            "to": "3.4.0",
            "size": "18 MB",
            "notes": ["新增 GitHub Projects 集成", "改进时区处理"],
        },
        "plans": [
            {"id": "free", "name": "Free", "price": 0, "cycle": "forever", "note": "个人，1 个集成"},
            {"id": "pro", "name": "Pro", "price": 7, "cycle": "monthly", "note": "无限集成 + 每日总结"},
        ],
    },
    {
        "id": "lumen-render",
        "name": "Lumen Render",
        "vendor": "Lumen Labs",
        "category": "media",
        "tagline": "GPU 加速的离线渲染与色彩管线",
        "description": "Lumen Render 提供基于 GPU 的离线渲染、色彩管理与批量导出，支持 OCIO 配置与自定义 LUT。",
        "icon": img("prism app icon with light dispersion, indigo and violet, dark background", "square"),
        "cover": img("render farm visualization with glowing frames over dark indigo gradient, premium"),
        "rating": 4.4,
        "reviews": 1560,
        "size": "512 MB",
        "version": "7.1.0",
        "released_at": "2021-04-18",
        "updated_at": "2025-06-30",
        "downloads": "88K",
        "featured": False,
        "tags": ["渲染", "GPU", "OCIO", "LUT"],
        "screenshots": [
            img("render queue UI with thumbnails and progress, dark theme with violet accents"),
            img("color management panel with OCIO config, dark UI"),
        ],
        "license_info": {"model": "perpetual", "trial": "30 天水印试用"},
        "update_info": {
            "from": "7.0.5",
            "to": "7.1.0",
            "size": "180 MB",
            "notes": ["新增 Apple Silicon 原生支持", "改进降噪器质量"],
        },
        "plans": [
            {"id": "node", "name": "Node", "price": 149, "cycle": "once", "note": "单节点永久授权"},
            {"id": "farm", "name": "Farm", "price": 39, "cycle": "monthly", "note": "渲染农场调度"},
        ],
    },
    {
        "id": "kepler-db",
        "name": "Kepler DB",
        "vendor": "Kepler",
        "category": "dev",
        "tagline": "嵌入式时序数据库与可视化仪表盘",
        "description": "Kepler DB 是一个嵌入式时序数据库，自带 SQL 查询、告警规则与可视化仪表盘，适合 IoT 与监控场景。",
        "icon": img("database app icon with waveform, cyan and indigo, dark background", "square"),
        "cover": img("time series dashboard with glowing waveforms over dark indigo, premium product render"),
        "rating": 4.6,
        "reviews": 5210,
        "size": "142 MB",
        "version": "6.2.3",
        "released_at": "2022-11-08",
        "updated_at": "2025-07-19",
        "downloads": "320K",
        "featured": False,
        "tags": ["时序", "SQL", "仪表盘", "告警"],
        "screenshots": [
            img("time series chart dashboard with multiple panels, dark cyan accents"),
            img("SQL query editor with results table, dark theme"),
        ],
        "license_info": {"model": "per-seat", "trial": "14 天试用 Pro"},
        "update_info": {
            "from": "6.2.2",
            "to": "6.2.3",
            "size": "22 MB",
            "notes": ["修复高基数查询内存泄漏", "改进压缩算法"],
        },
        "plans": [
            {"id": "free", "name": "Free", "price": 0, "cycle": "forever", "note": "单机，30 天保留"},
            {"id": "pro", "name": "Pro", "price": 15, "cycle": "monthly", "note": "集群 + 告警规则"},
            {"id": "ent", "name": "Enterprise", "price": 0, "cycle": "contact", "note": "HA + 私有部署"},
        ],
    },
    {
        "id": "aurora-motion",
        "name": "Aurora Motion",
        "vendor": "Aurora",
        "category": "design",
        "tagline": "面向界面的动效设计与可导出代码",
        "description": "Aurora Motion 让你在时间线上设计界面动效，并直接导出 GSAP / Motion / CSS 关键帧代码。",
        "icon": img("motion app icon with play glyph, indigo and pink, dark background, minimal", "square"),
        "cover": img("motion timeline UI with keyframes over dark indigo gradient, premium render"),
        "rating": 4.7,
        "reviews": 6740,
        "size": "198 MB",
        "version": "2.0.0",
        "released_at": "2024-08-22",
        "updated_at": "2025-07-20",
        "downloads": "410K",
        "featured": True,
        "tags": ["动效", "关键帧", "导出", "GSAP"],
        "screenshots": [
            img("motion timeline with keyframes and curves panel, dark indigo theme"),
            img("code export panel showing GSAP snippet, dark UI"),
        ],
        "license_info": {"model": "per-seat", "trial": "14 天试用 Pro"},
        "update_info": {
            "from": "1.9.2",
            "to": "2.0.0",
            "size": "64 MB",
            "notes": ["全新时间线引擎", "新增 Motion 代码导出", "改进曲线编辑器"],
        },
        "plans": [
            {"id": "free", "name": "Free", "price": 0, "cycle": "forever", "note": "本地，3 个场景"},
            {"id": "pro", "name": "Pro", "price": 14, "cycle": "monthly", "note": "无限场景 + 代码导出"},
        ],
    },
]


# ---------------------------------------------------------------------------
# 卡密数据（来自 src/data/vending.js 的 initialCards，21 张）
# code 通过 gen_code(seed) 复刻前端 LCG 生成
# ---------------------------------------------------------------------------

CARDS = [
    {"id": "c001", "seed": 11, "type": "subscription", "appId": "nova-studio", "planId": "pro", "status": "available", "createdAt": "2025-06-01"},
    {"id": "c002", "seed": 22, "type": "subscription", "appId": "nova-studio", "planId": "pro", "status": "available", "createdAt": "2025-06-01"},
    {"id": "c003", "seed": 33, "type": "subscription", "appId": "nova-studio", "planId": "team", "status": "available", "createdAt": "2025-06-08"},
    {"id": "c004", "seed": 44, "type": "trial", "appId": "nova-studio", "planId": "pro", "status": "available", "createdAt": "2025-06-15"},
    {"id": "c005", "seed": 55, "type": "subscription", "appId": "pulse-ai", "planId": "plus", "status": "available", "createdAt": "2025-06-20"},
    {"id": "c006", "seed": 66, "type": "subscription", "appId": "pulse-ai", "planId": "team", "status": "available", "createdAt": "2025-06-20"},
    {"id": "c007", "seed": 77, "type": "trial", "appId": "pulse-ai", "planId": "plus", "status": "available", "createdAt": "2025-07-01"},
    {"id": "c008", "seed": 88, "type": "subscription", "appId": "atlas-vault", "planId": "team", "status": "available", "createdAt": "2025-07-05"},
    {"id": "c009", "seed": 99, "type": "trial", "appId": "atlas-vault", "planId": "team", "status": "available", "createdAt": "2025-07-05"},
    {"id": "c010", "seed": 101, "type": "perpetual", "appId": "lumen-render", "planId": "node", "status": "available", "createdAt": "2025-07-10"},
    {"id": "c011", "seed": 202, "type": "perpetual", "appId": "lumen-render", "planId": "node", "status": "available", "createdAt": "2025-07-10"},
    {"id": "c012", "seed": 303, "type": "subscription", "appId": "forge-cli", "planId": "team", "status": "available", "createdAt": "2025-07-12"},
    {"id": "c013", "seed": 404, "type": "subscription", "appId": "aurora-motion", "planId": "pro", "status": "available", "createdAt": "2025-07-18"},
    {"id": "c014", "seed": 505, "type": "trial", "appId": "aurora-motion", "planId": "pro", "status": "available", "createdAt": "2025-07-18"},
    {"id": "c015", "seed": 606, "type": "subscription", "appId": "kepler-db", "planId": "pro", "status": "available", "createdAt": "2025-07-20"},
    {"id": "c016", "seed": 707, "type": "subscription", "appId": "kepler-db", "planId": "pro", "status": "available", "createdAt": "2025-07-20"},
    {"id": "c017", "seed": 808, "type": "trial", "appId": "kepler-db", "planId": "pro", "status": "available", "createdAt": "2025-07-20"},
    {"id": "c018", "seed": 909, "type": "subscription", "appId": "cadence", "planId": "pro", "status": "available", "createdAt": "2025-07-22"},
    # 已发放并已兑换的历史卡密
    {"id": "c101", "seed": 111, "type": "subscription", "appId": "pulse-ai", "planId": "plus", "status": "redeemed", "createdAt": "2025-05-10", "soldAt": "2025-05-12", "orderId": "o101"},
    {"id": "c102", "seed": 222, "type": "subscription", "appId": "nova-studio", "planId": "pro", "status": "redeemed", "createdAt": "2025-04-20", "soldAt": "2025-04-22", "orderId": "o102"},
    {"id": "c103", "seed": 333, "type": "perpetual", "appId": "lumen-render", "planId": "node", "status": "redeemed", "createdAt": "2025-03-15", "soldAt": "2025-03-16", "orderId": "o103"},
]


# ---------------------------------------------------------------------------
# 订单数据（来自 src/data/vending.js 的 initialOrders，3 条）
# ---------------------------------------------------------------------------

ORDERS = [
    {"id": "o101", "appId": "pulse-ai", "planId": "plus", "type": "subscription", "price": 9, "status": "completed", "cardId": "c101", "createdAt": "2025-05-12", "buyer": "lumen@orbital.dev"},
    {"id": "o102", "appId": "nova-studio", "planId": "pro", "type": "subscription", "price": 12, "status": "completed", "cardId": "c102", "createdAt": "2025-04-22", "buyer": "lumen@orbital.dev"},
    {"id": "o103", "appId": "lumen-render", "planId": "node", "type": "perpetual", "price": 149, "status": "completed", "cardId": "c103", "createdAt": "2025-03-16", "buyer": "studio@orbital.dev"},
]


# ---------------------------------------------------------------------------
# 文档分类（来自 src/data/docs.js 的 docCategories，6 个）
# ---------------------------------------------------------------------------

DOC_CATEGORIES = [
    {"id": "start", "name": "快速开始", "icon": "◇"},
    {"id": "install", "name": "应用接入", "icon": "⌘"},
    {"id": "api", "name": "API 参考", "icon": "◐"},
    {"id": "billing", "name": "订阅与授权", "icon": "▣"},
    {"id": "vending", "name": "发卡系统", "icon": "✦"},
    {"id": "faq", "name": "常见问题", "icon": "?"},
]


# ---------------------------------------------------------------------------
# 文档正文（来自 src/data/docs.js 的 docsIndex + docsContent，15 篇）
# 每个 section: {h, body, code?: {lang, content}}
# ---------------------------------------------------------------------------

DOCS = [
    {
        "slug": "quickstart",
        "category": "start",
        "title": "5 分钟上手",
        "summary": "从安装到下载你的第一款应用，只需几分钟。",
        "updatedAt": "2025-07-22",
        "sections": [
            {"h": "创建账户", "body": "访问 Orbital 首页，使用工作邮箱注册。首次登录后系统会为你创建一个默认组织，你可以稍后邀请团队成员加入。"},
            {"h": "浏览应用", "body": "在「浏览」页通过分类或搜索定位应用，每款应用都提供截图、更新历史与定价方案。"},
            {"h": "下载与安装", "body": "进入应用详情页，点击「下载」按钮。下载完成后，应用会自动加入你的「资料库」，并提示是否立即安装。"},
            {"h": "激活订阅", "body": "在详情页选择订阅计划并完成支付，订阅状态会立即同步到「订阅」页。也可使用「发卡」页发放的卡密兑换订阅。"},
        ],
    },
    {
        "slug": "account",
        "category": "start",
        "title": "账户与组织",
        "summary": "Orbital 以组织为单位管理席位、订阅与许可证。",
        "updatedAt": "2025-07-20",
        "sections": [
            {"h": "组织结构", "body": "每个账户默认归属一个个人组织。你可以创建团队组织并邀请成员，成员加入后即可共享组织内的订阅与许可证。"},
            {"h": "席位", "body": "订阅与永久授权均按席位计费。组织管理员可在「设置 → 席位」中分配或回收席位。"},
            {"h": "权限", "body": "组织内分为 Owner / Admin / Member 三种角色，仅 Owner 与 Admin 可执行支付、退款与发卡操作。"},
        ],
    },
    {
        "slug": "publish-app",
        "category": "install",
        "title": "厂商上架应用",
        "summary": "把你的应用发布到 Orbital 商城，触达全球开发者团队。",
        "updatedAt": "2025-07-18",
        "sections": [
            {"h": "申请厂商资质", "body": "在「厂商入驻」提交公司信息与开发者资质，审核通过后即可创建应用条目。"},
            {"h": "上传产物", "body": "在厂商控制台为每个版本上传签名后的安装包，系统会自动校验签名并生成校验摘要。"},
            {"h": "填写元信息", "body": "完善应用名称、分类、截图、定价方案与更新说明。元信息变更需重新审核。"},
            {
                "h": "manifest 示例",
                "body": "每个版本附带一个 manifest 描述文件，格式如下：",
                "code": {"lang": "json", "content": """{
  "appId": "nova-studio",
  "version": "4.2.0",
  "channel": "stable",
  "platforms": ["darwin-arm64", "win32-x64"],
  "signature": "ed25519:9f3a...",
  "checksum": "sha256:c2a7...",
  "size": 284000000,
  "releaseNotes": ["修复图层混合性能问题", "新增变量绑定 API"]
}"""},
            },
        ],
    },
    {
        "slug": "versioning",
        "category": "install",
        "title": "版本与更新分发",
        "summary": "Orbital 支持灰度发布、强制更新与回滚。",
        "updatedAt": "2025-07-19",
        "sections": [
            {"h": "渠道", "body": "每个应用可定义 stable / beta / nightly 三个渠道，用户在资料库中按应用切换渠道。"},
            {"h": "灰度", "body": "厂商可设置灰度比例（如 10%），系统会按设备指纹随机命中，命中设备会先收到新版本。"},
            {"h": "回滚", "body": "若新版本出现问题，厂商可一键回滚到任意历史版本，已升级用户会自动收到降级提示。"},
        ],
    },
    {
        "slug": "signature",
        "category": "install",
        "title": "签名与校验",
        "summary": "所有发布产物必须使用厂商私钥签名，客户端在下载时校验。",
        "updatedAt": "2025-07-15",
        "sections": [
            {"h": "签名算法", "body": "推荐使用 Ed25519 进行签名，公钥在厂商入驻时上传并由平台公证。"},
            {
                "h": "签名命令",
                "body": "使用 Orbital CLI 对产物签名：",
                "code": {"lang": "bash", "content": """# 生成密钥对
orbital keys gen --out vendor.key --pub vendor.pub

# 对安装包签名
orbital sign --key vendor.key \\
  --app nova-studio \\
  --version 4.2.0 \\
  --file NovaStudio-4.2.0.dmg"""},
            },
            {"h": "客户端校验", "body": "下载完成后客户端会从平台拉取公钥并校验签名，校验失败会拒绝安装并提示用户。"},
        ],
    },
    {
        "slug": "api-overview",
        "category": "api",
        "title": "API 总览",
        "summary": "Orbital 提供 RESTful API，用于许可证查询、订单同步与发卡。",
        "updatedAt": "2025-07-21",
        "sections": [
            {"h": "Base URL", "body": "所有请求指向 https://api.orbital.dev/v1。"},
            {"h": "认证", "body": "使用 Bearer Token 认证，Token 在厂商控制台的「API 密钥」中生成。"},
            {
                "h": "示例请求",
                "body": "查询某个许可证的状态：",
                "code": {"lang": "bash", "content": """curl https://api.orbital.dev/v1/licenses/LR-7K2A-9FQ4-ZZ01 \\
  -H "Authorization: Bearer sk_live_...\""""},
            },
            {"h": "错误处理", "body": "错误返回统一 JSON 结构，包含 code、message 与 detail 字段。429 表示限流，建议指数退避重试。"},
        ],
    },
    {
        "slug": "api-license",
        "category": "api",
        "title": "许可证接口",
        "summary": "查询、激活与吊销许可证。",
        "updatedAt": "2025-07-21",
        "sections": [
            {
                "h": "激活许可证",
                "body": "将一张卡密兑换为许可证：",
                "code": {"lang": "bash", "content": """POST /v1/licenses/redeem
Content-Type: application/json

{
  "code": "ORB-ABCD-EFGH-JKLM",
  "device": { "fingerprint": "fp_...", "platform": "darwin-arm64" }
}"""},
            },
            {"h": "响应", "body": "返回 license 对象，包含 key、appId、planId、seats 与到期时间。"},
            {"h": "吊销", "body": "Owner 可调用 DELETE /v1/licenses/{key} 吊销许可证，吊销后该设备会立即失效。"},
        ],
    },
    {
        "slug": "api-webhooks",
        "category": "api",
        "title": "Webhooks",
        "summary": "订阅订单、发卡、退款等事件。",
        "updatedAt": "2025-07-21",
        "sections": [
            {"h": "事件类型", "body": "支持 order.completed、card.issued、card.redeemed、subscription.renewed、refund.created 等事件。"},
            {
                "h": "Webhook 载荷",
                "body": "所有事件使用统一信封格式：",
                "code": {"lang": "json", "content": """{
  "id": "evt_01HZX...",
  "type": "order.completed",
  "createdAt": "2025-07-22T08:30:00Z",
  "data": {
    "orderId": "o104",
    "appId": "nova-studio",
    "planId": "pro",
    "cardId": "c005",
    "price": 12
  }
}"""},
            },
            {"h": "签名校验", "body": "每个 Webhook 携带 X-Orbital-Signature 头，值为 HMAC-SHA256(secret, body)。请务必校验以防止伪造。"},
        ],
    },
    {
        "slug": "subscriptions",
        "category": "billing",
        "title": "订阅管理",
        "summary": "按月或按年订阅、续费与取消。",
        "updatedAt": "2025-07-20",
        "sections": [
            {"h": "计费周期", "body": "订阅按月计费，可随时取消，取消后订阅持续到当前周期结束。年付享 8 折。"},
            {"h": "续费", "body": "默认自动续费，可在「订阅」页关闭。续费失败会进入宽限期（7 天），期间订阅仍可用。"},
            {"h": "升降级", "body": "可在订阅页切换计划，差价按比例补扣或退还到余额。"},
        ],
    },
    {
        "slug": "licenses",
        "category": "billing",
        "title": "永久授权",
        "summary": "一次性购买、席位与机器绑定。",
        "updatedAt": "2025-07-20",
        "sections": [
            {"h": "授权模型", "body": "永久授权按席位出售，每个席位可绑定一台设备。解绑后可重新绑定到新设备。"},
            {"h": "更新期", "body": "永久授权含一年免费更新，到期后可付费续订更新期，否则停留在当前版本。"},
        ],
    },
    {
        "slug": "refund",
        "category": "billing",
        "title": "退款政策",
        "summary": "7 天无理由退款与争议处理。",
        "updatedAt": "2025-07-19",
        "sections": [
            {"h": "7 天无理由", "body": "订阅与永久授权均支持 7 天无理由退款，已兑换的卡密不支持退款。"},
            {"h": "争议处理", "body": "若对退款结果有异议，可在订单页发起争议，平台会在 3 个工作日内仲裁。"},
        ],
    },
    {
        "slug": "vending-overview",
        "category": "vending",
        "title": "发卡机制总览",
        "summary": "卡密库存、自动发放与兑换流程。",
        "updatedAt": "2025-07-22",
        "sections": [
            {"h": "什么是发卡", "body": "发卡机制允许厂商或管理员预先批量生成卡密（订阅码 / 永久授权码 / 试用码），用户购买或领取后获得一张卡密，兑换即可激活对应权益。"},
            {"h": "自动发卡", "body": "当用户在应用详情页完成支付时，系统会从该应用对应计划的可用库存中自动分配一张卡密，并通过页面与邮件即时发放给买家。"},
            {"h": "卡密状态机", "body": "卡密有四种状态：available（可用）→ sold（已发放）→ redeemed（已兑换）；任意时刻可 void（作废）。"},
            {
                "h": "状态流转图",
                "body": "卡密状态转换如下：",
                "code": {"lang": "text", "content": """available ──purchase──▶ sold ──redeem──▶ redeemed
    │                     │
    └──── void ───▶ void ◀┘"""},
            },
        ],
    },
    {
        "slug": "vending-stock",
        "category": "vending",
        "title": "卡密库存管理",
        "summary": "批量生成、导入、作废卡密。",
        "updatedAt": "2025-07-22",
        "sections": [
            {"h": "批量生成", "body": "在「发卡」页选择应用与计划，输入数量即可批量生成卡密。生成的卡密初始状态为 available。"},
            {
                "h": "生成请求",
                "body": "通过 API 批量生成卡密：",
                "code": {"lang": "bash", "content": """POST /v1/cards/batch
{
  "appId": "nova-studio",
  "planId": "pro",
  "type": "subscription",
  "count": 50
}"""},
            },
            {"h": "库存预警", "body": "当某应用某计划的可用库存低于阈值（默认 5 张）时，系统会向厂商发送 Webhook 与邮件预警。"},
            {"h": "作废", "body": "已发放但未兑换的卡密可作废，作废后无法再兑换。已兑换的卡密不可作废。"},
        ],
    },
    {
        "slug": "vending-redeem",
        "category": "vending",
        "title": "卡密兑换",
        "summary": "用户兑换卡密后的处理流程。",
        "updatedAt": "2025-07-22",
        "sections": [
            {"h": "兑换入口", "body": "用户在「资料库」页顶部点击「兑换卡密」，输入卡密码即可兑换。兑换成功后权益立即生效。"},
            {"h": "兑换校验", "body": "系统会校验卡密状态、归属应用与计划、以及当前用户是否已持有同类权益（避免重复兑换）。"},
            {"h": "设备绑定", "body": "永久授权码兑换时会要求绑定当前设备指纹；订阅码与试用码则不绑定设备。"},
        ],
    },
    {
        "slug": "faq-general",
        "category": "faq",
        "title": "通用问题",
        "summary": "平台、支付、数据隐私等常见疑问。",
        "updatedAt": "2025-07-18",
        "sections": [
            {"h": "支付方式", "body": "支持信用卡、PayPal 与企业对公转账。对公转账需 3-5 个工作日到账，到账后订阅立即生效。"},
            {"h": "数据隐私", "body": "Orbital 不存储你的应用使用数据。仅记录必要的计费与设备指纹信息，用于许可证校验。"},
            {"h": "离线使用", "body": "订阅与永久授权均支持 30 天离线使用，超期未联网会进入只读模式，联网后自动恢复。"},
        ],
    },
]


def seed() -> None:
    # 幂等：先 drop 再 create，保证库内始终是干净的种子数据
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 应用 + 计划
        for a in APPS:
            plans = a["plans"]
            app = App(
                id=a["id"],
                name=a["name"],
                vendor=a["vendor"],
                category=a["category"],
                tagline=a["tagline"],
                description=a["description"],
                icon=a["icon"],
                cover=a["cover"],
                rating=a["rating"],
                reviews=a["reviews"],
                size=a["size"],
                version=a["version"],
                released_at=a["released_at"],
                updated_at=a["updated_at"],
                downloads=a["downloads"],
                featured=a["featured"],
                tags=a["tags"],
                screenshots=a["screenshots"],
                license_info=a["license_info"],
                update_info=a["update_info"],
            )
            db.add(app)
            db.flush()
            for p in plans:
                db.add(
                    Plan(
                        plan_id=p["id"],
                        app_id=a["id"],
                        name=p["name"],
                        price=p["price"],
                        cycle=p["cycle"],
                        note=p.get("note"),
                    )
                )
        db.commit()

        # 卡密
        for c in CARDS:
            db.add(
                Card(
                    id=c["id"],
                    code=gen_code(c["seed"]),
                    type=c["type"],
                    app_id=c["appId"],
                    plan_id=c["planId"],
                    status=c["status"],
                    created_at=c["createdAt"],
                    sold_at=c.get("soldAt"),
                    order_id=c.get("orderId"),
                    buyer=c.get("buyer"),
                )
            )
        db.commit()

        # 订单
        for o in ORDERS:
            db.add(
                Order(
                    id=o["id"],
                    app_id=o["appId"],
                    plan_id=o["planId"],
                    type=o["type"],
                    price=o["price"],
                    status=o["status"],
                    card_id=o["cardId"],
                    created_at=o["createdAt"],
                    buyer=o["buyer"],
                )
            )
        db.commit()

        # 文档分类
        for cat in DOC_CATEGORIES:
            db.add(DocCategory(id=cat["id"], name=cat["name"], icon=cat["icon"]))
        db.commit()

        # 文档
        for d in DOCS:
            db.add(
                Doc(
                    slug=d["slug"],
                    category=d["category"],
                    title=d["title"],
                    summary=d["summary"],
                    updated_at=d["updatedAt"],
                    sections=d["sections"],
                )
            )
        db.commit()

        # 统计
        from sqlalchemy import func, select

        n_apps = db.scalar(select(func.count()).select_from(App))
        n_plans = db.scalar(select(func.count()).select_from(Plan))
        n_cards = db.scalar(select(func.count()).select_from(Card))
        n_orders = db.scalar(select(func.count()).select_from(Order))
        n_docs = db.scalar(select(func.count()).select_from(Doc))
        n_cats = db.scalar(select(func.count()).select_from(DocCategory))

        print("Seed complete:")
        print(f"  apps       : {n_apps}")
        print(f"  plans      : {n_plans}")
        print(f"  cards      : {n_cards}")
        print(f"  orders     : {n_orders}")
        print(f"  docs       : {n_docs}")
        print(f"  categories : {n_cats}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
