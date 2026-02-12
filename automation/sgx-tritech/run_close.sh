#!/usr/bin/env bash
# SGX Tritech 收盘报告 / Market Close Report
set -eu

export REPORT_TYPE=close
cd "$(dirname "$0")/../.."
source .env 2>/dev/null || true
.venv/bin/python automation/sgx-tritech/fetch_stock.py
