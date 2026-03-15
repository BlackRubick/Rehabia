#!/usr/bin/env bash
set -e

ROOT_DIR="$(dirname "$0")/.."

cd "$ROOT_DIR"
npm run dev &
FRONT_PID=$!

cd "$ROOT_DIR/backend"
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACK_PID=$!

trap "kill $FRONT_PID $BACK_PID" EXIT
wait
