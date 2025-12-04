import logging
import os

from security_config import mask_token
from utils.mailer import send_security_webhook

LOG_LEVEL = os.getenv("GITPUSHER_LOG_LEVEL", "INFO").upper()
LOG_FILE_APP = os.getenv("GITPUSHER_LOG_FILE_APP", "logs/gitpusher.log")
LOG_FILE_SECURITY = os.getenv("GITPUSHER_LOG_FILE_SECURITY", "logs/security.log")

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.FileHandler(LOG_FILE_APP), logging.StreamHandler()],
)

logger_app = logging.getLogger("gitpusher")
logger_sec = logging.getLogger("gitpusher.security")
sec_handler = logging.FileHandler(LOG_FILE_SECURITY)
logger_sec.addHandler(sec_handler)


def log_info(msg: str, **kwargs):
    safe_kwargs = {k: (mask_token(v) if "token" in k.lower() else v) for k, v in kwargs.items()}
    logger_app.info("%s | %s", msg, safe_kwargs)


def log_error(msg: str, **kwargs):
    safe_kwargs = {k: (mask_token(v) if "token" in k.lower() else v) for k, v in kwargs.items()}
    logger_app.error("%s | %s", msg, safe_kwargs)


def log_security(msg: str, **kwargs):
    safe_kwargs = {k: (mask_token(v) if "token" in k.lower() else v) for k, v in kwargs.items()}
    logger_sec.warning("%s | %s", msg, safe_kwargs)
    # basic webhook alert
    send_security_webhook({"message": msg, "meta": safe_kwargs})
