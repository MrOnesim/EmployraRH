#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${DB_NAME:-employepro}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.dump"
LOG_PATH="${BACKUP_DIR}/backup.log"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup: ${DB_NAME}@${DB_HOST}:${DB_PORT}" | tee -a "$LOG_PATH"

PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --format=custom \
  --file="$BACKUP_PATH" 2>>"$LOG_PATH"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup saved: ${BACKUP_PATH}" | tee -a "$LOG_PATH"

find "$BACKUP_DIR" -name "${DB_NAME}_*.dump" -mtime "+${RETENTION_DAYS}" -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rotated backups older than ${RETENTION_DAYS} days." | tee -a "$LOG_PATH"
