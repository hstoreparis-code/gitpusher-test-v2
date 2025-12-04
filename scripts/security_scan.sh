#!/usr/bin/env bash
set -e

echo "[Security] Backend Python dependencies SAST (bandit)..."
if command -v bandit >/dev/null 2>&1; then
  bandit -q -r backend || true
else
  echo "bandit not installed. Skipping."
fi

echo "[Security] Python dependency vulnerability scan (safety)..."
if command -v safety >/dev/null 2>&1; then
  safety check || true
else
  echo "safety not installed. Skipping."
fi

echo "[Security] Frontend dependency scan (npm audit)..."
if command -v npm >/dev/null 2>&1; then
  (cd frontend && npm audit --production || true)
else
  echo "npm not installed. Skipping."
fi

echo "[Security] Light DAST placeholder (no external tools)..."
# Placeholder for future OWASP ZAP / DAST integration
echo "DAST placeholder done."
