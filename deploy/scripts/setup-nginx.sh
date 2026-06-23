#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/scripts/setup-nginx.sh"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE="$ROOT_DIR/deploy/nginx/childcare.conf"
TARGET="/etc/nginx/sites-available/childcare.conf"
ENABLED="/etc/nginx/sites-enabled/childcare.conf"

if [[ ! -f "$SOURCE" ]]; then
  echo "Missing nginx template: $SOURCE"
  exit 1
fi

echo "Installing $TARGET"
cp "$SOURCE" "$TARGET"

if [[ ! -L "$ENABLED" ]]; then
  ln -s "$TARGET" "$ENABLED"
  echo "Enabled site: $ENABLED"
fi

echo "Testing nginx configuration..."
nginx -t

echo
echo "Next steps:"
echo "  1. Edit $TARGET — replace childcare.example.com with your domains"
echo "  2. Match upstream ports to CHILDCARE_*_PORT in your .env"
echo "  3. Obtain SSL certs:"
echo "     certbot certonly --nginx -d your-domain.com -d coordinator.your-domain.com -d api.your-domain.com"
echo "  4. Reload nginx: systemctl reload nginx"
