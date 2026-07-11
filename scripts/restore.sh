#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE="${1:-}"
DB_NAME="${DB_NAME:-employepro}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file.dump>"
  echo ""
  echo "Available backups:"
  ls -lh ./backups/*.dump 2>/dev/null || echo "  No backups found in ./backups/"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "File not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will OVERWRITE the database ${DB_NAME}@${DB_HOST}:${DB_PORT}"
read -rp "Are you sure? (y/N) " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Aborted."
  exit 0
fi

echo "Restoring from $BACKUP_FILE ..."

PGPASSWORD="${DB_PASSWORD:-}" pg_restore \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --clean \
  --if-exists \
  --no-owner \
  "$BACKUP_FILE"

echo "Restore complete."
