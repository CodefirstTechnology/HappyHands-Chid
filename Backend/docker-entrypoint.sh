#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting BabyCare API..."
exec node src/server.js
