#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="$BACKUP_DIR/$TIMESTAMP"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

mkdir -p "$TARGET"

echo "Backing up PostgreSQL..."
docker compose --env-file "$ENV_FILE" exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-childcare}" -d "${POSTGRES_DB:-childcare}" -Fc \
  > "$TARGET/postgres.dump"

echo "Backing up uploads volume..."
docker compose --env-file "$ENV_FILE" run --rm \
  -v childcare_uploads_data:/data:ro \
  -v "$TARGET:/backup" \
  alpine sh -c 'cd /data && tar czf /backup/uploads.tar.gz .'

cat > "$TARGET/README.txt" <<EOF
BabyCare backup created at $TIMESTAMP
Restore postgres: docker compose exec -T postgres pg_restore -U ${POSTGRES_USER:-childcare} -d ${POSTGRES_DB:-childcare} --clean --if-exists < postgres.dump
Restore uploads: extract uploads.tar.gz into the uploads_data volume
EOF

echo "Backup saved to $TARGET"
