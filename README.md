# Orbital

> English | [中文](README-zh.md)

[![CI Builds](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%91%B7-ci-builds.yml/badge.svg)](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%91%B7-ci-builds.yml)
[![Frontend CI](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%A7%AA-frontend.yml/badge.svg)](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%A7%AA-frontend.yml)
[![Python CI](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%A7%AA-python.yml/badge.svg)](https://github.com/xinvxueyuan/orbital/actions/workflows/%F0%9F%A7%AA-python.yml)
[![License](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue)](#license)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/python-3.11+-3776AB)](https://www.python.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF)](https://vitejs.dev/)
[![Gitmoji](https://img.shields.io/badge/gitmoji-%20%F0%9F%98%9C%20%F0%9F%98%8D-FFDD67.svg?style=flat-square)](https://gitmoji.dev/)

**Orbital** (package name `orbital-marketplace`) is a single-page application marketplace that bundles app discovery, downloads, licensing, updates, subscriptions, a card-key (vending) mechanism, and a documentation site into one cohesive SPA experience. The frontend is a Vite-powered React SPA; the backend is a FastAPI service backed by SQLAlchemy 2.0 and SQLite, exposing a RESTful API under `/api/v1`.

## Project status

Orbital has shipped its `1.0.0` milestone. The current release delivers the vending (card-key) mechanism, the documentation site, the FastAPI backend, and the React Router v7 migration. The API and route surface are stable; subsequent work focuses on hardening, tests, and operational tooling.

Useful entry points:

- [Quick start](#quick-start) — run frontend and backend locally
- [API overview](#api-overview) — `/api/v1` endpoint reference
- [Project structure](#project-structure) — repository layout
- [Roadmap](#roadmap) — what is planned next
- [Contributing](CONTRIBUTING.md) — how to open a pull request
- [Changelog](CHANGELOG.md) — release history

## Features

- **App discovery & browse** — featured apps, category filters, search, and sorting on the Discover / Browse pages.
- **App detail** — screenshots, version history, pricing plans, license model, and update notes per app.
- **Subscriptions & licensing** — per-seat subscriptions, perpetual licenses, trial tiers, and an aggregated Subscriptions page.
- **Updates** — channel-aware update tracking with from→to version diffs and release notes.
- **Vending (card-key) mechanism** — batch card generation, automatic issuance on purchase, redemption, and void, backed by a `available → sold → redeemed → void` state machine.
- **Library** — single-user demo library showing owned apps, installed state, and card-key redemption.
- **Documentation site** — in-app docs with categories and sectioned articles (quickstart, app onboarding, API reference, billing, vending, FAQ).
- **SPA architecture** — React Router v7 in library (SPA) mode with animated route transitions via Framer Motion.

## Tech stack

**Frontend**

- React 18
- React Router v7 (library-mode SPA)
- Vite 5
- Tailwind CSS
- Framer Motion

**Backend**

- FastAPI (latest)
- SQLAlchemy 2.0
- Pydantic v2
- SQLite

## Quick start

> Requires Node.js 20+ and Python 3.11+.

### Frontend

```bash
npm install
npm run dev      # http://localhost:5173 (proxies /api → http://localhost:8000)
npm run build    # production build → dist/
```

### Backend

```bash
pip install -r backend/requirements.txt
python -m backend.seed                                    # seed SQLite (idempotent)
uvicorn backend.app.main:app --reload                     # http://localhost:8000
```

The dev server on `:5173` proxies `/api` to the backend on `:8000`, so run both for full-stack development. After seeding, `backend/orbital.db` is created under `backend/`.

### Smoke check

```bash
curl http://localhost:8000/api/v1/health                  # {"status":"ok"}
curl http://localhost:8000/api/v1/apps | head
```

## Project structure

```
orbital/
├── src/                         # React SPA
│   ├── api/                     # fetch clients (apps, docs, library, vending)
│   ├── components/              # shared UI (Layout, Navbar, AppCard, …)
│   ├── context/                 # React contexts (Library, Vending)
│   ├── data/                    # in-memory seed data (apps, vending)
│   ├── pages/                   # route pages (Discover, Browse, Vending, …)
│   ├── App.jsx                  # routes
│   └── main.jsx                 # entry
├── backend/                     # FastAPI service
│   ├── app/
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic v2 schemas
│   │   ├── crud/                # data access (apps, cards, docs, library, orders)
│   │   ├── routers/             # API routers (/api/v1)
│   │   ├── config.py            # DB path, CORS origins
│   │   ├── database.py          # engine + SessionLocal
│   │   └── main.py              # FastAPI app + lifespan + routers
│   ├── seed.py                  # idempotent seed script
│   ├── requirements.txt
│   └── orbital.db               # generated SQLite (gitignored)
├── public/                      # static assets
├── index.html
├── vite.config.js
├── tailwind.config.js
├── Dockerfile                   # multi-stage build (frontend + backend)
├── docker-compose.yml
├── pyproject.toml               # ruff + pytest config
└── .github/                     # workflows, issue templates, CODEOWNERS
```

## API overview

All endpoints are prefixed with `/api/v1`. Errors return `{ "error": "<code>", "message": "<text>" }` with the appropriate HTTP status.

| Method   | Path                          | Description                                            |
|----------|-------------------------------|--------------------------------------------------------|
| `GET`    | `/health`                     | Liveness probe → `{ "status": "ok" }`                  |
| `GET`    | `/apps`                       | List apps (filters: `q`, `category`, `sort`)           |
| `GET`    | `/apps/{app_id}`              | App detail                                             |
| `GET`    | `/docs`                       | Docs categories + index                                |
| `GET`    | `/docs/{slug}`                | Doc article by slug                                    |
| `GET`    | `/cards`                      | List cards (filters: `appId`, `status`)                |
| `POST`   | `/cards/batch`                | Batch-generate cards                                   |
| `POST`   | `/cards/auto-issue`           | Auto-issue a card on purchase (creates an order)       |
| `POST`   | `/cards/redeem`               | Redeem a card by code                                  |
| `POST`   | `/cards/{card_id}/void`       | Void a card                                            |
| `GET`    | `/orders`                     | List orders                                            |
| `POST`   | `/orders`                     | Create an order                                        |
| `GET`    | `/library`                    | Library summary (single-user demo)                     |
| `POST`   | `/library/install`            | Install an app                                         |
| `POST`   | `/library/uninstall`          | Uninstall an app                                       |
| `POST`   | `/library/subscribe`          | Subscribe to a plan                                    |
| `POST`   | `/library/buy-license`        | Buy a perpetual license                                |

Frontend routes map to the feature areas: `/` Discover, `/apps` Browse, `/apps/:id` detail, `/subscriptions`, `/updates`, `/library`, `/vending`, `/docs`, `/docs/:slug`.

## Roadmap

- [ ] Automated test suite for CRUD and the vending state machine
- [ ] Pagination and full-text search on `/apps`
- [ ] Authentication and multi-tenant organizations
- [ ] Webhook delivery for `order.completed` / `card.issued` / `card.redeemed`
- [ ] Production deployment guide (reverse proxy + container orchestration)

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup, branch strategy, commit conventions (gitmoji + Conventional Commits), and the pull-request checklist. All participants are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Found a vulnerability? See [SECURITY.md](SECURITY.md) for the reporting process and supported versions. Please **do not** open a public issue for security reports.

## License

This project is dual-licensed under the **MIT License** and the **Apache License, Version 2.0** — you may use it under either license at your option.

- [MIT License](LICENSE) — `SPDX-License-Identifier: MIT`
- [Apache License 2.0](LICENSE-APACHE) — `SPDX-License-Identifier: Apache-2.0`
- Combined identifier: `MIT OR Apache-2.0`
- See [NOTICE](NOTICE) for third-party dependency attributions.

Copyright (c) 2025 xinvxueyuan (xinvStar.inc).
