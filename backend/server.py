# ... (imports and previous code remain unchanged)

from real_traffic_monitor import real_traffic_monitor

# ---------- MIDDLEWARES ----------

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.base import BaseHTTPMiddleware
from autofix.ai_autofix import run_autofix


class SEOAEOAutoFixMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        # If SEO or AEO route returns 404 → regenerate
        path = request.url.path
        if (path.startswith("/seo/") or path.startswith("/aeo/")) and response.status_code == 404:
            run_autofix()
        if path == "/sitemap.xml" and response.status_code == 404:
            run_autofix()

        return response


app.add_middleware(SEOAEOAutoFixMiddleware)


# Traffic monitoring middleware
@app.middleware("http")
async def traffic_logging_middleware(request: Request, call_next):
    import time
    from ai_monitor.middleware import detect_ai_source

    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000

    # Try to extract user_id from request state (set by auth layer)
    user_id = getattr(request.state, "user_id", None)

    # Basic IP extraction (x-forwarded-for aware)
    x_forwarded_for = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "unknown"

    user_agent = request.headers.get("user-agent", "")
    ai_source = detect_ai_source(user_agent)

    # Best-effort country detection via ipapi.co (non bloquant)
    country = None
    try:
        # On ignore les IP locales connues
        if client_ip and not (client_ip.startswith("127.") or client_ip.startswith("192.168.") or client_ip == "::1"):
            async with httpx.AsyncClient(timeout=1.5) as client_http:
                res = await client_http.get(f"https://ipapi.co/{client_ip}/json/")
                if res.status_code == 200:
                    data = res.json()
                    country = data.get("country_name") or data.get("country")
    except Exception:
        country = None

    # Log to MongoDB for persistence
    try:
        await db.traffic_logs.insert_one({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": duration_ms,
            "ip": client_ip,
            "user_agent": user_agent[:100],
            "is_ai": ai_source is not None,
            "ai_source": ai_source,
            "country": country,
            "user_id": str(user_id) if user_id is not None else None,
        })

        # Also feed in-memory realtime monitor (doesn't use country yet)
        await real_traffic_monitor.log_request(request, duration_ms, response.status_code)
    except Exception:
        # Logging must never break the main request flow
        pass

    return response


# ... (startup events and the rest of server.py follow)
