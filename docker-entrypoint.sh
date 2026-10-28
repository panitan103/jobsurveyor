#!/bin/sh
set -e

mkdir -p /data
chown -R nextjs:nodejs /data 2>/dev/null || true

exec su-exec nextjs "$@"
