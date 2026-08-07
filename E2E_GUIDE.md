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

Playwright builds the client once with the emulator configuration and serves
that production bundle on port 5189. Do not switch the gate to Vite's
development server: repeated development-module startup can consume the entire
2,000 ms application/Auth readiness window on CI and does not represent the
deployed artifact. This readiness point restores the pre-seeded Firebase Auth
session; later room queries, writes, and observer convergence prove real
Firestore emulator traffic.

The suite must pass with zero retries and no focused tests. Use observable
Playwright assertions; never add sleeps, arbitrary polling, or screenshot-only
proof. Keep the fixed locale, timezone, viewport, rendering flags, and test
data from `playwright.config.ts`.

Every browser action and observable-condition wait has a hard maximum of
**2,000 ms**, including screenshot stabilization. Overall scenario, emulator
preflight, and web-server startup limits may be longer because they bound a
process rather than wait for a game event. Never catch an actionability timeout
to use absence as control flow: first use an immediate existence probe such as
`locator.count()`, then inspect the existing control. `verify:static` enforces
this policy and rejects arbitrary sleeps, timer-based waits, longer explicit
waits, and caught `isEnabled()`/`isDisabled()` probes.

## What counts as passing

- every player action is a real Playwright click, tap, fill, key, or navigation gesture against a visible control;
- every gesture is immediately followed by semantic actor/observer validations and a zero-pixel screenshot;
- every scenario has an adjacent `README.md`, linking both phone and desktop frames so a reviewer can validate the journey without reading test code;
- every scenario passes on phone and desktop projects;
- semantic assertions prove the visible state and legal actions;
- responsive checks show no overflow or clipped required controls;
- accessibility checks cover names, focus, keyboard completion, and live state;
- multiplayer scenarios prove actor/observer convergence and hidden-information privacy;
- screenshots use the committed macOS baseline with `maxDiffPixels: 0` and no masks;
- failures leave the HTML report, trace, and test-results artifact available.

## Updating visual baselines

Only update screenshots when the visual change is intentional and its semantic
assertions are reviewed. Run:

```sh
nix develop --command bun run test:e2e:update-snapshots
```

This explicit update command also regenerates the adjacent scenario walkthroughs.
Ordinary E2E runs treat those files as retained evidence and do not mutate the
source tree.

Review every changed image, commit it with the scenario change, and confirm the
macOS workflow passes. Do not generate or approve Linux baselines, loosen pixel
thresholds, mask dynamic UI, or use `--no-verify` to bypass any gate.

The longer [E2E_TESTING.md](E2E_TESTING.md) defines scenario topology, reducer
fixtures, privacy boundaries, responsive targets, and future multiplayer
coverage.
