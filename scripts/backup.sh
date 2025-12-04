#!/usr/bin/env bash
set -e

# Simple backup skeleton (DB + logs). Adapt DB dump command to your stack.

DATE=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="backups/$DATE"
mkdir -p "$BACKUP_DIR"

echo "Backing up logs..."
cp -r logs "$BACKUP_DIR/logs" 2>/dev/null || true

# Example placeholder for DB dump:
# pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db.sql" || true

echo "Backup complete: $BACKUP_DIR"
