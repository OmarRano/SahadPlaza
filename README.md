# Sahad Stores — Multi-Role E-Commerce Platform

## Project Structure

```
sahad-stores/                  ← PROJECT ROOT (run ALL commands from here)
├── client/                    ← Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── App.tsx            ← Router (all 22 routes live here)
│   │   ├── main.tsx           ← Entry point, tRPC client setup
│   │   ├── pages/             ← All UI pages grouped by role
│   │   │   ├── Home.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── buyer/
│   │   │   ├── admin/
│   │   │   ├── manager/
│   │   │   ├── delivery/
│   │   │   ├── affiliate/
│   │   │   └── developer/
│   │   ├── components/        ← Shared UI components (shadcn/ui)
│   │   └── _core/hooks/       ← useAuth hook
│   ├── index.html
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                    ← Backend (Express + tRPC + MongoDB)
│   ├── _core/
│   │   ├── index.ts           ← SERVER ENTRY POINT
│   │   ├── trpc.ts            ← tRPC init + middleware
│   │   ├── context.ts         ← Request context (auth session)
│   │   ├── auth.ts            ← JWT helpers
│   │   ├── vite.ts            ← Vite-in-Express setup (dev only)
│   │   └── rateLimit.ts       ← In-memory rate limiter
│   ├── routers.ts             ← ALL tRPC routes defined here
│   ├── auth.ts                ← Auth router (login/signup/logout)
│   ├── mongodb.ts             ← DB connection + staff seed
│   ├── db.ts                  ← MongoDB query helpers
│   ├── rbac.ts                ← Role-based access procedures
│   └── models/                ← Mongoose schemas
├── shared/                    ← Code shared by client AND server
│   ├── const.ts               ← UNAUTHED_ERR_MSG etc.
│   └── types.ts               ← UserRole, SessionPayload
├── vite.config.ts             ← Vite config (root, NOT client/)
├── package.json               ← ONE package.json for everything
├── tsconfig.json
└── .env                       ← Environment variables (YOU EDIT THIS)
```

---

## How the Dev Server Works

**There is only ONE process and ONE terminal needed.**

`pnpm dev` starts `server/_core/index.ts` which:
1. Connects to MongoDB
2. Starts Express on port 3000
3. Mounts tRPC at `/api/trpc`
4. Calls `setupVite()` which embeds Vite as Express middleware
5. Vite handles all `*.tsx` requests, HMR, and React

```
Browser  ←→  http://localhost:3000
                      ↓
              Express (server/_core/index.ts)
              ├── /api/trpc  →  tRPC router (all API)
              └── /*         →  Vite middleware (React app)
```

**You do NOT run `vite dev` or `cd client && npm run dev` separately.**

---

## Step-by-Step Setup

### Prerequisites

| Tool       | Version  | Install |
|------------|----------|---------|
| Node.js    | ≥ 18     | https://nodejs.org |
| pnpm       | ≥ 9      | `npm install -g pnpm` |
| MongoDB    | ≥ 6      | Local or Atlas (free) |

---

### Step 1 — Clone / Unzip and enter the project root

```bash
cd sahad-stores          # ← THE ONLY DIRECTORY YOU NEED
```

> ⚠️ Never `cd client` or `cd server` to run commands.
> Everything runs from the **project root**.

---

### Step 2 — Install all dependencies

```bash
pnpm install
```

This installs all frontend + backend packages (there is one `package.json` at root).

---

### Step 3 — Configure environment variables

Edit the `.env` file at the project root:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/sahad_stores

# OR MongoDB Atlas (cloud — free tier works)
# MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/sahad_stores

MONGODB_DB_NAME=sahad_stores

# JWT secret — must be 32+ characters, change before deploying
JWT_SECRET=sahad-stores-super-secret-jwt-key-change-in-production-2026

NODE_ENV=development
PORT=3000
VITE_APP_URL=http://localhost:3000
```

---

### Step 4 — Start MongoDB

**Option A — Docker (recommended)**
```bash
docker run -d -p 27017:27017 --name sahad-mongo mongo:7
```

**Option B — MongoDB Atlas (cloud, no install)**
1. Go to https://cloud.mongodb.com → free cluster
2. Get your connection string
3. Paste it as `MONGODB_URI` in `.env`

**Option C — Local install**
```bash
# macOS
brew tap mongodb/brew && brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
# Start "MongoDB" from Services
```

---

### Step 5 — Start the dev server

```bash
# From PROJECT ROOT (sahad-stores/)
pnpm dev
```

You will see:
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
   buyer       register at /auth          (self-signup)
```

Open: **http://localhost:3000**

---

## All Available URLs

### Public
| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/auth` | Login / Sign Up |
| `/auth?mode=signup` | Sign up tab |
| `/auth?mode=staff` | Staff portal login |
| `/products` | Product catalog (public) |
| `/product/:id` | Product detail |

### Buyer (role: `buyer` or `reader`)
| URL | Description |
|-----|-------------|
| `/buyer` | Buyer dashboard |
| `/cart` | Shopping cart |
| `/checkout` | 3-step checkout |
| `/orders` | Order history |
| `/order/:id/track` | Order tracking |
| `/profile` | Profile settings |

### Admin (role: `admin`)
| URL | Description |
|-----|-------------|
| `/admin` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/analytics` | Sales analytics |
| `/admin/affiliates` | Affiliate management |

### Manager (role: `manager`)
| URL | Description |
|-----|-------------|
| `/manager` | Manager dashboard |
| `/manager/products` | Product management |
| `/manager/inventory` | Inventory management |
| `/manager/categories` | Category management |

### Delivery (role: `delivery`)
| URL | Description |
|-----|-------------|
| `/delivery` | Delivery dashboard |
| `/delivery/orders` | My assigned orders |
| `/delivery/order/:id/track` | GPS tracking |

### Affiliate (role: `reader`)
| URL | Description |
|-----|-------------|
| `/affiliate` | Affiliate dashboard |
| `/affiliate/referrals` | Referral management |
| `/affiliate/earnings` | Earnings history |

### Developer (role: `developer`)
| URL | Description |
|-----|-------------|
| `/developer` | Developer dashboard |
| `/developer/analytics` | Platform analytics |

---

## Staff Credentials (seeded automatically)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sahadstores.com | Admin@123456 |
| Manager | manager@sahadstores.com | Manager@123456 |
| Delivery | delivery@sahadstores.com | Delivery@123456 |
| Developer | developer@sahadstores.com | Developer@123456 |

Buyers register themselves at `/auth`.
Admin can promote a buyer to Affiliate via User Management.

---

## Production Build

```bash
# From project root
pnpm build          # builds React → dist/public, bundles server → dist/index.js
pnpm start          # runs Node production server
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module 'tsx'` | Run `pnpm install` from project root |
| `MONGODB_URI not set` | Check `.env` file is in project root |
| `Port 3000 busy` | Set `PORT=3001` in `.env` |
| `JWT_SECRET must be 32 chars` | Use a longer secret in `.env` |
| White screen / blank app | Check browser console; usually a failed tRPC call |
| `Cannot find @shared/const` | Run `pnpm install` then `pnpm dev` again |
