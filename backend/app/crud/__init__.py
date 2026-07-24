"""Orbital CRUD 层：自定义异常 + 共享工具。

异常由 main.py 的全局 exception handler 统一序列化为
`{"error": <error_code>, "message": <message>}`。
"""

import secrets
from datetime import datetime


# ---------- 异常 ----------


class OrbitalError(Exception):
    status_code: int = 400
    default_error_code: str = "error"

    def __init__(self, message: str = "", error_code: str | None = None):
        self.message = message or self.default_error_code
        self.error_code = error_code or self.default_error_code
        super().__init__(self.message)


class NotFoundError(OrbitalError):
    status_code = 404
    default_error_code = "not_found"


class BadRequestError(OrbitalError):
    status_code = 400
    default_error_code = "bad_request"


class ConflictError(OrbitalError):
    status_code = 409
    default_error_code = "conflict"


class OutOfStockError(OrbitalError):
    status_code = 409
    default_error_code = "out_of_stock"


# ---------- 共享工具 ----------

# 去掉易混淆字符（0/O/1/I/L）的字母表，与前端 vending.js 一致
ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def now_date() -> str:
    """当前日期字符串（与种子数据一致使用 YYYY-MM-DD）。"""
    return datetime.now().strftime("%Y-%m-%d")


def gen_random_code() -> str:
    """生成随机卡密码 ORB-XXXX-XXXX-XXXX（用于批量发卡）。"""
    def block() -> str:
        return "".join(secrets.choice(ALPHABET) for _ in range(4))
    return f"ORB-{block()}-{block()}-{block()}"


def gen_license_key() -> str:
    """生成许可证密钥 LR-XXXX-XXXX-XXXX。"""
    def block() -> str:
        return "".join(secrets.choice(ALPHABET) for _ in range(4))
    return f"LR-{block()}-{block()}-{block()}"
