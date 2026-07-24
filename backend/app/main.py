"""Orbital API 入口。

- FastAPI 实例
- CORS（允许前端 5173 / 4173）
- lifespan：启动时建表
- /api/v1/health
- 注册 OrbitalError 全局异常处理器 → JSON {error, message}
- 挂载所有 routers
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import CORS_ORIGINS
from .crud import OrbitalError
from .database import engine
from .models import Base
from .routers import apps, cards, docs, library, orders


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时确保表存在（幂等）
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Orbital API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(OrbitalError)
async def orbital_error_handler(request: Request, exc: OrbitalError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.error_code, "message": exc.message},
    )


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}


app.include_router(apps.router)
app.include_router(docs.router)
app.include_router(cards.router)
app.include_router(orders.router)
app.include_router(library.router)
