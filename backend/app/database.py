from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import DATABASE_URL

# SQLite 需要允许跨线程使用（FastAPI 的依赖注入会在不同线程中打开会话）
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    """FastAPI 依赖：为每个请求提供一个数据库会话并在结束时关闭。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
