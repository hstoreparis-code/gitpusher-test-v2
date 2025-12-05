#!/bin/bash
set -e

LOG_DIR="./app/logs"
LOG_FILE="$LOG_DIR/ai_ping_log.json"

echo "[INIT] Creating AI ping log directory…"
mkdir -p "$LOG_DIR"

echo "[INIT] Initializing ai_ping_log.json…"
echo "[]" > "$LOG_FILE"

echo "[INIT] Permissions fix…"
chmod 777 "$LOG_DIR"
chmod 666 "$LOG_FILE"

echo "[INIT COMPLETED] AI log initialized at $LOG_FILE."
