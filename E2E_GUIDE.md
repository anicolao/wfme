# E2E testing guide

Playwright E2E is the browser-level gate for every player-facing slice. The
canonical hosted run is the **E2E tests (macOS)** GitHub Actions workflow on
`macos-latest`. It is an independent required check alongside Linux static,
unit, and build verification; neither workflow bypasses its contract.

## Run it locally

From the repository root:

```sh
nix develop --command bun install --frozen-lockfile
nix develop --command bunx playwright install chromium
nix develop --command bun run test:e2e
```

The command starts isolated Firebase Auth and Firestore emulators. The suite must pass with zero retries and no focused tests. Use observable
Playwright assertions; never add sleeps, arbitrary polling, or screenshot-only
proof. Keep the fixed locale, timezone, viewport, rendering flags, and test
data from `playwright.config.ts`.

## What counts as passing

- every scenario passes on phone and desktop projects;
- semantic assertions prove the visible state and legal actions;
- responsive checks show no overflow or clipped required controls;
- accessibility checks cover names, focus, keyboard completion, and live state;
- multiplayer scenarios use separate browser contexts and prove Firestore-backed actor/observer convergence and hidden-information privacy;
- screenshots use the macOS baseline with `maxDiffPixels: 0`;
- failures leave the HTML report, trace, and test-results artifact available.

## Updating visual baselines

Only update screenshots when the visual change is intentional and its semantic
assertions are reviewed. Run:

```sh
nix develop --command bun run test:e2e:update-snapshots
```

Review every changed image, commit it with the scenario change, and confirm the
macOS workflow passes. Do not generate or approve Linux baselines, loosen pixel
thresholds, mask dynamic UI, or use `--no-verify` to bypass any gate.

The longer [E2E_TESTING.md](E2E_TESTING.md) defines scenario topology, reducer
fixtures, privacy boundaries, responsive targets, and future multiplayer
coverage.
