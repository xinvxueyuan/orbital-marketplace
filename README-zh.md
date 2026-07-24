# Orbital

> [English](README.md) | 中文

[![CI Builds](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%91%B7-ci-builds.yml/badge.svg)](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%91%B7-ci-builds.yml)
[![前端 CI](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%A7%AA-frontend.yml/badge.svg)](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%A7%AA-frontend.yml)
[![Python CI](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%A7%AA-python.yml/badge.svg)](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%A7%AA-python.yml)
[![License](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue)](#许可)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/python-3.11+-3776AB)](https://www.python.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF)](https://vitejs.dev/)
[![Gitmoji](https://img.shields.io/badge/gitmoji-%20%F0%9F%98%9C%20%F0%9F%98%8D-FFDD67.svg?style=flat-square)](https://gitmoji.dev/)

**Orbital**（包名 `orbital-marketplace`）是一款单页应用（SPA）商城，把应用发现、下载、许可证、更新、订阅、发卡机制与文档站整合在统一的 SPA 体验中。前端是基于 Vite 的 React SPA；后端是基于 SQLAlchemy 2.0 与 SQLite 的 FastAPI 服务，在 `/api/v1` 下提供 RESTful API。

## 项目状态

Orbital 已发布 `1.0.0` 里程碑。当前版本交付了发卡机制、文档站、FastAPI 后端以及 React Router v7 迁移。API 与路由面已稳定，后续工作聚焦于加固、测试与运维工具。

常用入口：

- [快速开始](#快速开始) — 本地运行前端与后端
- [API 概览](#api-概览) — `/api/v1` 接口参考
- [项目结构](#项目结构) — 仓库布局
- [路线图](#路线图) — 后续计划
- [贡献指南](CONTRIBUTING.md) — 如何提交 Pull Request
- [更新日志](CHANGELOG.md) — 发布历史

## 特性

- **发现与浏览** — 发现页/浏览页提供精选应用、分类筛选、搜索与排序。
- **应用详情** — 截图、版本历史、定价方案、许可证模型与更新说明。
- **订阅与授权** — 按席位订阅、永久授权、试用档位，以及聚合的订阅页。
- **更新** — 渠道感知的更新追踪，包含 from→to 版本差异与发布说明。
- **发卡机制** — 批量生成卡密、购买时自动发卡、兑换与作废，基于 `available → sold → redeemed → void` 状态机。
- **资料库** — 单用户演示资料库，展示已拥有应用、安装状态与卡密兑换。
- **文档站** — 应用内文档，含分类与分节文章（快速开始、应用接入、API 参考、订阅与授权、发卡系统、常见问题）。
- **SPA 架构** — React Router v7 库模式 SPA，配合 Framer Motion 实现路由过渡动画。

## 技术栈

**前端**

- React 18
- React Router v7（库模式 SPA）
- Vite 5
- Tailwind CSS
- Framer Motion

**后端**

- FastAPI（最新）
- SQLAlchemy 2.0
- Pydantic v2
- SQLite

## 快速开始

> 需要 Node.js 20+ 与 Python 3.11+。

### 前端

```bash
npm install
npm run dev      # http://localhost:5173（代理 /api → http://localhost:8000）
npm run build    # 生产构建 → dist/
```

### 后端

```bash
pip install -r backend/requirements.txt
python -m backend.seed                                    # 写入 SQLite 种子数据（幂等）
uvicorn backend.app.main:app --reload                     # http://localhost:8000
```

`:5173` 的开发服务器会把 `/api` 代理到 `:8000` 的后端，因此全栈开发时需同时运行两者。执行 seed 后会在 `backend/` 下生成 `orbital.db`。

### 冒烟检查

```bash
curl http://localhost:8000/api/v1/health                  # {"status":"ok"}
curl http://localhost:8000/api/v1/apps | head
```

## 项目结构

```
orbital/
├── src/                         # React SPA
│   ├── api/                     # 请求客户端（apps、docs、library、vending）
│   ├── components/              # 共享 UI（Layout、Navbar、AppCard 等）
│   ├── context/                 # React Context（Library、Vending）
│   ├── data/                    # 内存种子数据（apps、vending）
│   ├── pages/                   # 路由页面（Discover、Browse、Vending 等）
│   ├── App.jsx                  # 路由
│   └── main.jsx                 # 入口
├── backend/                     # FastAPI 服务
│   ├── app/
│   │   ├── models/              # SQLAlchemy 模型
│   │   ├── schemas/             # Pydantic v2 模式
│   │   ├── crud/                # 数据访问（apps、cards、docs、library、orders）
│   │   ├── routers/             # API 路由（/api/v1）
│   │   ├── config.py            # 数据库路径、CORS 来源
│   │   ├── database.py          # engine + SessionLocal
│   │   └── main.py              # FastAPI app + lifespan + 路由挂载
│   ├── seed.py                  # 幂等种子脚本
│   ├── requirements.txt
│   └── orbital.db               # 生成的 SQLite（已 gitignore）
├── public/                      # 静态资源
├── index.html
├── vite.config.js
├── tailwind.config.js
├── Dockerfile                   # 多阶段构建（前端 + 后端）
├── docker-compose.yml
├── pyproject.toml               # ruff + pytest 配置
└── .github/                     # 工作流、issue 模板、CODEOWNERS
```

## API 概览

所有接口前缀为 `/api/v1`。错误返回 `{ "error": "<code>", "message": "<text>" }`，并带相应 HTTP 状态码。

| 方法     | 路径                          | 说明                                        |
|----------|-------------------------------|---------------------------------------------|
| `GET`    | `/health`                     | 存活探针 → `{ "status": "ok" }`             |
| `GET`    | `/apps`                       | 应用列表（过滤：`q`、`category`、`sort`）   |
| `GET`    | `/apps/{app_id}`              | 应用详情                                     |
| `GET`    | `/docs`                       | 文档分类 + 索引                              |
| `GET`    | `/docs/{slug}`                | 按 slug 读取文章                             |
| `GET`    | `/cards`                      | 卡密列表（过滤：`appId`、`status`）          |
| `POST`   | `/cards/batch`                | 批量生成卡密                                 |
| `POST`   | `/cards/auto-issue`           | 购买时自动发卡（创建订单）                   |
| `POST`   | `/cards/redeem`               | 按卡密码兑换                                 |
| `POST`   | `/cards/{card_id}/void`       | 作废卡密                                     |
| `GET`    | `/orders`                     | 订单列表                                     |
| `POST`   | `/orders`                     | 创建订单                                     |
| `GET`    | `/library`                    | 资料库概览（单用户演示）                     |
| `POST`   | `/library/install`            | 安装应用                                     |
| `POST`   | `/library/uninstall`          | 卸载应用                                     |
| `POST`   | `/library/subscribe`          | 订阅计划                                     |
| `POST`   | `/library/buy-license`        | 购买永久授权                                 |

前端路由对应各功能域：`/` 发现、`/apps` 浏览、`/apps/:id` 详情、`/subscriptions` 订阅、`/updates` 更新、`/library` 资料库、`/vending` 发卡、`/docs` 文档、`/docs/:slug` 文章。

## 路线图

- [ ] CRUD 与发卡状态机的自动化测试套件
- [ ] `/apps` 分页与全文搜索
- [ ] 认证与多租户组织
- [ ] `order.completed` / `card.issued` / `card.redeemed` 的 Webhook 投递
- [ ] 生产部署指南（反向代理 + 容器编排）

## 贡献

欢迎贡献。请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解开发环境、分支策略、提交规范（gitmoji + Conventional Commits）与 Pull Request 检查清单。所有参与者需遵守[行为准则](CODE_OF_CONDUCT.md)。

## 安全

发现漏洞？请查阅 [SECURITY.md](SECURITY.md) 了解报告流程与支持版本。**请不要**用公开 issue 报告安全问题。

## 许可

本项目采用 **MIT License** 与 **Apache License, Version 2.0** 双许可——你可任选其一使用。

- [MIT License](LICENSE) — `SPDX-License-Identifier: MIT`
- [Apache License 2.0](LICENSE-APACHE) — `SPDX-License-Identifier: Apache-2.0`
- 组合标识：`MIT OR Apache-2.0`
- 第三方依赖归属说明见 [NOTICE](NOTICE)。

Copyright (c) 2025 xinvxueyuan (xinvStar.inc).
