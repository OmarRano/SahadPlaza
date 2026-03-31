# Sahad Stores — Complete Startup Guide
# ═══════════════════════════════════════════════════════════════════════════════
#
#  Architecture: Single-process fullstack
#
#  ONE terminal, ONE command (pnpm dev) starts EVERYTHING:
#  ┌─────────────────────────────────────────────────────────────┐
#  │  Express server (port 3000)                                 │
#  │    ├─  /api/trpc  ──►  tRPC router (all backend API)        │
#  │    └─  /*         ──►  Vite dev server (React frontend)     │
#  └─────────────────────────────────────────────────────────────┘
#
#  There is NO separate "frontend" start command.
#  Vite is embedded inside Express as middleware.
# ═══════════════════════════════════════════════════════════════════════════════

## Directory Layout

```
sahad-stores/                   ← YOU RUN ALL COMMANDS FROM HERE
│
├── package.json                ← root package (all deps live here)
├── vite.config.ts              ← Vite config (root = client/)
├── tsconfig.json               ← root TypeScript config
├── .env                        ← environment variables (create this)
│
├── client/                     ← React frontend source
│   ├── index.html
│   └── src/
│       ├── App.tsx             ← router (all page routes)
│       ├── main.tsx            ← tRPC + React entry point
│       └── pages/              ← buyer/ admin/ manager/ delivery/ affiliate/ developer/
│
├── server/                     ← Express + tRPC backend
│   ├── _core/
│   │   └── index.ts            ← SERVER ENTRY POINT  ← pnpm dev runs this
│   ├── routers.ts              ← all tRPC API procedures
│   ├── auth.ts                 ← login / signup / logout
│   ├── mongodb.ts              ← DB connection + staff seed
│   └── models/                 ← User, Product, Order, etc.
│
└── shared/                     ← constants shared by client + server
```

---

## Prerequisites

Install these before anything else:

| Tool      | Version  | Install command                          |
|-----------|----------|------------------------------------------|
| Node.js   | ≥ 18     | https://nodejs.org  or  `nvm install 20` |
| pnpm      | ≥ 9      | `npm install -g pnpm`                    |
| MongoDB   | ≥ 6      | See options below                        |

### MongoDB options (pick one)

**Option A — Docker (recommended for local dev):**
```bash
docker run -d \
  --name sahad-mongo \
  -p 27017:27017 \
  mongo:7
```

**Option B — MongoDB Atlas (free cloud tier):**
1. Go to https://cloud.mongodb.com and create a free cluster
2. Get your connection string: `mongodb+srv://USER:PASS@cluster.mongodb.net/`
3. Use that as `MONGODB_URI` in your `.env`

**Option C — Local MongoDB install:**
```bash
# macOS
brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community

# Ubuntu / Debian
sudo apt-get install -y mongodb && sudo systemctl start mongod

# Windows
# Download installer from https://www.mongodb.com/try/download/community
```

---

## Step-by-Step Setup

### Step 1 — Navigate to the project root

```bash
cd sahad-stores        # ← This is where package.json lives
                       # ← ALL commands below run from here
```

### Step 2 — Create the .env file

Create a file called `.env` in the project root (same folder as `package.json`):

```env
# ── Database ──────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/sahad_stores
MONGODB_DB_NAME=sahad_stores

# ── JWT Session ───────────────────────────────────────────────
# Change this to a random 32+ character string before deploying
JWT_SECRET=sahad-stores-secret-key-minimum-32-characters-2026

# ── Server ────────────────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── App URL (for affiliate referral links) ────────────────────
VITE_APP_URL=http://localhost:3000

# ── Analytics (optional — leave blank) ───────────────────────
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

### Step 3 — Install dependencies

```bash
# Run from: sahad-stores/   (the project root)
pnpm install
```

This installs ALL dependencies for both frontend and backend.
Do NOT run `pnpm install` inside `client/` or `server/` separately.

### Step 4 — Start the development server

```bash
# Run from: sahad-stores/   (the project root)
pnpm dev
```

That's it. One command starts everything. You will see:

```
[MongoDB] Connected successfully
[MongoDB] Staff accounts seeded

🛍️  Sahad Stores → http://localhost:3000/
📦  API         → http://localhost:3000/api/trpc

👤  Staff Login Credentials:
   admin       admin@sahadstores.com      Admin@123456
   manager     manager@sahadstores.com    Manager@123456
   delivery    delivery@sahadstores.com   Delivery@123456
   developer   developer@sahadstores.com  Developer@123456
```

Open your browser at: **http://localhost:3000**

---

## What `pnpm dev` Does Internally

```
pnpm dev
  └── tsx watch server/_core/index.ts
        ├── connects MongoDB  (server/mongodb.ts)
        ├── seeds staff accounts  (admin / manager / delivery / developer)
        ├── mounts tRPC at  /api/trpc
        └── mounts Vite dev server at  /*
              ├── serves client/index.html
              ├── compiles client/src/  on the fly
              └── enables Hot Module Replacement (HMR)
```

There is NO separate `npm start` or `vite` command needed.
`tsx watch` watches BOTH `server/` and `client/` for changes.

---

## All Available Commands

Run all of these from the **project root** (`sahad-stores/`):

```bash
pnpm dev          # Start dev server (fullstack, hot-reload)
pnpm build        # Build for production (outputs to dist/)
pnpm start        # Run the production build
pnpm check        # TypeScript type-check only (no emit)
pnpm test         # Run Vitest unit tests
pnpm format       # Format all files with Prettier
```

---

## Login Credentials

### Staff Accounts (use "Staff Portal" tab at /auth)

| Role      | Email                        | Password         | Redirects to  |
|-----------|------------------------------|------------------|---------------|
| Admin     | admin@sahadstores.com        | Admin@123456     | /admin        |
| Manager   | manager@sahadstores.com      | Manager@123456   | /manager      |
| Delivery  | delivery@sahadstores.com     | Delivery@123456  | /delivery     |
| Developer | developer@sahadstores.com    | Developer@123456 | /developer    |

Staff accounts are **automatically created** in MongoDB on first server start.
You never need to insert them manually.

### Buyer Accounts (use "Shop Account" tab at /auth)

Register yourself at `/auth` → "Create Account".

Password rules: ≥ 8 chars, 1 uppercase, 1 number.

### Affiliate (Reader) Accounts

1. Log in as **Admin** → go to `/admin/users`
2. Find the buyer → click **Change Role → reader**
3. The buyer now logs in via "Shop Account" tab and lands on `/affiliate`

---

## Production Build

```bash
# From project root
pnpm build

# Then start the production server
pnpm start
```

Production outputs:
- `dist/index.js`         ← compiled Express server
- `dist/public/`          ← compiled React frontend (served as static files)

---

## Troubleshooting

### `Cannot find module 'tsx'`
```bash
pnpm install          # re-run from project root
```

### `MONGODB_URI not set — database features disabled`
```bash
# Check your .env file exists in the project root
ls -la .env
cat .env | grep MONGODB_URI
```

### `JWT_SECRET must be at least 32 characters`
```bash
# Edit .env and make JWT_SECRET longer
# Example:
JWT_SECRET=my-very-long-secret-key-that-is-definitely-32-chars
```

### Port 3000 already in use
```bash
# Kill whatever is using it
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### tRPC errors in browser console
```bash
# Open http://localhost:3000/api/trpc/auth.me
# Should return {"result":{"data":{"json":null}}}  (no session yet)
# If you see "failed to fetch" the server is not running
```

### MongoDB connection refused
```bash
# Check Docker container is running
docker ps | grep mongo

# Start it if stopped
docker start sahad-mongo

# Or check local MongoDB service
sudo systemctl status mongod
```

---

## Environment Variable Reference

| Variable              | Required | Description                                   |
|-----------------------|----------|-----------------------------------------------|
| `MONGODB_URI`         | ✅       | MongoDB connection string                     |
| `MONGODB_DB_NAME`     | No       | Database name (default: `sahad_stores`)       |
| `JWT_SECRET`          | ✅       | ≥ 32 char secret for signing session tokens   |
| `NODE_ENV`            | No       | `development` or `production` (default: dev)  |
| `PORT`                | No       | Server port (default: `3000`)                 |
| `VITE_APP_URL`        | No       | Full URL for affiliate referral links          |

---

## Tech Stack Reference

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + TypeScript + Tailwind  |
| Routing    | wouter v3                         |
| State/API  | tRPC v11 + TanStack Query v5      |
| Backend    | Express + TypeScript (via tsx)    |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT (jose) + bcrypt + httpOnly cookies |
| Build      | Vite v5 (embedded in Express)     |
| Package mgr| pnpm                              |

