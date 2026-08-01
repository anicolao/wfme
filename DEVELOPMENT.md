# Development environment

## Reproducible entry point

Nix is the supported way to install the project toolchain and run verification. The checked-in `flake.nix` declares the system and command-line tools; `flake.lock` pins the Nix inputs. Bun is used inside that shell for JavaScript dependency resolution, and `bun.lock` pins the package graph.

Install Nix with flakes enabled, then run:

```sh
nix develop --command bun install --frozen-lockfile
nix develop --command bun run verify:change
```

The shell provides Bun, Git, Bash, Coreutils, `gh`, `ripgrep`, `shellcheck`, `actionlint`, and the JDK. Browser binaries and future Firebase emulator downloads use `$XDG_CACHE_HOME` under `.firebase/cache`, which is ignored by Git but stable across separate `nix develop --command` calls.

For an interactive shell:

```sh
nix develop
bun install --frozen-lockfile
bun run dev
```

The interactive shell is convenient; the explicit `nix develop --command` form is the canonical CI, hook, and handoff command because it makes the environment boundary visible.

## Verification contract

The repository verifier re-enters the Nix shell when invoked outside it. It checks staged and unstaged whitespace, Svelte diagnostics, GitHub Actions syntax, unit tests, Playwright E2E, and the production build.

```sh
nix develop --command bun run verify:change
```

Before E2E runs for the first time on a machine or CI worker, install Chromium through the same shell:

```sh
nix develop --command bunx playwright install chromium
```

The browser download is cached outside Git. It is not silently installed by an arbitrary host package manager.

## Hooks

`bun install` runs the Husky setup. Both pre-commit and pre-push invoke the complete verifier through `nix develop`, matching the sibling projects' change contract. Use a feature branch and make the smallest coherent commit; do not bypass the hook with `--no-verify`.

## CI

GitHub Actions installs Nix with `cachix/install-nix-action`, installs the locked Bun graph and Chromium through `nix develop`, then runs the same verifier. This keeps local, hook, and hosted checks on one environment definition.

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
