# Financy — Back-end

GraphQL API for Financy. Each user manages only their own categories and transactions.

**Stack:** TypeScript, Express 5, Apollo Server, TypeGraphQL, Prisma, SQLite.

## Running with Docker

From the **repo root**:

```bash
docker compose up --build
```

The API comes up at **http://localhost:4000/graphql**. On start, the container applies migrations and, if the database has no users yet, creates the demo account below. The SQLite database lives in the `backend-data` Docker volume, so data survives restarts. `docker compose down -v` wipes it.

`JWT_SECRET` and `CORS_ORIGIN` have local defaults. To override them, copy the root `.env.example` to `.env` and fill them in.

## Running locally

### Prerequisites

- Node.js 20.19 or newer
- npm

### Setup

```bash
npm install                # also generates the Prisma client
cp .env.example .env       # then fill in the values below
npm run db:migrate         # creates the SQLite database
npm run db:seed            # optional: demo account with sample data
npm run dev
```

The API runs at **http://localhost:4000/graphql**. Opening it in a browser shows Apollo Sandbox.

#### Environment variables

| Variable | Example | Description |
|---|---|---|
| `JWT_SECRET` | `any-long-random-string` | Secret used to sign login tokens |
| `DATABASE_URL` | `file:./dev.db` | SQLite database file |
| `PORT` | `4000` | Optional, defaults to 4000 |
| `CORS_ORIGIN` | `http://localhost:5173` | Optional, the front-end's URL; defaults to the Vite dev server |

#### Demo account

After `npm run db:seed`: **conta@teste.com** / **12345678**, with 8 categories and 9 transactions placed in the current month (the newest is dated the day the seed runs). Running the seed again resets that account's data. "Today" is the calendar date in the timezone set by `SEED_TZ` (IANA name, default `America/Sao_Paulo`), so the seed does not drift to tomorrow in UTC containers or late evenings in Brazil.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the API with auto-reload |
| `npm run build` / `npm start` | Compiles to `dist/` and runs it |
| `npm test` | Runs the integration tests against a separate `test.db` |
| `npm run db:migrate` | Applies database migrations |
| `npm run db:seed` | Creates the demo account |

## API

Send the token from `register` or `login` as `Authorization: Bearer <token>`. Every operation except `register` and `login` requires it and only sees the logged-in user's data.

| Operation | Type | Description |
|---|---|---|
| `register(data: { name, email, password })` | Mutation | Creates an account (password: 8+ characters) and returns `{ token, user }` |
| `login(data: { email, password })` | Mutation | Returns `{ token, user }`; the token lasts 7 days |
| `me` | Query | The logged-in user |
| `updateMe(data: { name })` | Mutation | Changes the user's name |
| `categories` | Query | The user's categories, each with `transactionCount` and `totalAmount` |
| `createCategory` / `updateCategory` / `deleteCategory` | Mutation | Deleting a category also deletes its transactions |
| `transactions` | Query | The user's transactions, newest first, each with its `category` |
| `createTransaction` / `updateTransaction` / `deleteTransaction` | Mutation | Manage transactions |

**Conventions**

- Amounts are integers in cents (`8950` = R$ 89,50) and always positive. `type` (`EXPENSE` or `INCOME`) gives the sign.
- Dates are `YYYY-MM-DD` strings.
- Category `icon` is one of `briefcase-business`, `car-front`, `heart-pulse`, `piggy-bank`, `shopping-cart`, `ticket`, `tool-case`, `utensils`, `paw-print`, `house`, `gift`, `dumbbell`, `book-open`, `baggage-claim`, `mailbox`, `receipt-text` ([Lucide](https://lucide.dev/icons) names). `color` is one of `green`, `blue`, `purple`, `pink`, `red`, `orange`, `yellow`.
- Errors carry `extensions.code`: `UNAUTHENTICATED` (missing, invalid or expired token), `BAD_USER_INPUT` (validation), `NOT_FOUND`.
