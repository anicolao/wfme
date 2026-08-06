# End-to-end testing strategy

## Purpose

Playwright scenarios are the primary proof that a player-visible capability works through the production browser stack. Vitest covers exhaustive pure rules; Playwright proves integration, privacy presentation, multiplayer convergence, accessibility, and responsive composition.

## Hermetic environment

E2E uses the real built client and local Firebase Auth/Firestore emulators once multiplayer lands. It never reads or writes production data.

The runner is installed and invoked through the checked-in Nix shell. The
dedicated `E2E tests (macOS)` workflow runs on `macos-latest`, using
`cachix/install-nix-action`, `nix develop --command bun install
--frozen-lockfile`, and `nix develop --command bunx playwright install chromium`
before running the suite. This makes the browser test contract independent of
the host's ambient Bun, shell utilities, and package-manager versions while
keeping the screenshot renderer stable.

Every scenario fixes:

- game ID and authenticated emulator UID per seat;
- player names and Commander choices;
- match seed, manifest versions, locale, timezone, and clock;
- browser engine, fonts, device scale, rendering flags, and viewport;
- network allowlist and service-worker behavior.

External requests are blocked. Tests use Playwright locator auto-waiting and observable state; they never use sleeps or timer-based waits. Every browser action, assertion, navigation, and screenshot wait is capped at 2,000 ms. Longer limits are reserved for whole scenarios and process startup, which are not game-event waits. An optional control is discovered with an immediate locator count before its enabled state is read; tests never catch an actionability timeout as a branching mechanism. The static gate enforces these constraints. Retries are zero so flakes remain visible.

## Context topology

Use one isolated browser context per human seat. A four-player case opens four contexts, not four pages sharing storage. Each action is asserted from:

1. the actor's seat-safe view;
2. at least one opponent's converged view;
3. the deterministic full-state test projection when exact hidden-zone conservation matters.

Never assert opponent secrets through ordinary UI. A dedicated E2E-only diagnostic endpoint may expose full state to the harness, but production builds must omit it.

## Assertion layers

Every documented step combines:

- **semantic assertions:** roles, accessible names, exact resources, legal/disabled states, turn and phase;
- **convergence assertions:** all relevant contexts reach the same public projection and event ID;
- **privacy assertions:** hidden identities and values are absent from opponent-facing DOM and accessibility trees;
- **geometry assertions:** no horizontal document overflow, clipped dialogs, overlapping controls, or offscreen required action;
- **visual assertions:** stable milestone screenshots with zero differing pixels under the pinned CI renderer;
- **accessibility assertions:** keyboard completion, focus order/restoration, live announcements, non-color cues, reduced motion, and 44×44 targets.

Screenshot tests supplement semantics. They never replace assertions about exact game state.

## Screenshot policy

- macOS Chromium in the dedicated `E2E tests (macOS)` workflow is the baseline authority.
- `maxDiffPixels` is zero; animations are disabled and caret hidden.
- Do not mask dynamic areas, loosen thresholds, add arbitrary timeouts, or accept screenshots without reviewing the semantic reason for change.
- Generate baselines through the macOS workflow (or the matching local command) and review the artifact; do not hand-edit screenshots.
- Keep one or two meaningful frames per scenario step rather than capturing every animation frame.

Every integrated tracer commits its macOS Chromium baselines from its first gesture onward. Linux is not a screenshot authority.

## Scenario structure

```text
tests/e2e/
  001-responsive-shell/
    001-responsive-shell.spec.ts
    README.md                 # generated from step metadata after helper lands
    screenshots/
  helpers/
    game-actions.ts
    test-step-helper.ts
```

Number scenarios by coherent user journey. Extend an existing scenario when a slice continues it naturally. Add a new number when it introduces a new setup or product narrative. Never commit skipped or focused tests.

## Scenario map

| Scenario | Browser proof |
| --- | --- |
| `001-responsive-shell` | Root construction lobby, Firebase readiness, installable metadata, phone/desktop layout. |
| `002-dwarven-caravans` | Three isolated identities create/join, set up, place an Agent on the production board, converge, and replay after reload. |
| `003-ordinary-agent-families` | Remaining ordinary board families, exact payments/choices, observer convergence. |
| `004-agent-placement-and-scouts` | Icon legality, payments, occupancy, infiltration, intelligence draw, deployment. |
| `005-reveal-acquire-and-reshuffle` | Muster, Influence spending, market refill, Reserve, trash, reshuffle. |
| `006-factions-council-and-captain` | Thresholds, favors, Alliance transfer, permanent upgrades. |
| `007-battle-fate-rewards-and-control` | Strength, Fate pass loop, ties, rewards, Standards, Banners, cleanup. |
| `008-ents-dam-and-doubled-reward` | Protected summon rejection, breach, Ent Strength and exact doubled exclusions. |
| `009-complete-match` | Riches, Recall, end trigger, Endgame Fate, tiebreak, rematch. |
| `010-war-efforts` | Optional module lifecycle. |
| `011-rivals` | Solo and two-player deterministic automation. |
| `012-reconnect-conflicts-and-versioning` | Offline recovery, duplicate/stale events, incompatible versions. |
| `013-responsive-accessible-complete-game` | Complete game at phone portrait, landscape, tablet, and desktop. |

## High-value rule fixtures

E2E should prove representative paths, while Vitest exhausts:

- all 22 destination costs, requirements, and placement icons;
- all nine Scout-post connection sets and every infiltration collision;
- every card-instance conservation boundary and empty-deck reshuffle;
- faction 2/4 crossings, drops, regain, and Alliance ties;
- deployment limits for newly recruited versus garrison Companies;
- all tie shapes for three and four players;
- Ent doubling for every reward atom and every explicit exclusion;
- all Battle/Objective Standard pair combinations;
- every Commander timing and once-per-round reset;
- every Fate timing window and invalid target;
- all Rival profile choices and difficulty adjustments;
- every Endgame trigger and ordered tiebreak.

## Responsive gates

Target viewports:

| Name | Viewport |
| --- | --- |
| phone | 393×852 |
| mobile landscape | 852×393 |
| tablet | 820×1180 |
| desktop | 1280×960 |

At each target, tests assert `document.documentElement.scrollWidth <= clientWidth`, every visible enabled control has an accessible name, and primary controls meet the minimum target size. The complete-game scenario additionally proves that the active hand, legal destinations, confirmation control, and cancel path can all be reached without changing browser zoom.

## Failure artifacts

Retain Playwright traces, DOM snapshots, console output, and the HTML report for every CI failure. A multiplayer failure should log the last accepted event ID and reducer diagnostic for every seat, but never production credentials. Generated walkthroughs describe intent and assertions so a reviewer can understand a scenario without reading test code.
