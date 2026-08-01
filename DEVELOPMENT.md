# Development environment

## Reproducible entry point

Nix is the supported way to install the project toolchain and run verification. The checked-in `flake.nix` declares the system and command-line tools; `flake.lock` pins the Nix inputs. Bun is used inside that shell for JavaScript dependency resolution, and `bun.lock` pins the package graph.

Install Nix with flakes enabled, then run:

```sh
nix develop --command bun install --frozen-lockfile
nix develop --command bun run verify:change
```

The shell provides Bun, Git, Bash, Coreutils, `gh`, `ripgrep`, `shellcheck`, `actionlint`, and the JDK. The pinned `firebase-tools` package runs inside that shell. Browser binaries and Firebase emulator downloads use `$XDG_CACHE_HOME` under `.firebase/cache`, which is ignored by Git but stable across separate `nix develop --command` calls.

For an interactive shell:

```sh
nix develop
bun install --frozen-lockfile
bun run dev
```

For local multiplayer development, use the emulator-backed E2E command or start the emulators directly:

```sh
nix develop --command bun run emulators
```

The production Firebase web configuration is injected only by the GitHub Pages deployment job from repository secrets. Local and CI E2E use the fixed `wfme-e2e` emulator project and never write production data.

The interactive shell is convenient; the explicit `nix develop --command` form is the canonical CI, hook, and handoff command because it makes the environment boundary visible.

## Verification contract

The full change verifier re-enters the Nix shell when invoked outside it. It
checks staged and unstaged whitespace, Svelte diagnostics, GitHub Actions
syntax, unit tests, Firestore security rules, Playwright E2E, and the production build.

```sh
nix develop --command bun run verify:change
```

The browser gate runs separately on `macos-latest` and is always required:

```sh
nix develop --command bunx playwright install chromium
nix develop --command bun run test:e2e
```

See [E2E_GUIDE.md](E2E_GUIDE.md) for the short pass/fail checklist and
[E2E_TESTING.md](E2E_TESTING.md) for the full strategy.

Before E2E runs for the first time on a machine or CI worker, install Chromium through the same shell:

```sh
nix develop --command bunx playwright install chromium
```

The browser download is cached outside Git. It is not silently installed by an arbitrary host package manager.

## Hooks

`bun install` runs the Husky setup. Both pre-commit and pre-push invoke the complete verifier through `nix develop`, matching the sibling projects' change contract. Use a feature branch and make the smallest coherent commit; do not bypass the hook with `--no-verify`.

## CI

GitHub Actions installs Nix with `cachix/install-nix-action`, installs the locked Bun graph and Chromium through `nix develop`, then runs two independent required workflows. The Linux workflow runs `verify:static` for checks, unit tests, and the production build. The separate `E2E tests (macOS)` workflow runs the complete Playwright suite on `macos-latest`, uploads its report and failure artifacts, and owns visual-baseline generation. No workflow, hook, or verifier skips a gate.

After verification, same-repository pull requests are built with
`PUBLIC_BASE_PATH=/wfme/pr<N>` and retained under that directory on the
`gh-pages` branch. The workflow comments the stable URL on the PR:
`https://anicolao.github.io/wfme/pr<N>/`. A push to `main` publishes the
production site at `https://anicolao.github.io/wfme/`. Fork pull requests are
verified but skipped by the publishing job because the repository token is not
available to them.

Configure GitHub Pages to use the `gh-pages` branch at its repository root. The
retained-directory strategy means publishing a new PR does not remove existing
previews.
