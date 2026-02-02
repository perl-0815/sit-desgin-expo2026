#!/usr/bin/env bash
# Local Postgres helper for dev/testing (Docker required).
set -euo pipefail

NAME="sit-pg"
PORT="5432"
USER="sit"
PASS="sitpass"
DB="sit_design_expo"

case "${1:-}" in
  start)
    if docker ps -a --format '{{.Names}}' | grep -qx "$NAME"; then
      docker start "$NAME" >/dev/null
      echo "Started existing container: $NAME"
      exit 0
    fi

    docker run --name "$NAME" \
      -e POSTGRES_USER="$USER" \
      -e POSTGRES_PASSWORD="$PASS" \
      -e POSTGRES_DB="$DB" \
      -p "$PORT:5432" \
      -d postgres:16 >/dev/null
    echo "Created and started container: $NAME"
    ;;
  stop)
    if docker ps --format '{{.Names}}' | grep -qx "$NAME"; then
      docker stop "$NAME" >/dev/null
      echo "Stopped container: $NAME"
    else
      echo "Container not running: $NAME"
    fi
    ;;
  status)
    docker ps -a --filter "name=$NAME"
    ;;
  logs)
    docker logs "$NAME"
    ;;
  *)
    echo "Usage: $0 {start|stop|status|logs}"
    exit 1
    ;;
esac
