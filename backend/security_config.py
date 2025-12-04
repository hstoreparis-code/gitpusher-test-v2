import os

MAX_UPLOAD_SIZE_MB = int(os.getenv("GITPUSHER_MAX_UPLOAD_MB", "50"))
ALLOWED_UPLOAD_EXTENSIONS = {".zip"}
MASKED_TOKEN_REPLACEMENT = "***TOKEN***"

ADMIN_ALLOWED_IPS = os.getenv("GITPUSHER_ADMIN_ALLOWED_IPS", "")  # "1.2.3.4,5.6.7.8"
ADMIN_OTP = os.getenv("GITPUSHER_ADMIN_OTP", "")


def is_secure_env() -> bool:
    return os.getenv("GITPUSHER_ENV", "dev") in ("staging", "prod")


def get_admin_allowed_ips():
    if not ADMIN_ALLOWED_IPS:
        return []
    return [ip.strip() for ip in ADMIN_ALLOWED_IPS.split(",") if ip.strip()]


def mask_token(value: str) -> str:
    if not value:
        return value
    if len(value) <= 8:
        return MASKED_TOKEN_REPLACEMENT
    return value[:4] + MASKED_TOKEN_REPLACEMENT + value[-4:]
