#!/usr/bin/env bash
set -euo pipefail

git diff --cached --check
git diff --check
bun run check
bun run test:unit
bun run test:e2e
bun run build
