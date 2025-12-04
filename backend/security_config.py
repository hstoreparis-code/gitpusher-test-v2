import os

MAX_UPLOAD_SIZE_MB = int(os.getenv("GITPUSHER_MAX_UPLOAD_MB", "50"))
ALLOWED_UPLOAD_EXTENSIONS = {".zip"}
MASKED_TOKEN_REPLACEMENT = "***TOKEN***"


def is_secure_env() -> bool:
    return os.getenv("GITPUSHER_ENV", "dev") in ("staging", "prod")


def mask_token(value: str) -> str:
    if not value:
        return value
    if len(value) <= 8:
        return MASKED_TOKEN_REPLACEMENT
    return value[:4] + MASKED_TOKEN_REPLACEMENT + value[-4:]
