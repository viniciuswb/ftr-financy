# Financy — Front-end

React app for Financy: sign up, log in, and manage your own transactions and categories through the GraphQL API in `../backend`.

**Stack:** TypeScript, React, Vite, Apollo Client (GraphQL), React Router, Zustand, React Hook Form + Zod, Tailwind CSS, Radix UI.

## Running with Docker

From the **repo root**:

```bash
docker compose up --build
```

This starts the API and the front-end together. Open **http://localhost:5173** once the API is healthy (the front-end waits for it). The app is a static build served by nginx, and every route (`/transacoes`, `/categorias`, ...) falls back to `index.html`, so refreshing any page works.

The GraphQL URL is baked into the bundle at build time and defaults to `http://localhost:4000/graphql`. To change it, set `VITE_BACKEND_URL` in the root `.env` (see the root `.env.example`) and rebuild with `docker compose up --build`.

## Running locally

### Prerequisites

- Node.js 20.19 or newer
- npm
- The API running at http://localhost:4000/graphql (see `../backend/README.md`)

### Setup

```bash
cp .env.example .env       # then set VITE_BACKEND_URL (below)
npm install
npm run dev
```

The app runs at **http://localhost:5173**, the API's default `CORS_ORIGIN`.

#### Environment variables

| Variable | Example | Description |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:4000/graphql` | The API's GraphQL endpoint, read at build time |

#### Demo account

With the API's demo data (created automatically by Docker, or by `npm run db:seed` in `../backend`): **conta@teste.com** / **12345678**.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server on port 5173 |
| `npm test` | Runs the unit and component tests (Vitest) |
| `npm run build` | Type-checks and builds to `dist/` |
| `npm run preview` | Serves the built `dist/` locally |

## Pages

| Route | Page |
|---|---|
| `/` | Login when logged out, Dashboard when logged in |
| `/cadastro` | Sign-up |
| `/transacoes` | Transactions: search, filters by type, category and month, pagination; create, edit and delete in a dialog |
| `/categorias` | Categories with their transaction counts; create, edit and delete in a dialog |
| `/perfil` | Profile: change your name, log out |

Below desktop width the card grids drop columns and the transactions table scrolls sideways.
