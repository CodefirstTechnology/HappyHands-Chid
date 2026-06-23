# BabyCare VPS Production Deployment

Deploy BabyCare on a VPS that **already runs another application**. The stack uses Docker Compose with **localhost-only ports** so host nginx can reverse-proxy alongside your existing site.

## Architecture

```
Internet
   │
   ▼
Host nginx (your VPS)
   ├── existing-app.conf          → your current app (unchanged)
   └── childcare.conf             → BabyCare (new)
           ├── childcare.example.com        → website :15001
           ├── coordinator.childcare...     → coordinator portal :15002
           └── api.childcare.example.com    → API :15000

Docker Compose (localhost bindings only)
   postgres · redis · api · website · coordinator-portal
```

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Ubuntu/Debian VPS | 2 GB+ RAM recommended |
| Docker + Docker Compose v2 | `docker compose version` |
| Host nginx | Already running for your other app |
| DNS | Three A records pointing to the VPS |
| Ports 15000–15002 free | Or change `CHILDCARE_*_PORT` in `.env` |

## Step 1 — Clone and configure

```bash
git clone <repo-url> childcare
cd childcare
cp .env.production.example .env
nano .env   # fill every secret and domain
```

### Required `.env` values

| Variable | Example |
|----------|---------|
| `POSTGRES_PASSWORD` | Strong random password |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | 32+ random characters each |
| `VITE_API_BASE_URL` | `https://api.yourdomain.com/api/v1` |
| `VITE_API_HOST` | `https://api.yourdomain.com` |
| `VITE_COORDINATOR_PORTAL_URL` | `https://coordinator.yourdomain.com` |
| `CLIENT_URL` | `https://yourdomain.com,https://coordinator.yourdomain.com` |
| `SMS_PROVIDER` | `msg91` (production) |
| `SMS_ALLOW_DEV_OTP` | `false` |

If ports 15000–15002 conflict with your existing app, change all three `CHILDCARE_*_PORT` values and update the matching upstreams in `deploy/nginx/childcare.conf`.

## Step 2 — Check ports

```bash
bash deploy/scripts/check-ports.sh
```

## Step 3 — Deploy Docker stack

```bash
bash deploy/scripts/deploy.sh
```

First deploy only — seed roles and default admin/coordinator accounts:

```bash
docker compose --env-file .env exec api node prisma/seed.js
```

**Change default seeded passwords before going live.**

Verify locally on the VPS:

```bash
curl http://127.0.0.1:15000/health
curl -I http://127.0.0.1:15001/
curl -I http://127.0.0.1:15002/
```

## Step 4 — Host nginx (alongside existing app)

Your existing nginx config stays untouched. Add BabyCare as a separate site:

```bash
sudo bash deploy/scripts/setup-nginx.sh
sudo nano /etc/nginx/sites-available/childcare.conf
```

Replace `childcare.example.com` with your real domains in:

- `server_name` directives
- SSL certificate paths

Ensure upstream ports match `.env`:

```nginx
upstream childcare_api       { server 127.0.0.1:15000; }
upstream childcare_website   { server 127.0.0.1:15001; }
upstream childcare_coordinator { server 127.0.0.1:15002; }
```

Obtain SSL certificates (first time):

```bash
sudo certbot certonly --nginx \
  -d yourdomain.com \
  -d coordinator.yourdomain.com \
  -d api.yourdomain.com
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5 — DNS records

| Host | Purpose |
|------|---------|
| `yourdomain.com` | Marketing website |
| `coordinator.yourdomain.com` | Coordinator portal |
| `api.yourdomain.com` | REST API + `/uploads/` |

## Step 6 — Mobile apps (EAS)

Mobile apps are **not** containerized. Before release builds, set:

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
```

Build via EAS from `BabyCare/babycare-app` and `BabyCarePro/babycare-pro-app`.

Update store links in `.env` (`VITE_PLAY_STORE_*`, `VITE_APP_STORE_*`) and redeploy the website container to show them on the landing page.

## Operations

### View logs

```bash
docker compose --env-file .env logs -f api
docker compose --env-file .env logs -f coordinator-portal
```

### Update after code changes

```bash
git pull
bash deploy/scripts/deploy.sh
```

Frontends bake `VITE_*` values at build time — changing API URLs requires `--build`.

### Backup

```bash
bash deploy/scripts/backup.sh
```

Backups are saved to `./backups/<timestamp>/` (postgres dump + uploads archive).

### Restart a single service

```bash
docker compose --env-file .env restart api
```

## Production checklist

- [ ] Strong `POSTGRES_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- [ ] `SMS_ALLOW_DEV_OTP=false` and real SMS provider configured
- [ ] Google Maps keys restricted by API + app package names
- [ ] `CLIENT_URL` lists only real web origins (no `*`)
- [ ] SSL certificates installed and auto-renewal enabled
- [ ] Default seed passwords changed
- [ ] Cron or systemd timer for `deploy/scripts/backup.sh`
- [ ] Firewall allows 80/443 only (Docker ports stay on 127.0.0.1)

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `docker compose up` fails on website | Ensure `ChildCare_website/` exists and run deploy with `--build` |
| API unhealthy | `docker compose logs api` — usually DB password or migration error |
| 502 from nginx | Confirm containers are up and ports match nginx upstreams |
| CORS errors in browser | Add the exact origin to `CLIENT_URL` in `.env`, restart API |
| Uploads 404 | API serves `/uploads/` — ensure nginx proxies to `childcare_api` |
