#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "Backend listo. Ejecuta: source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
