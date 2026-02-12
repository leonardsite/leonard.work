#!/usr/bin/env bash
# SGX Tritech 开盘报告 / Market Open Report
set -eu

export REPORT_TYPE=open
cd "$(dirname "$0")/../.."
source .env 2>/dev/null || true
.venv/bin/python automation/sgx-tritech/fetch_stock.py
