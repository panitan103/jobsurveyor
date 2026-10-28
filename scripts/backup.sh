#!/usr/bin/env bash
# Consistent SQLite snapshot of the running container, copied to ./backups.
# Usage: ./scripts/backup.sh
# Cron:  15 3 * * * cd /home/sefree/jobsurveyor && ./scripts/backup.sh >> /var/log/jobsurveyor-backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."

STAMP="$(date +%Y-%m-%d-%H%M)"
NAME="jobsurveyor-${STAMP}.db"
mkdir -p backups

# VACUUM INTO creates a consistent copy even while WAL is active.
docker compose exec -T app node --input-type=module -e \
  "import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync('/data/jobsurveyor.db'); db.exec(\"VACUUM INTO '/data/${NAME}'\");"

docker compose cp "app:/data/${NAME}" "./backups/${NAME}"
docker compose exec -T app rm -f "/data/${NAME}"

# Keep 14 days locally.
find ./backups -name 'jobsurveyor-*.db' -mtime +14 -delete

echo "backup written: backups/${NAME} ($(du -h "./backups/${NAME}" | cut -f1))"
