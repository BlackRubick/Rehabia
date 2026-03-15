#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

npm install

if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "Frontend listo. Ejecuta: npm run dev"
