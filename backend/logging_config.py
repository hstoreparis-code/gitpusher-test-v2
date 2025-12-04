import logging
import os

from security_config import mask_token

LOG_LEVEL = os.getenv("GITPUSHER_LOG_LEVEL", "INFO").upper()
LOG_FILE = os.getenv("GITPUSHER_LOG_FILE", "logs/gitpusher.log")

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler()],
)

logger = logging.getLogger("gitpusher")


def log_info(msg: str, **kwargs):
    safe_kwargs = {k: (mask_token(v) if isinstance(v, str) and "token" in k.lower() else v) for k, v in kwargs.items()}
    logger.info("%s | %s", msg, safe_kwargs)


def log_error(msg: str, **kwargs):
    safe_kwargs = {k: (mask_token(v) if isinstance(v, str) and "token" in k.lower() else v) for k, v in kwargs.items()}
    logger.error("%s | %s", msg, safe_kwargs)
