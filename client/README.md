# 🎨 Neplance Client

The Next.js 16 (React 19) frontend for Neplance. This repo talks to the Express/Mongo backend in `../server` and boots up a modern single-page experience for talent seekers, freelancers, and proposers.

## Table of contents
- [Requirements](#requirements)
- [Local setup](#local-setup)
- [Environment](#environment)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Requirements
- **Node.js v18+** (matching the server runtime) and npm. Install managers like `nvm` if you switch versions.
- **MongoDB** (local or Atlas) and a running backend API (see `../server`). The client only talks to that API, so you can swap URLs via env vars.

## Local setup
### 1. Backend: start the server
1. Open a terminal and `cd server`.
2. Install dependencies: `npm install`.
3. Copy the example env: `cp .env.example .env` and edit the values to match your MongoDB instance, your JWT secret, and the URL the client will run on. The keys now read `NEPLANCE_MONGODB_URI`, `SERVER_PORT`, `FRONTEND_BASE_URL`, `AUTH_JWT_*` to make their intent explicit. Refer to `server/.env.example` for the full list.
4. Start the server: `npm start`. It will listen on `SERVER_PORT` (default `3001`).

### 2. Frontend: run the client
1. Back in the root, `cd client`.
2. Install dependencies: `npm install`.
3. Copy `cp .env.example .env.local` and ensure `NEXT_PUBLIC_API_BASE_URL` points to the backend you just started (http://localhost:3001 by default).
4. Start the dev server: `npm run dev`. The app will serve at http://localhost:3000 and proxy all API calls to the backend using the `NEXT_PUBLIC_API_BASE_URL` value.

## Environment
- `client/.env.local` (and `.env.example`) expose only the public API host: `NEXT_PUBLIC_API_BASE_URL`. Next.js automatically inlines `NEXT_PUBLIC_*` vars into the browser bundle, so keep secrets on the server.
- The backend configuration (MongoDB URI, JWT secrets, etc.) lives in `../server/.env`. See [server/README.md](../server/README.md#environment) for the full list of server-side keys.

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js dev server (hot reloads, custom compiler). |
| `npm run build` | Generate the production build (used locally before `npm start`). |
| `npm start` | Run the production server (after `npm run build`). |
| `npm run lint` | Run Biome for lint checks. |
| `npm run format` | Format files in place with Biome. |

## Project structure
```
client/
├── src/app/        # App router entrypoint, routes, and layouts
├── src/services/   # API helpers (e.g., `api.js` reads `NEXT_PUBLIC_API_BASE_URL`)
├── src/components/ # Reusable UI primitives
├── public/         # Static assets served by Next
├── .env.local      # Local overrides for `NEXT_PUBLIC_API_BASE_URL`
├── .env.example    # Template used when onboarding
├── package.json    # Scripts + Next/React dependencies (Next 16, React 19)
└── (Biome configs live inside these dev deps and are invoked via the scripts above)
```

## Troubleshooting
- **Backend unreachable?**
  - Confirm the Express server is running (`server` directory) and MongoDB is accessible.
  - Check `NEXT_PUBLIC_API_BASE_URL` in `client/.env.local` matches `SERVER_PORT` in `server/.env`.
- **Port 3000 or 3001 already in use?** `lsof -ti:3000 | xargs kill -9` (or use another `SERVER_PORT`/`NEXT_PUBLIC_API_BASE_URL`).
- **Build problems?** Remove caches: `rm -rf node_modules .next` in both `client` and `server`, reinstall, then rerun the scripts.
- **JWT errors?** Regenerate `AUTH_JWT_SECRET` with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` and restart the server.

Need a deeper backend walkthrough? See `server/README.md` for the Express + Mongo setup and route documentation.