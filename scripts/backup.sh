#!/bin/sh
set -eu

destination=${1:-backups}
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$destination"
output="$destination/test_app_$timestamp.dump"

docker compose exec -T db pg_dump \
  --username platform_admin \
  --dbname test_app \
  --format custom \
  --no-owner \
  --file /tmp/test_app.dump
docker compose cp db:/tmp/test_app.dump "$output"
docker compose exec -T db rm -f /tmp/test_app.dump

test -s "$output"
printf '%s\n' "$output"

