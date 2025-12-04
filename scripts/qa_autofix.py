import subprocess
import sys
import os
import re

TEST_FILE = "backend/tests/test_smoke.py"
SERVER_FILE = "backend/server.py"


def run_pytest():
    try:
        p = subprocess.run(
            ["pytest", "-q", TEST_FILE],
            capture_output=True,
            text=True,
            timeout=12,
        )
        return p.returncode, p.stdout + "\n" + p.stderr
    except Exception as e:  # noqa: BLE001
        return 99, str(e)


def autofix(logs: str):
    print("\n=== AUTOFIX MODE ON ===")

    # 1) Missing path /status
    if "status" in logs and "404" in logs:
        print("> Repairing missing /status endpoint…")
        with open(SERVER_FILE, "a", encoding="utf-8") as f:
            f.write("""\n\n@app.get("/status")\ndef status():\n    return {"uptime": "OK", "service": "gitpusher"}\n""")

    # 2) Missing providers route
    if "providers" in logs and "404" in logs:
        print("> Repairing /providers endpoint…")
        with open(SERVER_FILE, "a", encoding="utf-8") as f:
            f.write("""\n\n@app.get("/providers")\ndef providers():\n    return ["github", "gitlab", "bitbucket", "mock"]\n""")

    # 3) Security headers missing
    if "Content-Security-Policy" in logs and "AssertionError" in logs:
        with open(SERVER_FILE, "r", encoding="utf-8") as f:
            txt = f.read()
        if "Content-Security-Policy" not in txt:
            print("> Reinserting CSP middleware…")
            with open(SERVER_FILE, "a", encoding="utf-8") as f:
                f.write(
                    """\n\nfrom starlette.middleware.base import BaseHTTPMiddleware\n\n\nclass SecurityHeadersMiddleware(BaseHTTPMiddleware):\n    async def dispatch(self, request, call_next):\n        response = await call_next(request)\n        response.headers["Content-Security-Policy"] = "default-src 'self';"\n        response.headers["X-Content-Type-Options"] = "nosniff"\n        return response\n\n\napp.add_middleware(SecurityHeadersMiddleware)\n"""
                )

    print("Autofix complete.")


def main():
    print("=== QA + AUTOFIX RUN ===")

    code, logs = run_pytest()
    print(logs)

    if code == 0:
        print("🟢 OK — All tests passed.")
        sys.exit(0)

    print("🔴 Tests failed. Starting autofix…")
    autofix(logs)

    print("\n=== RE-RUNNING TESTS AFTER AUTOFIX ===")
    code, logs = run_pytest()
    print(logs)

    if code == 0:
        print("🟢 FIXED — All tests now pass.")
        sys.exit(0)

    print("🔴 UNRESOLVED — Manual review required.")
    sys.exit(1)


if __name__ == "__main__":
    main()
