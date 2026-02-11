# 🚀 Neplance

Neplance is a modern talent marketplace experience for organizations and freelancers. The repo pairs a React 19 + Next.js 16 storefront with an Express/Mongo backend that can scale from quick prototyping to production deployments.

## What makes Neplance special?
- **Polished UI stack**: App Router, TailwindCSS 4, and Biome linting keep the frontend lean while shipping modern React 19 primitives.
- **Security-first backend**: JWT + HTTP-only cookies, scoped `protect`/`restrictTo` middleware, and a clear MongoDB connection helper mean auth and persistence are production-ready out of the box.
- **Zero-guess dev experience**: Environment names are explicit (`NEXT_PUBLIC_API_BASE_URL`, `NEPLANCE_MONGODB_URI`, `AUTH_JWT_*`, `FRONTEND_BASE_URL`, etc.), the README suite tells you exactly how to run both services, and the API layer is already documented with the core auth/jobs/proposals routes.
- **One workspace, two projects**: Everything lives under this repo. Start the backend and client independently, then watch them talk through the shared API URL.

## Architecture overview
- `/client`: Next.js app serving the marketplace UI, configured to call the backend via `NEXT_PUBLIC_API_BASE_URL`.
- `/server`: Express API with auth controllers, job/proposal routes, middleware for guards, and centralized error handling.
- Shared contracts: JWT flows, MongoDB schemas, and consistent logging/cors settings so the stack behaves symmetrically in dev and production.

## Getting started
1. **Backend**: Follow `server/README.md`. Install deps, copy `.env.example`, configure `NEPLANCE_MONGODB_URI`, `SERVER_PORT`, `FRONTEND_BASE_URL`, and the `AUTH_JWT_*` trio, then run `npm start` inside `/server`.
2. **Frontend**: Switch to `/client`, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_BASE_URL` to the backend URL (e.g., `http://localhost:3001`), and run `npm run dev`.
3. Visit `http://localhost:3000` to interact with the marketplace UI talking to the backend over the env-configured API host.

## Need more detail?
- Frontend onboarding and troubleshooting lives in `client/README.md`.
- Backend intent, environment keys, and API notes are now in `server/README.md`.

Neplance is designed to be a turnkey base for talent marketplaces—spin it up, plug in your own data, and ship features with confidence.