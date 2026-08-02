#!/bin/sh
set -e

echo "? Waiting for database to be ready..."
# Optional: add a wait loop or use wait-for-it.sh

echo "?? Running Prisma migrations..."
npx prisma migrate deploy   # IMPORTANT: use "deploy", NOT "dev" in production

echo "? Migrations done. Starting app..."
exec node dist/src/main.js