#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${IN_NIX_SHELL:-}" ]]; then
  exec nix develop --command bun run verify:static
fi

echo "Checking staged and unstaged patches..."
git diff --cached --check
git diff --check

echo "Running static checks..."
bun run check
bun run check:workflow

echo "Running unit tests..."
bun run test:unit

echo "Running Firestore security-rule tests..."
bun run test:rules

echo "Building the production client..."
bun run build
