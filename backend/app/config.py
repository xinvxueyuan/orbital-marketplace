from pathlib import Path

# backend/ 目录（config.py 位于 backend/app/config.py）
BASE_DIR = Path(__file__).resolve().parent.parent

# SQLite 数据库文件位置：backend/orbital.db
DB_PATH = BASE_DIR / "orbital.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# 前端开发 / 预览服务器来源
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
]

# 单用户演示用的固定 userId
DEMO_USER_ID = "demo"
