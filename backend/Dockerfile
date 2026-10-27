FROM node:22-slim

WORKDIR /app

# Prisma's CLI (migrations) expects OpenSSL.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Prisma's config reads DATABASE_URL even for `prisma generate`; the real value comes from compose.
ENV DATABASE_URL=file:/app/data/financy.db

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
