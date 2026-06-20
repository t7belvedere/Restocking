#!/bin/bash
set -e
playwright install chromium
exec uvicorn api:app --host 0.0.0.0 --port "${PORT:-8000}"
