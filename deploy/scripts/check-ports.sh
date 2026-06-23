#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source <(grep -E '^CHILDCARE_(API|WEBSITE|COORDINATOR)_PORT=' "$ENV_FILE" | sed 's/^/export /')
fi

PORTS=(
  "${CHILDCARE_API_PORT:-15000}"
  "${CHILDCARE_WEBSITE_PORT:-15001}"
  "${CHILDCARE_COORDINATOR_PORT:-15002}"
)

echo "Checking localhost ports for BabyCare stack..."
CONFLICT=0

for port in "${PORTS[@]}"; do
  if command -v ss >/dev/null 2>&1; then
    if ss -ltn "( sport = :$port )" 2>/dev/null | grep -q ":$port"; then
      echo "  CONFLICT: port $port is already in use"
      CONFLICT=1
    else
      echo "  OK: port $port is free"
    fi
  elif command -v netstat >/dev/null 2>&1; then
    if netstat -ltn 2>/dev/null | awk '{print $4}' | grep -q ":$port$"; then
      echo "  CONFLICT: port $port is already in use"
      CONFLICT=1
    else
      echo "  OK: port $port is free"
    fi
  else
    echo "  SKIP: install ss or netstat to check port $port"
  fi
done

if [[ "$CONFLICT" -eq 1 ]]; then
  echo
  echo "Change CHILDCARE_*_PORT values in .env and matching upstreams in deploy/nginx/childcare.conf"
  exit 1
fi

echo "All BabyCare ports are available."
