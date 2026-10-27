# Financy front-end — design

## Intent

Build the Financy web app in `frontend/`: a React app that talks to the existing GraphQL API (`backend/`) so a user can sign up, log in, and manage their own transactions and categories. The goal is to **complete the challenge**: tick every front-end item in the README checklist, use the mandatory technologies, and **follow the Figma layout as faithfully as possible**. Simplicity and closeness to the course's MindShare front-end win over extra features.

Figma file: `https://www.figma.com/design/VbiJi8YeRHcW2nhxkETW6U/Financy--Community-` — pages "💻 Projeto" (screens) and "🎨 Style Guide" (colors, typography, icons, components).

## Goals

- Create an account and log in; see and manage **only your own** data (the API enforces it; the UI never shows anything else).
- Create, edit, delete and list transactions; create, edit, delete and list categories.
- Screens match Figma at desktop width (1280px): Login, Cadastro, Dashboard, Transações, Categorias, Perfil, and the "Nova transação" / "Nova categoria" modals.
- `docker compose up` at the repo root runs the front-end together with the API.

## Non-goals

- Password recovery (the "Recuperar senha" link exists in Figma but has no API behind it), avatar upload, dark mode, a separate mobile design, translations (the UI is Portuguese, as in Figma).
- Server-side filtering/pagination (decided for the back-end: the API returns all of the user's data and the front-end filters, paginates and sums).

## Anti-goals

- Visible drift from Figma at desktop width (wrong colors, spacing, fonts or icons) — "follow the layout faithfully" is a graded requirement.
- Any screen reachable while logged out except Login and Cadastro.
- Numbers that disagree between screens (e.g. a category's total on the Dashboard vs. Categorias).

## Constraints (mandatory)

- React + TypeScript, **Vite without a framework**, GraphQL for every API call.
- `frontend/.env.example` with `VITE_BACKEND_URL=` (full GraphQL URL, e.g. `http://localhost:4000/graphql`).
- Lives in `frontend/` at the repo root.
- The back-end API is fixed (see `backend/README.md`); amounts are integer cents, dates are `YYYY-MM-DD`, `type` is `EXPENSE` | `INCOME`, errors carry `extensions.code` (`UNAUTHENTICATED`, `BAD_USER_INPUT`, `NOT_FOUND`).

## Decided by the user

- **Demo data month:** the back-end seed is changed so the demo transactions fall in the **current month** relative to the day the seed runs (keep Figma's descriptions, amounts, types and categories; keep the relative spacing between dates; the newest one lands on today; any that would fall before the 1st land in the previous month). The app always uses the real current month for "do mês" figures and as the default period filter.
- **Responsive scope:** pixel-faithful at desktop; on narrower windows grids stack to fewer columns and the transactions table scrolls horizontally. No separate mobile layout; the header nav stays as is.

## Stack (my calls, following the course where it has an opinion)

- **Vite + React + TypeScript**, React Router for routes.
- **Tailwind CSS** with the Figma tokens; **shadcn/ui** (Radix) as the base for Dialog, Select, Popover/Calendar, Checkbox, AlertDialog, restyled to match Figma's components.
- **Apollo Client** for GraphQL (as in the course), with an auth link adding `Authorization: Bearer <token>`.
- **Zustand** for auth state (user, token), as in the course.
- **React Hook Form + Zod** for forms and validation messages.
- **sonner** for toasts (success/error feedback).
- **lucide-react** for icons (Figma states its icons are Lucide).
- Hand-written TypeScript types for the GraphQL operations (no codegen).
- Exact versions are pinned in the plan.

## Visual system (from the Style Guide)

- **Font:** Inter (Google Fonts).
- **Colors** (Tailwind tokens with these names):
  - brand-dark `#124B2B`, brand-base `#1F6F43`
  - gray-800 `#111827`, gray-700 `#374151`, gray-600 `#4B5563`, gray-500 `#6B7280`, gray-400 `#9CA3AF`, gray-300 `#D1D5DB`, gray-200 `#E5E7EB`, gray-100 `#F8F9FA`
  - black `#000000`, white `#FFFFFF`, danger `#EF4444`, success `#19AD70`
  - For each category color — dark / base / light: blue `#1D4ED8 #2563EB #DBEAFE`, purple `#7E22CE #9333EA #F3E8FF`, pink `#BE185D #DB2777 #FCE7F3`, red `#B91C1C #DC2626 #FEE2E2`, orange `#C2410C #EA580C #FFEDD5`, yellow `#A16207 #CA8A04 #F7F3CA`, green `#15803D #16A34A #E0FAE9`.
- **Category color usage:** the API color key (`green`, `blue`, …) maps to these trios — icon tile and tag use the *light* background with *base*/*dark* foreground; the color swatch in the category modal uses *base*.
- **Category icons:** the API icon key is the Lucide icon name (`utensils`, `car-front`, …).
- **Components to build first** (Figma "Componentes"): Input (Empty / Active / Filled / Error / Disabled / Select states, with optional left icon and helper text), Label Button (Solid / Outline × Md / Sm × Default / Hover / Disabled), Icon Button (Outline / Danger), Link, Pagination Button (Default / Hover / Active / Disabled), Tag (8 colors incl. gray), Type indicator (Entrada green / Saída red).
- **Logo:** the `Logo` and `Logo_Icon` vectors exported from Figma as SVG.
- Exact spacing, radii, shadows and font sizes come from Figma during the build. The file is readable through the Figma MCP tools as-is (metadata and screenshots already retrieved); no duplication needed.

## Routes and access

| Path | Logged out | Logged in |
|---|---|---|
| `/` | Login | Dashboard |
| `/cadastro` | Sign-up | redirect to `/` |
| `/transacoes`, `/categorias`, `/perfil` | redirect to `/` | the page |
| anything else | redirect to `/` | redirect to `/` |

- Logged-in pages share a header: logo, nav (Dashboard / Transações / Categorias, active link in brand green), avatar circle with the user's initials (first letter of the first and last word of the name) linking to `/perfil`.

## Auth behavior

- **Sign-up** (`register`): on success the user is logged in and lands on the Dashboard; success toast.
- **Login** (`login`): "Lembrar-me" checked → token and user kept in `localStorage` (survive closing the browser); unchecked → `sessionStorage` (cleared when the tab closes). *My call.*
- **Password field** has a show/hide toggle (eye / eye-closed icons, as in Figma).
- **"Recuperar senha"** shows an info toast ("Funcionalidade em breve") — *my call*, keeps the Figma layout without a fake flow.
- **Logout** ("Sair da conta" on Perfil): clears the stored token/user and the Apollo cache, goes to `/`.
- **Expired/invalid token:** any operation returning `UNAUTHENTICATED` while logged in logs the user out and returns to `/` with a toast ("Sessão expirada"). Login and sign-up failures never trigger this.
- After sign-up the session is stored like a "Lembrar-me" login (`localStorage`). *My call.*
- On app start with a stored token, the user is considered logged in immediately; `me` refreshes the user's name.

## Screens

**Login / Cadastro** — as in Figma. Client-side validation mirrors the API: required fields, email format, password ≥ 8 characters ("A senha deve ter no mínimo 8 caracteres" helper text under the field). API errors (e.g. "E-mail já cadastrado", "E-mail ou senha inválidos") appear as error toasts. Links between the two screens.

**Dashboard**
- Saldo total: all-time income − all-time expenses.
- Receitas do mês / Despesas do mês: sums for the current calendar month (local time).
- Transações recentes: the 5 newest transactions (API order), each with icon tile, description, date (`dd/MM/yy`), category tag, signed amount and type arrow. "Ver todas" → `/transacoes`; "+ Nova transação" opens the transaction modal.
- Categorias: up to 5 categories with the most transactions (ties by title), each tag + "N itens" + total. The total is the API's `totalAmount`: an all-time, **unsigned** sum of the category's amounts, shown without a sign or color (as in Figma). "Gerenciar" → `/categorias`. Counts and totals come from the API fields (`transactionCount`, `totalAmount`, all-time) — the same numbers the Categorias page shows.
- Empty states (no transactions / no categories): a short line of text in the card, plus the existing action link. *My call.*

**Transações**
- Header with "Nova transação" button.
- Filters (all client-side, combined):
  - Buscar: description contains the text, ignoring case and accents.
  - Tipo: Todos / Entrada / Saída.
  - Categoria: Todas / each category.
  - Período: "Todos os períodos" first (**decided by the user**: lets every transaction be listed at once, per the checklist), then a month list — the current month, then every other month that has transactions, newest first, labeled "Novembro / 2025". Default: current month.
- Table: Descrição (icon tile + text), Data, Categoria (tag), Tipo (Entrada/Saída indicator), Valor (signed, `+ R$ 340,25` / `- R$ 89,50`), Ações (delete, edit).
- Pagination: 10 rows per page; footer "1 a 10 | 27 resultados"; prev/next and page-number buttons. Changing a filter returns to page 1. Empty result: "Nenhuma transação encontrada".
- Delete asks for confirmation (dialog) then deletes; edit opens the transaction modal pre-filled with title "Editar transação".

**Categorias**
- Header with "Nova categoria" button.
- Summary cards: total de categorias; total de transações (sum of `transactionCount`); categoria mais utilizada (highest `transactionCount`, shown with its icon in its color; "—" when there are none).
- Grid of category cards (4 per row at desktop): icon tile, delete and edit buttons, title, description (if any), tag, "N itens" ("1 item" singular, "0 itens").
- Delete confirmation states how many transactions will be deleted with it (the API cascades; decided for the back-end). Edit opens the category modal pre-filled with title "Editar categoria".

**Perfil** — avatar initials, name, email; "Nome completo" editable, "E-mail" disabled with "O e-mail não pode ser alterado"; "Salvar alterações" (`updateMe`, success toast, header initials update); "Sair da conta" logs out.

**Transaction modal** ("Nova transação" / "Editar transação") — Despesa/Receita toggle (default Despesa), Descrição, Data (date picker, pt-BR calendar, "Selecione" placeholder), Valor (currency input: typing digits fills cents, shown as `R$ 0,00`), Categoria (select of the user's categories), Salvar. If the user has no categories, the select shows a hint to create one first. Validation: all fields required, amount > 0.

**Category modal** ("Nova categoria" / "Editar categoria") — Título, Descrição (Opcional), Ícone (the 16-icon grid in Figma order, one selected), Cor (7 swatches, one selected), Salvar. Defaults for a new category: first icon and first color selected. *My call.*

## Data flow

- Queries: `me`, `categories { id title description icon color transactionCount totalAmount }`, `transactions { id type description date amount categoryId category { id title icon color } }`.
- After any create/update/delete of a transaction or category, refetch both `transactions` and `categories` (totals and counts depend on both). *My call:* simple and always consistent at this data size.
- Formatting helpers: cents → `R$ 1.234,56` (pt-BR), `YYYY-MM-DD` → `dd/MM/yy`, month labels in Portuguese. Dates are handled as plain strings/local dates so no timezone shift can move a day.
- API errors: show the API's message in an error toast; `UNAUTHENTICATED` triggers logout (above).

## Configuration and Docker

- `frontend/.env.example`: `VITE_BACKEND_URL=`. Local dev default in `.env`: `http://localhost:4000/graphql`.
- Root `docker-compose.yml` gains a `frontend` service: built with `VITE_BACKEND_URL` as a build argument (default `http://localhost:4000/graphql`, since the browser calls the API from the host), served as static files by nginx on port **5173** (matches the API's default `CORS_ORIGIN`), with SPA fallback to `index.html`, starting after the backend is healthy.
- Back-end change: the seed's date shifting (above), with `backend/README.md` updated to say so.

## Verification

- Unit tests (Vitest) for the logic most likely to break: money and date formatting, currency input parsing, transaction filters (search with accents, type, category, month), pagination math, dashboard and category summaries, initials.
- Component tests (Testing Library) for routing/auth guards and form validation messages.
- Final check: run the app against the real API with the demo account and compare each screen with its Figma frame at 1280px.

## Left to the builder

- Folder structure, component names, exact library versions, how shadcn components are restyled.
- Exact pixel values (taken from Figma during the build).
- Loading indicators (keep them light: disabled buttons while submitting, skeleton or plain text while lists load).
