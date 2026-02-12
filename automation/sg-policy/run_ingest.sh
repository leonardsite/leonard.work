#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export SG_GOV_MONITOR_ROOT="$ROOT_DIR"
PYTHON="${ROOT_DIR}/.venv/bin/python3"
[ -x "$PYTHON" ] || PYTHON="python3"
"$PYTHON" "$ROOT_DIR/scripts/sg_policy_ingest.py" \
  --notion-db 303efdcd10f580a5accce3c6d56b317a \
  --max-new 20 \
  --budget 300
