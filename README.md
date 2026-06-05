# 🔥 LIFELINE

A single-screen, sustainable productivity dashboard. **One owner writes, everyone reads.**
Built for consistency over intensity — low friction, visual-first, a little funny. *Bas chalte raho.* 🏍️

- **Public view** (anyone): the dashboard, read-only. Grid, streak, level, XP, month %, goals, next reward. No money.
- **Owner view** (after login at `/log`): the same dashboard, fully interactive. Tap tiles, run Survival Mode, edit goals/rewards/settings, enter money, share a card.

The server is authoritative for every computed number (score %, XP, level, streaks). The client only sends raw taps, so a viewer can never fake or edit anything — writes require the owner session.

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + TypeScript + Tailwind, built with Vite |
| Backend | Node + Fastify + TypeScript |
| Database | SQLite (`better-sqlite3`) — one file, no DB server |
| Auth | one owner password (bcrypt hash in env) → signed httpOnly JWT cookie |
| State | TanStack Query (server-authoritative) |

It's an npm-workspaces monorepo: [`shared/`](shared) (types + scoring constants, the single source of truth), [`server/`](server) (API + the domain "heart"), [`client/`](client) (the SPA).

## Quick start (development)

```bash
npm install
cp .env.example .env
npm run hash -- 'your-password'     # paste the printed line into .env
# also set SESSION_SECRET in .env to a long random string
npm run dev                          # Fastify on :3000, Vite on :5173
```

Open <http://localhost:5173>. The Vite dev server proxies `/api` to Fastify, so the session cookie works on one origin (no CORS). Log in at <http://localhost:5173/log>.

## Production

```bash
npm run build      # builds shared → server → client (client/dist)
npm start          # node server/dist/index.js — serves the API AND the SPA on $PORT
```

In production the Fastify server serves the built React app from `client/dist` and falls back to `index.html` for client-side routes — a **single process, single port, single origin**.

### Deploy (rahulc.xyz)

> **Note:** this app keeps state in a SQLite **file**, so it needs a host with a
> **persistent disk** — a normal server or container host, *not* a serverless
> platform like Vercel/Netlify (their filesystems are ephemeral and would wipe
> the DB on every cold start). The two easiest options are below; both keep the
> single-origin model so the session cookie just works.

#### Option 1 — Fly.io (recommended)

Persistent volume + custom domain + free TLS, in Mumbai. Uses the [`Dockerfile`](Dockerfile) and [`fly.toml`](fly.toml).

```bash
# one-time
fly auth login
fly launch --no-deploy                 # claim an app name (keep the generated name or edit fly.toml)
fly volumes create lifeline_data --size 1 --region bom

# secrets (never put these in fly.toml)
fly secrets set \
  OWNER_PASSWORD_HASH="$(npm run --silent hash -- 'your-password' | grep -oP '(?<=OWNER_PASSWORD_HASH=).*')" \
  SESSION_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"

fly deploy

# custom domain
fly certs add rahulc.xyz                # then add the shown A/AAAA (or CNAME) records at your DNS
```

`fly.toml` already sets `DATABASE_PATH=/data/lifeline.db` (on the volume), `COOKIE_SECURE=true`, and `OWNER_TZ=Asia/Kolkata`.

#### Option 2 — Railway (dashboard, no CLI)

1. **New Project → Deploy from GitHub repo.** Railway builds the [`Dockerfile`](Dockerfile) automatically.
2. Add a **Volume**, mount path `/data`.
3. **Variables:** `DATABASE_PATH=/data/lifeline.db`, `COOKIE_SECURE=true`, `OWNER_TZ=Asia/Kolkata`, `SESSION_SECRET=<random>`, `OWNER_PASSWORD_HASH=<from npm run hash>`.
4. **Settings → Networking → Generate Domain**, then add `rahulc.xyz` as a custom domain and point your DNS at it.

(Render and Fly work the same way — any host that runs the Dockerfile with a disk mounted at `/data`.)

#### Option 3 — your own VPS

`npm ci && npm run build && npm start` under `pm2`/`systemd`, behind a reverse proxy that terminates HTTPS — [Caddy](https://caddyserver.com) gives automatic Let's Encrypt certs:

```caddy
rahulc.xyz {
    reverse_proxy localhost:3000
}
```

In all cases `COOKIE_SECURE=true` marks the session cookie `Secure` (HTTPS-only).

## Environment variables

See [`.env.example`](.env.example). All are validated on boot.

| Var | Purpose |
|-----|---------|
| `OWNER_PASSWORD_HASH` | bcrypt hash of the owner password (`npm run hash -- '<pw>'`) |
| `SESSION_SECRET` | secret signing the JWT session cookie |
| `PORT` | server port (default 3000) |
| `DATABASE_PATH` | SQLite file path (default `./data/lifeline.db`) |
| `COOKIE_SECURE` | `true` in production (HTTPS) |
| `OWNER_TZ` | timezone for the "today" boundary (default `Asia/Kolkata`) |

## Backups

SQLite is the source of truth — back up the **one file**:

```bash
# nightly cron — WAL-checkpoint into a timestamped copy
sqlite3 data/lifeline.db ".backup 'backups/lifeline-$(date +%F).db'"
```

The owner view also has **Export / Import JSON** buttons (📤 / 📥 in the toolbar) for manual backups and moving hosts.

## How the mechanics work

- **Daily score** (spec §5a): each tile = points, Work is 2× (the keystone), a doom-scroll slip subtracts but the day floors at 0. Normalized to a %.
- **Streak** (§5b): a day counts if you hit a low minimum (work + one other tile) **or** use Survival Mode. Missed days auto-spend one of **2 free freezes/month** before the streak ever breaks; freezes refill each month. Today stays "pending" until you lock in, so the flame never drops mid-day.
- **XP & levels** (§5c): derived deterministically from full history (editing a past day re-computes cleanly, no double-counted bonuses). 10 Indian-flavored levels from 🛋️ Aalsi Aatma to 🦁 Anushasan Avatar.
- **Month % & rewards** (§5e–f): average over logged days; bands at 70% ("on track") and 90% ("bonus"). Rewards unlock **once, permanently**.

All of this lives in pure, unit-tested functions under [`server/src/domain/`](server/src/domain).

## Tests

```bash
npm test     # vitest — scoring, streak/freeze, XP idempotency, month bands, rewards, money-leak guard
```

---

*Build it light. Build it kind. Consistency over intensity. 🏍️*
