#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${IN_NIX_SHELL:-}" ]]; then
  exec nix develop --command bun run verify:change
fi

echo "Checking staged and unstaged patches..."
git diff --cached --check
git diff --check

echo "Running static checks..."
bun run check
bun run check:workflow

echo "Running unit tests..."
bun run test:unit

if [[ "${SKIP_E2E:-0}" == "1" ]]; then
  echo "Skipping E2E here; the macOS E2E workflow is the browser gate."
else
  echo "Running the complete E2E suite..."
  bun run test:e2e
fi

echo "Building the production client..."
bun run build
