# ── Stage 1: 构建前端 ─────────────────────────────────────────
FROM node:20-slim AS frontend

WORKDIR /app

# 先拷贝依赖描述以利用缓存
COPY package.json package-lock.json* ./
RUN npm ci

# 拷贝源码并构建
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

# ── Stage 2: 构建后端镜像 ─────────────────────────────────────
FROM python:3.11-slim AS runtime

# 防止 Python 写入 .pyc 与缓冲日志
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# 安装后端依赖（利用缓存）
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# 拷贝后端源码
COPY backend ./backend

# 从 stage 1 拷贝前端构建产物（可由反向代理直接托管）
COPY --from=frontend /app/dist ./dist

EXPOSE 8000

# 启动前写入种子数据（幂等），再以 uvicorn 提供服务
CMD ["sh", "-c", "python -m backend.seed && uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"]
