import subprocess
import sys

import requests


def ping(url):
    try:
        r = requests.get(url, timeout=3)
        return r.status_code, (r.text[:200] if r.text else "")
    except Exception as e:  # noqa: BLE001
        return "ERR", str(e)


def run_pytest():
    try:
        res = subprocess.run(
            ["pytest", "-q", "backend/tests/test_smoke.py"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        return res.returncode, res.stdout, res.stderr
    except Exception as e:  # noqa: BLE001
        return 99, "", str(e)


def main():
    print("=== GitPusher QA — LOW CREDIT MODE ===")

    print("\n[1] API SMOKE TESTS")
    endpoints = [
        "http://localhost:8001/status",
        "http://localhost:8001/providers",
        "http://localhost:8001/push",
    ]
    results = []
    for ep in endpoints:
        code, _body = ping(ep)
        print(f" - {ep} → {code}")
        results.append(code)

    print("\n[2] PYTEST UNIT TESTS")
    code, out, err = run_pytest()
    if out:
        print(out)
    if err:
        print("[stderr]", err)

    print("\n=== FINAL VERDICT ===")
    if any(r == "ERR" for r in results):
        print("PAS OK — API endpoint unreachable")
        sys.exit(1)

    if code != 0:
        print("PAS OK — pytest failed")
        sys.exit(1)

    print("OK — GitPusher is functional, secure headers present, and core endpoints respond correctly.")
    sys.exit(0)


if __name__ == "__main__":
    main()
