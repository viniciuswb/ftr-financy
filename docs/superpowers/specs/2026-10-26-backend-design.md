# Financy back-end — design

## Intent

Build the GraphQL API for Financy, a personal finance app where each user manages their own transactions and categories. The goal is to **complete the challenge**: tick every back-end item in the README checklist and meet every mandatory technology. It is not a portfolio piece, so simplicity and closeness to the course's MindShare back-end win over extra features.

The front-end (built later, in `frontend/`) depends on this API, so the data model follows the Figma screens: Login, Cadastro, Dashboard, Transações, Categorias, Perfil, and the "Nova transação" and "Nova categoria" modals.

## Goals

- A user can create an account and log in.
- A user can see and manage **only their own** transactions and categories.
- Create, edit, delete and list transactions.
- Create, edit, delete and list categories.
- The API gives the front-end everything the Figma screens need, directly or with simple client-side calculation.

## Non-goals

- Server-side search, filtering, pagination or dashboard totals. **Decided by the user:** the API returns all of the user's transactions, and the front-end filters, paginates and sums them.
- Refresh tokens, password reset, email verification, avatar upload.
- Docker, deploy, CI, tests beyond what the builder finds useful.
- Changing a user's email (the Perfil screen says it cannot be changed) or deleting an account.

## Anti-goals

- Any way for one user to read, edit or delete another user's data. This is the requirement most likely to be checked, and failing it fails the challenge even if everything else works.
- Drifting away from the course's stack or structure in ways that make the code hard to map back to the classes.

## Constraints (mandatory)

- TypeScript, GraphQL, Prisma, SQLite.
- CORS enabled.
- `backend/.env.example` with `JWT_SECRET=` and `DATABASE_URL=`, plus any other variables the builder adds.
- Lives in `backend/` at the repo root (the repo must have `backend/` and `frontend/`).

## Stack (follows the course)

- Node.js with TypeScript, run in development with `tsx`. **npm** as the package manager (my call).
- Express 5 + Apollo Server via `@as-integrations/express5`.
- TypeGraphQL with `reflect-metadata`; `experimentalDecorators` and `emitDecoratorMetadata` enabled in `tsconfig.json`.
  - `tsx` (esbuild) does **not** emit decorator metadata, so every `@Field`, `@Arg`, `@Query`, `@Mutation` and `@FieldResolver` must declare its type explicitly, e.g. `@Field(() => String)`.
- Prisma with SQLite. Use the current stable Prisma and follow its docs for the SQLite setup.
- `bcryptjs` or `bcrypt` for password hashing, `jsonwebtoken` for tokens, `cors` for CORS.
- GraphQL endpoint at `http://localhost:4000/graphql`, with Apollo's sandbox available in development.

## Code structure (follows the course)

```
backend/
  prisma/schema.prisma, migrations/, seed.ts
  src/
    server.ts            Express + Apollo + CORS + context
    resolvers/           AuthResolver, UserResolver, CategoryResolver, TransactionResolver
    services/            AuthService, UserService, CategoryService, TransactionService
    models/              TypeGraphQL @ObjectType classes
    dtos/ (inputs/outputs)  @InputType / output classes
    middlewares/isAuth.ts   reads "Authorization: Bearer <token>"
    decorators/GQLUser.ts   injects the logged-in user
    utils/               hash, jwt helpers
    env.ts               reads and checks env vars
  .env.example
```

Resolvers stay thin; services hold the Prisma calls. Exact file names are the builder's call as long as the layers match.

## Data model

All IDs are `cuid()` strings. Every table has `createdAt` and `updatedAt`.

**User**
- `name` (required)
- `email` (required, unique, stored lowercase)
- `password` (bcrypt hash; minimum 8 characters before hashing, per the Cadastro screen)

**Category** — belongs to one user
- `title` (required)
- `description` (optional; the modal marks it "Opcional")
- `icon` (required): a key from a fixed list of 16, matching the modal's icon grid in order: `briefcase-business`, `car-front`, `heart-pulse`, `piggy-bank`, `shopping-cart`, `ticket`, `tool-case`, `utensils`, `paw-print`, `house`, `gift`, `dumbbell`, `book-open`, `baggage-claim`, `mailbox`, `receipt-text` (Lucide icon names, confirmed against the Figma layer names `Icon/<name>`; the front-end maps keys to icons).
- `color` (required): one of `green`, `blue`, `purple`, `pink`, `red`, `orange`, `yellow` (the modal's 7 swatches, in order).
- Validation: `icon` and `color` are checked against these lists in the service; SQLite has no enums, so they are stored as strings.

**Transaction** — belongs to one user and one category
- `type`: `EXPENSE` or `INCOME` (GraphQL enum; stored as a string)
- `description` (required)
- `date` (date only, the user's chosen day; stored as a DateTime at UTC midnight, exposed as an ISO `YYYY-MM-DD` string — *my call*, avoids timezone shifts)
- `amount`: positive integer in **cents** (R$ 89,50 → `8950`). The sign comes from `type`. *My call:* avoids floating-point rounding.
- `categoryId` (required): must belong to the same user.

**Relations and deletion**
- Deleting a category **also deletes its transactions** (Prisma `onDelete: Cascade`). **Decided by the user.** The front-end will show a confirmation saying how many transactions go with it.
- Deleting a user cascades to everything (not exposed in the API, but keeps the schema consistent).

## GraphQL API

All operations except `register` and `login` require a valid token and act **only on the logged-in user's data**. Any id that doesn't exist *or* belongs to someone else returns the same "not found" error, so nothing leaks about other users' data.

**Auth**
- `register(data: { name, email, password })` → `{ token, user }`
- `login(data: { email, password })` → `{ token, user }`
- One access token, signed with `JWT_SECRET`, valid for 7 days. *My call:* the course creates a refresh token but never builds the refresh flow; one longer-lived token is simpler and enough here. The login screen's "Lembrar-me" checkbox is front-end only (where the token is stored).
- Wrong email or password returns one generic error, not which part was wrong.
- A missing, invalid or expired token returns a `GraphQLError` with `extensions.code = "UNAUTHENTICATED"`, so the front-end can log the user out by checking the code instead of the message. *My call.*

**User**
- `me` → current user
- `updateMe(data: { name })` → user (for the Perfil screen's "Salvar alterações")

**Categories**
- `categories` → all of the user's categories, ordered by title
- `createCategory(data: { title, description?, icon, color })`
- `updateCategory(id, data: { title?, description?, icon?, color? })` — partial update
- `deleteCategory(id)` → `Boolean`
- Field resolvers on `Category` (user's decision: the one server-side calculation):
  - `transactionCount: Int` — the "12 itens" on cards and the dashboard
  - `totalAmount: Int` — sum of its transactions' amounts in cents (the "R$ 542,30" on the dashboard)
  - *My call:* both are **all-time** (no date filter) and `totalAmount` is the **unsigned** sum of amounts regardless of type. The designs never mix types inside one category (Salário/Investimento hold income, the rest expenses), and they show these numbers without a sign. Categories are not restricted to one type. If the front-end needs month-specific per-category numbers, it computes them from `transactions`.
  - The builder should avoid an N+1 query storm here if it's easy (e.g. a single `groupBy`), but correctness comes first.

**Transactions**
- `transactions` → all of the user's transactions, newest `date` first, then newest `createdAt`
- `createTransaction(data: { type, description, date, amount, categoryId })`
- `updateTransaction(id, data: { type?, description?, date?, amount?, categoryId? })` — partial update
- `deleteTransaction(id)` → `Boolean`
- Field resolver `category` on `Transaction`, following the course's author/comments pattern.

**Validation errors** (empty title, amount ≤ 0, bad icon/color, password under 8 characters, duplicate email, category of another user) return clear `GraphQLError`s with a readable message the front-end can show.

## Configuration

`backend/.env.example`:

```env
JWT_SECRET=
DATABASE_URL=
```

`PORT` and `CORS_ORIGIN` may be added with sensible defaults (`4000`, `http://localhost:5173`); if added, they go in `.env.example` too. CORS allows the configured origin.

## Developer experience

- npm scripts for dev server, build, start, Prisma migrate and seed.
- A seed script creating the Figma demo account (`conta@teste.com`, name "Conta teste", password `12345678`) with the categories and transactions shown in the designs, so the front-end has realistic data. *My call.*
  - Data is transcribed from the Dashboard, Transações and Categorias screens: the 8 categories (Alimentação, Entretenimento, Investimento, Mercado, Salário, Saúde, Transporte, Utilidades) with their descriptions, icons and colors, and the visible transactions (Jantar no Restaurante, Posto de Gasolina, Compras no Mercado, Retorno de Investimento, Aluguel, Freelance, Compras Jantar, Cinema, Pagamento de Salário…) with their dates and amounts. Where screens disagree, pick one consistent set; exact matching of every total is not required.
  - The seed is re-runnable: it deletes and recreates the demo account's data.
- A short `backend/README.md` section with setup steps: install, copy `.env.example`, migrate, seed, run.

## Left to the builder

- Exact library versions, file names, error-code naming, and how `env.ts` checks variables.
- Whether to add automated tests.
- Formatting/linting setup.
