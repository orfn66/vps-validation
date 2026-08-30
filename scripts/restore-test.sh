#!/bin/sh
set -eu

if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo "Usage: $0 backups/test_app_<timestamp>.dump" >&2
  exit 2
fi

restore_database="test_app_restore_$(date -u +%Y%m%dT%H%M%SZ)"
docker compose cp "$1" db:/tmp/restore.dump
docker compose exec -T db createdb --username platform_admin "$restore_database"
docker compose exec -T db pg_restore \
  --username platform_admin \
  --dbname "$restore_database" \
  --no-owner \
  --exit-on-error \
  /tmp/restore.dump
docker compose exec -T db psql \
  --username platform_admin \
  --dbname "$restore_database" \
  --tuples-only \
  --command "SELECT count(*) FROM notes;"
docker compose exec -T db rm -f /tmp/restore.dump

printf 'Restored database retained for verification: %s\n' "$restore_database"
printf 'Do not delete it without explicit approval.\n'

