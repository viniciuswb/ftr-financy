#!/bin/sh
set -e

npx prisma migrate deploy
npx tsx prisma/seed.ts --if-empty
exec node dist/server.js
