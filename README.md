# 🚀 Neplance

Neplance is a modern talent marketplace experience for organizations and freelancers. This app backs blockchain contracts as its trust layer to secure the jobs being done. 

The current freelancing ecosystem in Nepal lacks a dependable blockchain-backed mechanism
for combining discoverability, identity trust, milestone accountability, and tamper-resistant
contractual history in one system resulting in clients and freelancers still facing uncertainty in
contract execution, service verification, evidence preservation, and the authenticity of platform
records. Neplance was developed to address this trust gap in the local context. It is designed as a
practical freelancing and service platform that supports real user workflows, including job
posting, proposal submission, milestone tracking, and communication.


## Getting started
1. **Backend**: Follow `server/README.md`. Install deps, copy `.env.example`, configure `NEPLANCE_MONGODB_URI`, `SERVER_PORT`, `FRONTEND_BASE_URL`, and the `AUTH_JWT_*` trio, then run `npm start` inside `/server`.
2. **Frontend**: Switch to `/client`, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_BASE_URL` to the backend URL (e.g., `http://localhost:3001`), and run `npm run dev`.
3. Visit `http://localhost:3000` to interact with the marketplace UI talking to the backend over the env-configured API host.


