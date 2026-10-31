# Financy

Aplicação FullStack de gestão de finanças pessoais: cada usuário cria sua conta e organiza suas próprias transações (entradas e saídas) e categorias, com um dashboard de saldo e resumo do mês.

- **Back-end** (`backend/`): API GraphQL com TypeScript, Express, Apollo Server, TypeGraphQL, Prisma e SQLite.
- **Front-end** (`frontend/`): React + TypeScript com Vite, Apollo Client e Tailwind CSS, seguindo o [layout do Figma](https://www.figma.com/design/VbiJi8YeRHcW2nhxkETW6U/Financy--Community-).

Os requisitos do desafio estão em [REQUIREMENTS.md](REQUIREMENTS.md).

## Como rodar com Docker (recomendado)

Pré-requisito: Docker com Docker Compose.

Na raiz do repositório:

```bash
docker compose up --build
```

Depois acesse **http://localhost:5173** e entre com a conta de demonstração:

- **E-mail:** `conta@teste.com`
- **Senha:** `12345678`

A API fica em http://localhost:4000/graphql. O banco é criado e populado automaticamente na primeira execução e fica salvo entre reinícios. Para apagar os dados e começar do zero:

```bash
docker compose down -v
```

As variáveis já têm valores padrão para rodar localmente. Para alterá-las, copie `.env.example` para `.env` na raiz e preencha.

## Como rodar sem Docker

Pré-requisito: Node.js 20.19 ou mais recente.

**1. Back-end** (em um terminal):

```bash
cd backend
npm install
cp .env.example .env
```

Preencha o `.env`, por exemplo:

```env
JWT_SECRET=qualquer-texto-longo-e-aleatorio
DATABASE_URL=file:./dev.db
```

Depois:

```bash
npm run db:migrate   # cria o banco SQLite
npm run db:seed      # opcional: cria a conta de demonstração
npm run dev
```

**2. Front-end** (em outro terminal):

```bash
cd frontend
npm install
cp .env.example .env
```

No `.env`, aponte para a API:

```env
VITE_BACKEND_URL=http://localhost:4000/graphql
```

Depois:

```bash
npm run dev
```

Acesse **http://localhost:5173**.

## Testes

```bash
cd backend && npm test
cd frontend && npm test
```

Mais detalhes em [backend/README.md](backend/README.md) e [frontend/README.md](frontend/README.md).
