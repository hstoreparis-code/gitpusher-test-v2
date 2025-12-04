import time
from typing import Dict, Tuple

# key -> (count, window_start_ts)
_RATE_LIMIT_STORE: Dict[str, Tuple[int, float]] = {}
_LOCKOUT_STORE: Dict[str, float] = {}

RATE_LIMIT_WINDOW_SEC = 60
RATE_LIMIT_MAX_REQUESTS = 30  # default per IP/path per minute

LOGIN_MAX_ATTEMPTS = 5
LOGIN_LOCKOUT_SEC = 15 * 60  # 15 minutes


def _now() -> float:
    return time.time()


def check_rate_limit(key: str, max_requests: int = RATE_LIMIT_MAX_REQUESTS, window_sec: int = RATE_LIMIT_WINDOW_SEC):
    now = _now()
    if key in _RATE_LIMIT_STORE:
        count, start = _RATE_LIMIT_STORE[key]
        if now - start > window_sec:
            _RATE_LIMIT_STORE[key] = (1, now)
            return
        if count >= max_requests:
            raise Exception("rate_limited")
        _RATE_LIMIT_STORE[key] = (count + 1, start)
    else:
        _RATE_LIMIT_STORE[key] = (1, now)


def record_login_failure(identity: str):
    now = _now()
    count, start = _RATE_LIMIT_STORE.get(f"login:{identity}", (0, now))
    if now - start > RATE_LIMIT_WINDOW_SEC:
        count = 0
        start = now
    count += 1
    _RATE_LIMIT_STORE[f"login:{identity}"] = (count, start)
    if count >= LOGIN_MAX_ATTEMPTS:
        _LOCKOUT_STORE[identity] = now + LOGIN_LOCKOUT_SEC


def check_login_lockout(identity: str) -> bool:
    until = _LOCKOUT_STORE.get(identity)
    if not until:
        return False
    if _now() > until:
        _LOCKOUT_STORE.pop(identity, None)
        return False
    return True
